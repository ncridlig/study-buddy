## 🧱 Infrastructure and Deployment Modules

This part of the project handles the creation of infrastructure and the deployment of all three microservices.

### 📦 1. Infrastructure Provisioning (`/infra`)

This directory contains Terraform code for setting up infrastructure components that rarely change, such as:

- GKE cluster and node pools
- Google Cloud Storage buckets
- IAM roles and service accounts

Navigate to `/infra` and run the standard Terraform commands to provision these resources.

### 🚀 2. Microservice Deployment (`/k8s`)

This directory handles the deployment of the three microservices to Kubernetes and sets up:

- Kubernetes Deployments and Services
- Workload Identity bindings
- Access to PostgreSQL and Google Cloud Storage buckets

Each `.tf` file in this directory is named according to the microservice it configures:

- Files starting with `frontend_` → deploy the **Frontend**
- Files starting with `backend_` → deploy the **Backend**
- Files starting with `llm_` → deploy the **LLM Service**

Navigate to `/k8s` and run the standard Terraform commands to deploy the microservices.

---

Due to the large number of `.tf` files, a detailed breakdown is not provided here. However, each file is **self-explanatory**, and its purpose can be easily understood through file names or a quick Google search of the Terraform resource blocks inside.
