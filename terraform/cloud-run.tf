# This uses the default provider, so it will be created in 'gruppo-11'.
resource "google_cloud_run_v2_service" "backend_api" {
  name     = "study-buddy-backend"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/study-buddy-images/backend:latest"
    }
  }
}

resource "google_cloud_run_service_iam_member" "allow_public_backend" {
  location = google_cloud_run_v2_service.backend_api.location
  project  = google_cloud_run_v2_service.backend_api.project
  service  = google_cloud_run_v2_service.backend_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}