# 1. Base image: python:3.9-slim
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

# Set up non-root user for security
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# 2. Set working directory
WORKDIR $HOME/app

# 3. Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements.txt first
COPY App/requirements.txt .

# 5. Install all Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6. Install spaCy English model
RUN pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-2.3.1/en_core_web_sm-2.3.1.tar.gz

# 7. Download required NLTK data
RUN mkdir -p /usr/local/share/nltk_data && chmod -R 777 /usr/local/share/nltk_data
RUN python -c "import nltk; \
    nltk.download('stopwords', download_dir='/usr/local/share/nltk_data'); \
    nltk.download('punkt', download_dir='/usr/local/share/nltk_data'); \
    nltk.download('averaged_perceptron_tagger', download_dir='/usr/local/share/nltk_data'); \
    nltk.download('universal_tagset', download_dir='/usr/local/share/nltk_data'); \
    nltk.download('maxent_ne_chunker', download_dir='/usr/local/share/nltk_data'); \
    nltk.download('words', download_dir='/usr/local/share/nltk_data')"

# 8. Copy the entire application code
COPY . .

# Set permissions for SQLite and uploads
RUN chmod -R 777 $HOME/app

# Switch to non-root user
USER user

# Move working directory to App
WORKDIR $HOME/app/App

# 10. Expose port 8000 (Azure Target Port)
EXPOSE 8000

# 11. Run Streamlit on port 8000
CMD ["streamlit", "run", "App.py", \
     "--server.port=8000", \
     "--server.address=0.0.0.0", \
     "--server.headless=true", \
     "--browser.gatherUsageStats=false"]
