# Enable necessary APIs for the project
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
}

resource "google_project_service" "artifactregistry_api" {
  service = "artifactregistry.googleapis.com"
}

resource "google_project_service" "iam_api" {
  service = "iam.googleapis.com"
}

# Create the Docker repository in Artifact Registry
resource "google_artifact_registry_repository" "study_buddy_repo" {
  project       = var.gcp_project_id
  location      = var.gcp_region
  repository_id = "study-buddy-repo"
  description   = "Docker repository for the Study Buddy application"
  format        = "DOCKER"

  # Ensure the Run API is enabled before creating the repo
  depends_on = [google_project_service.run_api]
}