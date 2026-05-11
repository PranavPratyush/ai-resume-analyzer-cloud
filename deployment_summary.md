# AI Resume Analyzer — Cloud Deployment Summary

## Project Overview
**Project Title:** AI Resume Analyzer
**Course:** Cloud Computing Technology and Architectures (AI364TA)
**Institution:** RV College of Engineering, Department of AI & ML
**Developer:** Pranav Pratyush

## Cloud Infrastructure
Originally planned for Google Cloud Platform (GCP), the application was successfully deployed to **Hugging Face Spaces** using a Docker-based serverless architecture. This pivot was made to utilize Hugging Face's free, high-performance container hosting environment which simplifies the deployment of ML-heavy applications.

### Cloud Services Utilized:
*   **Hugging Face Spaces:** Serverless container hosting platform.
*   **GitHub Actions:** Automated CI/CD pipeline for testing and deployment.
*   **Git LFS:** Managed storage for large binary assets (PDFs, images).
*   **Hugging Face Hub:** Container registry and version control for the deployed app.
*   **UptimeRobot:** External monitoring and availability tracking.

## Architecture Diagram (ASCII)
```text
  [ Developer Laptop ]
          │
          │ (git push)
          ▼
    [ GitHub Repo ] ──────────┐
          │                   │
          │ (Triggers)        │ (Syncs)
          ▼                   ▼
  [ GitHub Actions ] ───▶ [ Hugging Face Space ]
    (Tests Code)              (Builds Docker)
          │                         │
          │                         │ (Serves App)
          │                         ▼
          └───────────────▶ [ End User Browser ]
                               (Port 7860)
```

## Deployment Process Summary
1.  **Containerization:** The application was wrapped in a production-ready Dockerfile using `python:3.9-slim`.
2.  **Database Migration:** Migrated from a local MySQL instance to a serverless-friendly SQLite database (`resume_data.db`) to ensure statelessness.
3.  **CI/CD Pipeline:** Configured GitHub Actions to automatically run basic sanity tests and sync the repository to the Hugging Face Space on every push to `main`.
4.  **Asset Management:** Integrated Git LFS to handle resume samples and project screenshots that exceeded standard Git size limits.
5.  **Environment Config:** Set up Hugging Face metadata (YAML frontmatter) to define the SDK (Docker) and application port (7860).

## Challenges Faced & Solutions
*   **GCP Billing Constraints:** Encountered credit card verification issues with GCP. **Solution:** Migrated to Hugging Face Spaces which provides a similar container-based "Cloud Run" style experience for free.
*   **Binary File Rejections:** Hugging Face rejected standard git pushes containing PDFs. **Solution:** Initialized Git LFS to track `.pdf`, `.png`, and `.jpg` files.
*   **Port Mapping:** Standard Streamlit runs on 8501, but HF expects 7860. **Solution:** Modified the Dockerfile CMD to force Streamlit to listen on port 7860.

## Live Demo
**Application URL:** [https://huggingface.co/spaces/00pranav00/resume-analyze](https://huggingface.co/spaces/00pranav00/resume-analyze)
