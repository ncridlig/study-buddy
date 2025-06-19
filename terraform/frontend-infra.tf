# A separate Artifact Registry repository for the frontend service
resource "google_artifact_registry_repository" "frontend_docker_repo" {
  location      = var.gcp_region
  repository_id = "study-buddy-frontend-images"
  description   = "Docker repository for the study-buddy frontend"
  format        = "DOCKER"
}

# Cloud Run service for the frontend web server
resource "google_cloud_run_v2_service" "frontend_service" {
  name     = "study-buddy-frontend"
  location = var.gcp_region
  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.frontend_docker_repo.repository_id}/frontend:latest"
      ports {
        container_port = 80
      }
    }
  }
}

# Allow public access to the frontend website
resource "google_cloud_run_service_iam_member" "allow_public_frontend" {
  location = google_cloud_run_v2_service.frontend_service.location
  project  = google_cloud_run_v2_service.frontend_service.project
  service  = google_cloud_run_v2_service.frontend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the final URL of the deployed frontend
output "frontend_url" {
  description = "The URL of the deployed frontend service."
  value       = google_cloud_run_v2_service.frontend_service.uri
}