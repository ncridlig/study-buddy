resource "google_cloud_run_v2_service" "frontend" {
  name     = "study-buddy-frontend"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.study_buddy_repo.repository_id}/frontend:${var.frontend_image_tag}"
      ports {
        container_port = 3000 # Adjust if your frontend uses a different port
      }
    }
  }
}

# Make the frontend service publicly accessible
resource "google_cloud_run_v2_service_iam_binding" "frontend_public_access" {
  project  = google_cloud_run_v2_service.frontend.project
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name

  role   = "roles/run.invoker"
  member = "allUsers"
}