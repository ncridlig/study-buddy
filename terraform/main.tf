provider "google" {
  project = var.project_id
  region  = var.region
}

# 1) Enable Container Analysis API (auto-scans pushed images)
resource "google_project_service" "container_analysis" {
  project = var.project_id
  service = "containeranalysis.googleapis.com"
}

# 2) Artifact Registry repo for frontend images
resource "google_artifact_registry_repository" "frontend" {
  project       = var.project_id
  location      = var.region
  repository_id = "frontend"
  format        = "DOCKER"
}

# 3) Grant Cloud Build SA rights to write images
data "google_project" "project" {}

resource "google_project_iam_member" "cb_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# 4) (Optional) Store Snyk token in Secret Manager and grant CB access
resource "google_secret_manager_secret" "snyk_token" {
  secret_id  = "snyk-token"
  replication { automatic = true }
}

resource "google_secret_manager_secret_version" "snyk_token_version" {
  secret      = google_secret_manager_secret.snyk_token.id
  secret_data = var.snyk_token
}

resource "google_secret_manager_secret_iam_binding" "cb_snyk_access" {
  secret_id = google_secret_manager_secret.snyk_token.id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"]
}

# 5) Cloud Build trigger: every push to main
resource "google_cloudbuild_trigger" "frontend" {
  name    = "ci-frontend"
  project = var.project_id

  github {
    owner = var.github_org
    name  = var.github_repo
    push {
      branch = "main"
    }
  }

  filename = "frontend/cloudbuild.yaml"
}
