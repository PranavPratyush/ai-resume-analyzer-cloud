# Viva Preparation — AI Resume Analyzer (Azure Edition)

Prepare these answers for your project demonstration. This project uses a professional cloud-native stack on **Microsoft Azure**.

---

### Q1: What is the core cloud architecture of your project?
**Answer:** The project uses a **Serverless Container Architecture** on **Microsoft Azure**. 
*   **Hosting:** Azure Container Apps (serverless scaling).
*   **Storage:** Azure Container Registry (ACR) for private image hosting.
*   **Pipeline:** GitHub Actions for automated CI/CD.
*   **Technical Term:** "Serverless Container Orchestration"

### Q2: Why did you choose Azure Container Apps over standard Virtual Machines?
**Answer:** Virtual Machines (IaaS) require manual patching and management. **Azure Container Apps** is a "Serverless" service. It manages the underlying infrastructure for me, provides automatic HTTPS, and has a **"Scale to Zero"** feature which saves money by turning off the app when no one is using it.

### Q3: Explain your CI/CD pipeline using GitHub Actions.
**Answer:** It's a fully automated build-test-deploy cycle.
1.  **Trigger:** A push to the `main` branch.
2.  **Build:** GitHub tells Azure to build the Docker image using `az acr build`.
3.  **Deploy:** The pipeline updates the running Container App with the new image.
*   **Benefit:** "Zero-downtime deployments" and no manual intervention.

### Q4: What is the role of Azure Container Registry (ACR)?
**Answer:** ACR is a private storage locker for my Docker images. Instead of using a public registry like Docker Hub, ACR keeps my project images secure within my Azure subscription, allowing the Container App to pull them quickly over Azure's internal network.

### Q5: Why did you use Port 8000 instead of the default 8501 for Streamlit?
**Answer:** While Streamlit defaults to 8501, many cloud ingress controllers (like Azure's) prefer standard ports like 80 or 8000 for routing. We configured the Dockerfile to use 8000 and told the Azure Ingress to listen on that target port.

### Q6: How do you handle database persistence in a containerized environment?
**Answer:** Currently, we use **SQLite**, which is embedded. In a production environment with multiple instances, we would "decouple" the data by moving to **Azure SQL Database** or **Azure Files** for persistent storage, as containers are "stateless" (data is lost when the container restarts).

### Q7: What are Resource Groups in Azure?
**Answer:** A **Resource Group (RG)** is a logical container for resources deployed on Azure. I used `resume-rg` to group my Container App, Registry, and Environment together. This makes it easy to manage permissions and delete the entire project at once if needed.

### Q8: How does your application handle logs in the cloud?
**Answer:** We use **Azure Monitor**. My Python app prints logs to `stdout`, and Azure's Log Analytics agent automatically captures these logs. I can query them in the Azure Portal to see user activity or debug errors without needing to SSH into a server.
