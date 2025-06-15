# 📐 Study Buddy Infrastructure (Terraform on GCP)

This repository contains the Terraform configuration to provision and manage the **Study Buddy** infrastructure on **Google Cloud Platform** (GCP).

Study Buddy is a cloud-native service that generates exam questions from student-uploaded PDFs using serverless AI backends and distributed storage.

---

## 🗂 Directory Structure

```
terraform/
├── main.tf                  # Root entrypoint calling all modules
├── variables.tf             # Global input variables
├── outputs.tf               # Global outputs
├── terraform.tfvars         # Environment-specific inputs
├── modules/
│   ├── frontend/            # CDN, Cloud Storage for static files
│   ├── backend/             # Cloud Run services (upload, AI, delivery)
│   ├── database/            # Cloud SQL (PostgreSQL), Firestore
│   ├── secrets/             # GCP Secret Manager
│   ├── monitoring/          # Uptime checks, alerting policies
```

---

## ✅ Features

- **Modular Terraform setup** for better maintainability
- **Multi-region Cloud Run** services for backend scalability
- **Cloud Storage** (multi-region) for user-uploaded PDFs and result files
- **Cloud SQL + Firestore** for relational and real-time data needs
- **Cloud CDN** and load balancer for global frontend delivery
- **GCP Secret Manager** to securely store API keys and DB credentials
- **Monitoring, alerting, and logging** via Cloud Monitoring stack
- Supports **canary deployments**, **rollbacks**, and **autoscaling**

---

## 🚀 Getting Started

### 1. Prerequisites
- [Terraform](https://developer.hashicorp.com/terraform/install)
- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install)
- Billing-enabled GCP project

### 2. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project <YOUR_PROJECT_ID>
```

---

## ⚙️ Deployment Instructions

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
```

### 2. Configure Environment Variables

Edit `terraform.tfvars`:

```hcl
project_id    = "studybuddy-dev"
region        = "us-central1"
bucket_name   = "studybuddy-uploads"
backend_image = "gcr.io/studybuddy/pdf-service:latest"
...
```

### 3. Preview Changes

```bash
terraform plan -var-file="terraform.tfvars"
```

### 4. Apply Infrastructure

```bash
terraform apply -var-file="terraform.tfvars"
```

---

## 🧩 Modules Overview

### 🔹 `frontend/`
- Cloud Storage (multi-region) for static frontend
- Cloud CDN + Load Balancer for global delivery

### 🔹 `backend/`
- Cloud Run services for:
  - PDF upload handler
  - AI-powered question generation
  - Response delivery APIs

### 🔹 `database/`
- Cloud SQL (PostgreSQL) for metadata & auth
- Firestore for real-time state (optional)

### 🔹 `secrets/`
- GCP Secret Manager for:
  - OpenAI/Gemini API keys
  - DB credentials
  - App secrets

### 🔹 `monitoring/`
- Cloud Monitoring alert policies
- Uptime checks for Cloud Run services

---

## 🔒 Security Best Practices

- IAM with **least privilege**
- Use **Secret Manager** (never store secrets in code)
- Enable **Cloud Audit Logging**
- Secure backend with **API Gateway or Firebase Auth**

---

## 🧪 Environments

Supports multiple environments via `.tfvars`:

| File               | Environment |
|--------------------|-------------|
| `terraform.tfvars` | Default     |
| `dev.tfvars`       | Development |
| `prod.tfvars`      | Production  |

Deploy via:

```bash
terraform apply -var-file="prod.tfvars"
```

---

## 📌 Notes

- Firestore mode must be manually initialized (native vs. datastore)
- Use Cloud Build or GitHub Actions for CI/CD (Terraform plan/apply)

---

## 📞 Support

For infrastructure issues, open an issue or contact the DevOps team in `#studybuddy-devops`.

---

## 📄 License

MIT License