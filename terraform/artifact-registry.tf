# This also uses the default provider, creating the repo in 'gruppo-11'.
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.gcp_region
  repository_id = "study-buddy-images"
  description   = "Docker repository for study-buddy services"
  format        = "DOCKER"
}