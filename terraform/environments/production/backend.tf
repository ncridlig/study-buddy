resource "google_cloud_run_v2_service" "backend" {
  name     = "study-buddy-backend"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.study_buddy_repo.repository_id}/backend:${var.backend_image_tag}"
      ports {
        container_port = 8000 # Adjust if your backend uses a different port
      }
    }
  }
}