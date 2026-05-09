# 1. Base image: python:3.9-slim (lightweight, GCP Cloud Run compatible)
FROM python:3.9-slim

# 9. Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 2. Set working directory to /app
WORKDIR /app

# 3. Install system dependencies needed for compiling C-extensions
# gcc and build-essential are required to build older versions of spacy, pyresparser, and pandas.
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements.txt first (for Docker layer caching)
COPY App/requirements.txt .

# 5. Install all Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 6. Download spaCy English model
RUN python -m spacy download en_core_web_sm

# 7. Download ALL required NLTK data
RUN python -c "import nltk; nltk.download('stopwords'); \
nltk.download('punkt'); nltk.download('averaged_perceptron_tagger'); \
nltk.download('universal_tagset'); nltk.download('maxent_ne_chunker'); \
nltk.download('words')"

# 8. Copy the entire application code
COPY . .

# Move working directory to App since App.py uses relative paths (like './Logo/')
WORKDIR /app/App

# 10. Expose port 7860 (Hugging Face default)
EXPOSE 7860

# 11. Set the Streamlit config to run on 0.0.0.0:7860
CMD ["streamlit", "run", "App.py", \
     "--server.port=7860", \
     "--server.address=0.0.0.0", \
     "--server.headless=true", \
     "--browser.gatherUsageStats=false"]
