from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import pandas as pd
import base64
import random
import time
import datetime
import os
import socket
import platform
import geocoder
import secrets
import io
from cloud_logger import log_info, log_error, log_warning
from geopy.geocoders import Nominatim

# Try importing NLP parsing libraries with a fallback for local development
try:
    from pyresparser import ResumeParser
    from pdfminer3.layout import LAParams
    from pdfminer3.pdfpage import PDFPage
    from pdfminer3.pdfinterp import PDFResourceManager, PDFPageInterpreter
    from pdfminer3.converter import TextConverter
    HAS_NLP_PARSER = True
except ImportError:
    HAS_NLP_PARSER = False

from Courses import ds_course, web_course, android_course, ios_course, uiux_course, resume_videos, interview_videos

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

DATABASE = 'resume_data.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    return conn

# Initialize tables
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create user_data table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_data (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        sec_token varchar(20) NOT NULL,
        ip_add varchar(50) NULL,
        host_name varchar(50) NULL,
        dev_user varchar(50) NULL,
        os_name_ver varchar(50) NULL,
        latlong varchar(50) NULL,
        city varchar(50) NULL,
        state varchar(50) NULL,
        country varchar(50) NULL,
        act_name varchar(50) NOT NULL,
        act_mail varchar(50) NOT NULL,
        act_mob varchar(20) NOT NULL,
        Name varchar(500) NOT NULL,
        Email_ID VARCHAR(500) NOT NULL,
        resume_score VARCHAR(8) NOT NULL,
        Timestamp VARCHAR(50) NOT NULL,
        Page_no VARCHAR(5) NOT NULL,
        Predicted_Field TEXT NOT NULL,
        User_level TEXT NOT NULL,
        Actual_skills TEXT NOT NULL,
        Recommended_skills TEXT NOT NULL,
        Recommended_courses TEXT NOT NULL,
        pdf_name varchar(50) NOT NULL
    );
    """)
    
    # Create user_feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_feedback (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_name varchar(50) NOT NULL,
        feed_email VARCHAR(50) NOT NULL,
        feed_score VARCHAR(5) NOT NULL,
        comments VARCHAR(100) NULL,
        Timestamp VARCHAR(50) NOT NULL
    );
    """)
    conn.commit()
    conn.close()

init_db()

# PDF Reader helper (if parser is active)
def pdf_reader(file_path):
    if not HAS_NLP_PARSER:
        return ""
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle, laparams=LAParams())
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    with open(file_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh, caching=True, check_extractable=True):
            page_interpreter.process_page(page)
    text = fake_file_handle.getvalue()
    converter.close()
    fake_file_handle.close()
    return text

# Serve Built React Frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    if not request.path.startswith('/api/'):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"error": "Not Found"}), 404

# Health check
@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "nlp_parser_loaded": HAS_NLP_PARSER})

# API Endpoint: Analyze Resume
@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        act_name = request.form.get('name', '')
        act_mail = request.form.get('email', '')
        act_mob = request.form.get('mobile', '')
        
        if not act_name or not act_mail or not act_mob:
            return jsonify({"error": "Required fields (name, email, mobile) are missing"}), 400
            
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400
            
        os.makedirs('./Uploaded_Resumes', exist_ok=True)
        pdf_name = file.filename
        save_path = os.path.join('./Uploaded_Resumes', pdf_name)
        file.save(save_path)
        
        log_info(f"New resume uploaded: {pdf_name}")
        
        # Geolocation & Metadata
        sec_token = secrets.token_urlsafe(12)
        host_name = socket.gethostname()
        ip_add = socket.gethostbyname(host_name)
        
        try:
            dev_user = os.getlogin()
        except:
            dev_user = os.environ.get('USER', os.environ.get('USERNAME', 'cloud_user'))
            
        os_name_ver = platform.system() + " " + platform.release()
        city, state, country, latlong = "NA", "NA", "NA", "NA"
        try:
            g = geocoder.ip('me')
            if g and g.latlng:
                latlong = str(g.latlng)
                geolocator = Nominatim(user_agent="AI-Resume-Analyzer-Project")
                location = geolocator.reverse(g.latlng, language='en')
                if location and 'address' in location.raw:
                    address = location.raw['address']
                    city = address.get('city', address.get('town', address.get('village', 'NA')))
                    state = address.get('state', 'NA')
                    country = address.get('country', 'NA')
        except Exception as e:
            log_warning(f"Geolocation failed: {e}")

        # Local fallback if libraries are missing
        if not HAS_NLP_PARSER:
            log_info(f"Using development mock parser for: {pdf_name}")
            
            # Select random predicted field and matching courses
            fields = ['Data Science', 'Web Development', 'Android Development', 'IOS Development', 'UI-UX Development']
            predicted_field = random.choice(fields)
            
            if predicted_field == 'Data Science':
                skills = ['Python', 'SQL', 'Machine Learning', 'Tensorflow', 'Pandas']
                rec_skills = ['Data Visualization','Predictive Analysis','Statistical Modeling','Data Mining','Clustering & Classification','Data Analytics','Quantitative Analysis','Web Scraping','ML Algorithms','Keras','Pytorch','Probability','Scikit-learn','Tensorflow',"Flask",'Streamlit']
                rec_course = ds_course
            elif predicted_field == 'Web Development':
                skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node JS']
                rec_skills = ['React','Django','Node JS','React JS','php','laravel','Magento','wordpress','Javascript','Angular JS','c#','Flask','SDK']
                rec_course = web_course
            elif predicted_field == 'Android Development':
                skills = ['Java', 'Kotlin', 'XML', 'Android Studio']
                rec_skills = ['Android','Android development','Flutter','Kotlin','XML','Java','Kivy','GIT','SDK','SQLite']
                rec_course = android_course
            elif predicted_field == 'IOS Development':
                skills = ['Swift', 'Objective-C', 'Xcode', 'Cocoa']
                rec_skills = ['IOS','IOS Development','Swift','Cocoa','Cocoa Touch','Xcode','Objective-C','SQLite','Plist','StoreKit',"UI-Kit",'AV Foundation','Auto-Layout']
                rec_course = ios_course
            else:
                skills = ['Figma', 'Sketch', 'UI Design', 'Wireframing']
                rec_skills = ['UI','User Experience','Adobe XD','Figma','Zeplin','Balsamiq','Prototyping','Wireframes','Storyframes','Adobe Photoshop','Editing','Illustrator','After Effects','Premier Pro','Indesign','Wireframe','Solid','Grasp','User Research']
                rec_course = uiux_course
                
            mock_score = random.randint(75, 95)
            mock_score_breakdown = {
                "Objective/Summary": True,
                "Education": True,
                "Experience": True,
                "Internship": True,
                "Skills": True,
                "Hobbies": False,
                "Interests": True,
                "Achievements": True,
                "Certifications": True,
                "Projects": True
            }
            
            ts = time.time()
            cur_date = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
            cur_time = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
            timestamp = f"{cur_date}_{cur_time}"
            
            # Save to DB
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO user_data (
                sec_token, ip_add, host_name, dev_user, os_name_ver, latlong, city, state, country,
                act_name, act_mail, act_mob, Name, Email_ID, resume_score, Timestamp, Page_no,
                Predicted_Field, User_level, Actual_skills, Recommended_skills, Recommended_courses, pdf_name
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                str(sec_token), str(ip_add), host_name, dev_user, os_name_ver, str(latlong), city, state, country,
                act_name, act_mail, act_mob, act_name, act_mail,
                str(mock_score), timestamp, "2", predicted_field, "Intermediate",
                str(skills), str(rec_skills), str(rec_course), pdf_name
            ))
            conn.commit()
            conn.close()
            
            with open(save_path, "rb") as f:
                base64_pdf = base64.b64encode(f.read()).decode('utf-8')
                
            return jsonify({
                "name": act_name,
                "email": act_mail,
                "mobile": act_mob,
                "degree": "B.E. in Computer Science & Engineering",
                "pages": 2,
                "experience_level": "Intermediate",
                "skills": skills,
                "predicted_field": predicted_field,
                "recommended_skills": rec_skills,
                "recommended_courses": rec_course[:5],
                "score": mock_score,
                "score_breakdown": mock_score_breakdown,
                "resume_video": random.choice(resume_videos),
                "interview_video": random.choice(interview_videos),
                "pdf_base64": base64_pdf
            })

        # --- REAL NLP PARSER RUNS HERE (PRODUCTION CONTAINER) ---
        resume_data = ResumeParser(save_path).get_extracted_data()
        if not resume_data:
            log_error(f"Failed to parse or extract data from resume: {pdf_name}")
            return jsonify({"error": "Failed to extract text from PDF resume"}), 500
            
        resume_text = pdf_reader(save_path)
        
        cand_level = 'Fresher'
        no_of_pages = resume_data.get('no_of_pages', 1)
        if no_of_pages < 1:
            cand_level = "NA"
        elif any(x in resume_text for x in ['INTERNSHIP', 'INTERNSHIPS', 'Internship', 'Internships']):
            cand_level = "Intermediate"
        elif any(x in resume_text for x in ['EXPERIENCE', 'WORK EXPERIENCE', 'Experience', 'Work Experience']):
            cand_level = "Experienced"
            
        ds_keyword = ['tensorflow','keras','pytorch','machine learning','deep learning','flask','streamlit']
        web_keyword = ['react', 'django', 'node js', 'react js', 'php', 'laravel', 'magento', 'wordpress','javascript', 'angular js', 'c#', 'asp.net', 'flask']
        android_keyword = ['android','android development','flutter','kotlin','xml','kivy']
        ios_keyword = ['ios','ios development','swift','cocoa','cocoa touch','xcode']
        uiux_keyword = ['ux','adobe xd','figma','zeplin','balsamiq','ui','prototyping','wireframes','storyframes','adobe photoshop','photoshop','editing','adobe illustrator','illustrator','adobe after effects','after effects','adobe premier pro','premier pro','adobe indesign','indesign','solid','grasp','user research','user experience']
        n_any = ['english','communication','writing', 'microsoft office', 'leadership','customer management', 'social media']
        
        recommended_skills = []
        reco_field = 'NA'
        rec_course = []
        
        skills_lower = [s.lower() for s in resume_data.get('skills', [])]
        log_info(f"Skills detected: {resume_data.get('skills', [])}")
        
        for skill in skills_lower:
            if skill in ds_keyword:
                reco_field = 'Data Science'
                recommended_skills = ['Data Visualization','Predictive Analysis','Statistical Modeling','Data Mining','Clustering & Classification','Data Analytics','Quantitative Analysis','Web Scraping','ML Algorithms','Keras','Pytorch','Probability','Scikit-learn','Tensorflow',"Flask",'Streamlit']
                rec_course = ds_course
                break
            elif skill in web_keyword:
                reco_field = 'Web Development'
                recommended_skills = ['React','Django','Node JS','React JS','php','laravel','Magento','wordpress','Javascript','Angular JS','c#','Flask','SDK']
                rec_course = web_course
                break
            elif skill in android_keyword:
                reco_field = 'Android Development'
                recommended_skills = ['Android','Android development','Flutter','Kotlin','XML','Java','Kivy','GIT','SDK','SQLite']
                rec_course = android_course
                break
            elif skill in ios_keyword:
                reco_field = 'IOS Development'
                recommended_skills = ['IOS','IOS Development','Swift','Cocoa','Cocoa Touch','Xcode','Objective-C','SQLite','Plist','StoreKit',"UI-Kit",'AV Foundation','Auto-Layout']
                rec_course = ios_course
                break
            elif skill in uiux_keyword:
                reco_field = 'UI-UX Development'
                recommended_skills = ['UI','User Experience','Adobe XD','Figma','Zeplin','Balsamiq','Prototyping','Wireframes','Storyframes','Adobe Photoshop','Editing','Illustrator','After Effects','Premier Pro','Indesign','Wireframe','Solid','Grasp','User Research']
                rec_course = uiux_course
                break
            elif skill in n_any:
                reco_field = 'NA'
                recommended_skills = ['No Recommendations']
                rec_course = "Sorry! Not Available for this Field"
                break
                
        resume_score = 0
        score_breakdown = {}
        
        if 'Objective' in resume_text or 'Summary' in resume_text:
            resume_score += 6
            score_breakdown['Objective/Summary'] = True
        else:
            score_breakdown['Objective/Summary'] = False
            
        if any(x in resume_text for x in ['Education', 'School', 'College']):
            resume_score += 12
            score_breakdown['Education'] = True
        else:
            score_breakdown['Education'] = False
            
        if any(x in resume_text for x in ['EXPERIENCE', 'Experience']):
            resume_score += 16
            score_breakdown['Experience'] = True
        else:
            score_breakdown['Experience'] = False
            
        if any(x in resume_text for x in ['INTERNSHIPS', 'INTERNSHIP', 'Internships', 'Internship']):
            resume_score += 6
            score_breakdown['Internship'] = True
        else:
            score_breakdown['Internship'] = False
            
        if any(x in resume_text for x in ['SKILLS', 'SKILL', 'Skills', 'Skill']):
            resume_score += 7
            score_breakdown['Skills'] = True
        else:
            score_breakdown['Skills'] = False
            
        if any(x in resume_text for x in ['HOBBIES', 'Hobbies']):
            resume_score += 4
            score_breakdown['Hobbies'] = True
        else:
            score_breakdown['Hobbies'] = False
            
        if any(x in resume_text for x in ['INTERESTS', 'Interests']):
            resume_score += 5
            score_breakdown['Interests'] = True
        else:
            score_breakdown['Interests'] = False
            
        if any(x in resume_text for x in ['ACHIEVEMENTS', 'Achievements']):
            resume_score += 13
            score_breakdown['Achievements'] = True
        else:
            score_breakdown['Achievements'] = False
            
        if any(x in resume_text for x in ['CERTIFICATIONS', 'Certifications', 'Certification']):
            resume_score += 12
            score_breakdown['Certifications'] = True
        else:
            score_breakdown['Certifications'] = False
            
        if any(x in resume_text for x in ['PROJECTS', 'PROJECT', 'Projects', 'Project']):
            resume_score += 19
            score_breakdown['Projects'] = True
        else:
            score_breakdown['Projects'] = False

        selected_resume_vid = random.choice(resume_videos)
        selected_interview_vid = random.choice(interview_videos)
        
        ts = time.time()
        cur_date = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        cur_time = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        timestamp = f"{cur_date}_{cur_time}"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        courses_str = str(rec_course)
        skills_str = str(resume_data.get('skills', []))
        rec_skills_str = str(recommended_skills)
        
        cursor.execute("""
        INSERT INTO user_data (
            sec_token, ip_add, host_name, dev_user, os_name_ver, latlong, city, state, country,
            act_name, act_mail, act_mob, Name, Email_ID, resume_score, Timestamp, Page_no,
            Predicted_Field, User_level, Actual_skills, Recommended_skills, Recommended_courses, pdf_name
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            str(sec_token), str(ip_add), host_name, dev_user, os_name_ver, str(latlong), city, state, country,
            act_name, act_mail, act_mob, resume_data.get('name', 'NA'), resume_data.get('email', 'NA'),
            str(resume_score), timestamp, str(no_of_pages), reco_field, cand_level,
            skills_str, rec_skills_str, courses_str, pdf_name
        ))
        conn.commit()
        conn.close()
        
        log_info(f"Analysis complete for resume: {pdf_name}. Predicted Field: {reco_field}")
        
        with open(save_path, "rb") as f:
            base64_pdf = base64.b64encode(f.read()).decode('utf-8')
            
        return jsonify({
            "name": resume_data.get('name', 'NA'),
            "email": resume_data.get('email', 'NA'),
            "mobile": resume_data.get('mobile_number', 'NA'),
            "degree": resume_data.get('degree', 'NA'),
            "pages": no_of_pages,
            "experience_level": cand_level,
            "skills": resume_data.get('skills', []),
            "predicted_field": reco_field,
            "recommended_skills": recommended_skills,
            "recommended_courses": rec_course[:5] if isinstance(rec_course, list) else rec_course,
            "score": resume_score,
            "score_breakdown": score_breakdown,
            "resume_video": selected_resume_vid,
            "interview_video": selected_interview_vid,
            "pdf_base64": base64_pdf
        })
        
    except Exception as e:
        log_error("Analysis failed", error=e)
        return jsonify({"error": str(e)}), 500

# API Endpoint: Submit Feedback
@app.route('/api/feedback', methods=['POST'])
def add_feedback():
    try:
        data = request.json
        feed_name = data.get('name', '')
        feed_email = data.get('email', '')
        feed_score = data.get('rating', '5')
        comments = data.get('comments', '')
        
        ts = time.time()
        cur_date = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        cur_time = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        timestamp = f"{cur_date}_{cur_time}"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO user_feedback (feed_name, feed_email, feed_score, comments, Timestamp)
        VALUES (?,?,?,?,?)
        """, (feed_name, feed_email, str(feed_score), comments, timestamp))
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success", "message": "Feedback recorded."})
    except Exception as e:
        log_error("Feedback recording failed", error=e)
        return jsonify({"error": str(e)}), 500

# API Endpoint: Get Feedbacks
@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        conn = get_db_connection()
        df = pd.read_sql('SELECT * FROM user_feedback', conn)
        conn.close()
        
        if df.empty:
            return jsonify({
                "ratings": {},
                "comments": []
            })
            
        ratings = df['feed_score'].value_counts().to_dict()
        comments_list = df[['feed_name', 'comments', 'Timestamp']].to_dict(orient='records')
        
        return jsonify({
            "ratings": ratings,
            "comments": comments_list
        })
    except Exception as e:
        log_error("Get feedback failed", error=e)
        return jsonify({"error": str(e)}), 500

# API Endpoint: Admin Login
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == 'admin' and password == 'admin@resume-analyzer':
        return jsonify({"status": "success", "token": "authenticated_admin_session"})
    return jsonify({"error": "Wrong ID & Password Provided"}), 401

# API Endpoint: Get Admin Dashboard Data
@app.route('/api/admin/data', methods=['GET'])
def get_admin_data():
    try:
        token = request.headers.get('Authorization')
        if token != 'authenticated_admin_session':
            return jsonify({"error": "Unauthorized"}), 401
            
        conn = get_db_connection()
        user_df = pd.read_sql('SELECT * FROM user_data', conn)
        feed_df = pd.read_sql('SELECT * FROM user_feedback', conn)
        conn.close()
        
        users_list = user_df.to_dict(orient='records')
        feedbacks_list = feed_df.to_dict(orient='records')
        
        stats = {}
        if not user_df.empty:
            stats['total_users'] = int(user_df['ID'].count())
            stats['fields_distribution'] = user_df['Predicted_Field'].value_counts().to_dict()
            stats['levels_distribution'] = user_df['User_level'].value_counts().to_dict()
            stats['scores_distribution'] = user_df['resume_score'].value_counts().to_dict()
            stats['ip_distribution'] = user_df['ip_add'].value_counts().to_dict()
            stats['city_distribution'] = user_df['city'].value_counts().to_dict()
            stats['state_distribution'] = user_df['state'].value_counts().to_dict()
            stats['country_distribution'] = user_df['country'].value_counts().to_dict()
        else:
            stats = {
                'total_users': 0,
                'fields_distribution': {},
                'levels_distribution': {},
                'scores_distribution': {},
                'ip_distribution': {},
                'city_distribution': {},
                'state_distribution': {},
                'country_distribution': {}
            }
            
        return jsonify({
            "users": users_list,
            "feedbacks": feedbacks_list,
            "stats": stats
        })
    except Exception as e:
        log_error("Admin metrics retrieval failed", error=e)
        return jsonify({"error": str(e)}), 500

# API Endpoint: Download Report CSV
@app.route('/api/admin/download', methods=['GET'])
def admin_download_csv():
    try:
        conn = get_db_connection()
        df = pd.read_sql("""
            SELECT ID, sec_token, ip_add, act_name, act_mail, act_mob, Predicted_Field, Timestamp, Name, Email_ID, resume_score, Page_no, pdf_name, User_level, Actual_skills, Recommended_skills, Recommended_courses, city, state, country, latlong, os_name_ver, host_name, dev_user 
            FROM user_data
        """, conn)
        conn.close()
        
        csv_data = df.to_csv(index=False)
        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=User_Data.csv'
        }
    except Exception as e:
        log_error("CSV generation failed", error=e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
