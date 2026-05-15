import logging
import os

# Initialize default standard logger
# Azure Container Apps captures everything printed to stdout/stderr
logger = logging.getLogger("ResumeAnalyzer")
logger.setLevel(logging.INFO)

# Avoid adding multiple handlers if already configured
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

# Helper functions for consistent logging across the app
def log_info(message):
    logger.info(message)

def log_error(message, error=None):
    if error:
        logger.error(f"{message} | Error: {str(error)}")
    else:
        logger.error(message)

def log_warning(message):
    logger.warning(message)
