import logging
import os

# Initialize default standard logger
logger = logging.getLogger("ResumeAnalyzer")
logger.setLevel(logging.INFO)

# Avoid adding multiple handlers if already configured
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

# Try setting up Google Cloud Logging if on GCP
try:
    from google.cloud import logging as cloud_logging
    
    # Authenticate and set up the Cloud Logging client
    client = cloud_logging.Client()
    
    # Integrates the Cloud Logging handler with the standard Python logging module
    client.setup_logging()
    
    logging.info("Google Cloud Logging successfully initialized.")
except ImportError:
    logger.warning("google-cloud-logging module not found. Falling back to local logging.")
except Exception as e:
    logger.warning(f"Failed to initialize Google Cloud Logging. Falling back to local logging. Note: {e}")

# Helper functions
def log_info(message):
    logging.info(message)

def log_error(message, error=None):
    if error:
        logging.error(f"{message} | Error: {str(error)}")
    else:
        logging.error(message)

def log_warning(message):
    logging.warning(message)
