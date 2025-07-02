resource "google_cloud_run_v2_service" "llm_service" {
  name     = "study-buddy-llm-service"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.study_buddy_repo.repository_id}/llm-service:${var.llm_service_image_tag}"
      ports {
        container_port = 8080 # Adjust if your service uses a different port
      }
    }
  }
}