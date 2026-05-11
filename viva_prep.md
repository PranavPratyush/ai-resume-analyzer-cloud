# Viva Preparation — AI Resume Analyzer

Prepare these answers for your project demonstration. Even though we used Hugging Face, you should be able to explain the cloud concepts (Containers, CI/CD, Registry) which apply to GCP, AWS, and Azure.

---

### Q1: What is the core cloud architecture of your project?
**Answer:** The project follows a **Serverless Container Architecture**. We containerized the Streamlit application using Docker and deployed it to Hugging Face Spaces. The code is hosted on GitHub, and a CI/CD pipeline (GitHub Actions) automatically syncs and deploys updates.
*   **Technical Term:** "Stateless Containerized Workload"
*   **Follow-up:** "Why is it called stateless?" (Because the container doesn't save data to its own disk; it would be lost on restart. We use a managed DB or persistent storage for data).

### Q2: Why did you use Docker for this deployment?
**Answer:** Docker ensures that the app runs exactly the same on my laptop as it does in the cloud. It packages the Python interpreter, complex dependencies like `spaCy` and `NLTK`, and the application code into a single "image."
*   **Technical Term:** "Environment Parity"
*   **Follow-up:** "What is the difference between an Image and a Container?" (An Image is the blueprint; a Container is the running instance).

### Q3: Explain your CI/CD pipeline.
**Answer:** We use **GitHub Actions**. Every time I push code to the `main` branch, the pipeline triggers. It first runs a "Test" job to check for Python syntax errors and verify dependencies. If tests pass, it runs a "Sync" job that pushes the code to the Hugging Face production environment.
*   **Technical Term:** "Automated Build-Test-Deploy Cycle"
*   **Follow-up:** "What is the benefit of a CI/CD pipeline?" (Reduces manual errors and ensures only tested code reaches production).

### Q4: Why did you switch from MySQL to SQLite?
**Answer:** MySQL requires a persistent server or a cloud service like Google Cloud SQL, which can be expensive and complex to set up for a small project. SQLite is a file-based database that lives inside the container, making it ideal for self-contained, serverless deployments.
*   **Technical Term:** "Embedded Database Engine"
*   **Follow-up:** "How do you handle concurrency in SQLite?" (SQLite uses file-level locking; for high-traffic apps, we would migrate back to a managed SQL service).

### Q5: What is Git LFS and why did you use it?
**Answer:** Standard Git is not designed to handle large binary files like PDFs or High-Res images. Hugging Face enforces **Git LFS (Large File Storage)** to store these assets efficiently without bloating the repository's history.
*   **Technical Term:** "Binary Asset Tracking"
*   **Follow-up:** "What happens if you push a 50MB file without LFS?" (Most cloud providers like GitHub or Hugging Face will reject the push).

### Q6: How do you monitor your application's health?
**Answer:** We use **UptimeRobot**, an external monitoring service. It pings the application's URL every 5 minutes. If the app goes down, it sends an immediate email alert. We also use Streamlit's built-in health checks.
*   **Technical Term:** "Synthetic Monitoring"
*   **Follow-up:** "What is an Uptime SLA?" (Service Level Agreement; a guarantee of how much time the app will be live, e.g., 99.9%).

### Q7: Explain the specific lines in your Dockerfile.
**Answer:**
1. `FROM python:3.9-slim`: Uses a lightweight base image.
2. `RUN pip install`: Installs dependencies.
3. `RUN python -m spacy download`: Pre-downloads NLP models to save time at runtime.
4. `CMD`: Specifies the entry point command to start Streamlit on the correct port.
*   **Technical Term:** "Layer Caching" (Docker only rebuilds changed parts to save time).

### Q8: What is "Cloud Run" (GCP) and how does it compare to your deployment?
**Answer:** Google Cloud Run is a serverless platform for running Docker containers. Hugging Face Spaces works very similarly: you provide a Dockerfile, and it automatically manages the server, scaling, and public URL for you. Both are "Platform as a Service" (PaaS) offerings.
*   **Technical Term:** "Knative-based Autoscaling"
*   **Follow-up:** "What is 'Scale to Zero'?" (A cost-saving feature where the cloud turns off the app when no one is using it).
