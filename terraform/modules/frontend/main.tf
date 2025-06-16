resource "google_cloud_run_service" "frontend" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      containers {
        image = var.image
        ports {
          container_port = 80
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  service = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role    = "roles/run.invoker"
  member  = "allAuthenticatedUsers"
}
