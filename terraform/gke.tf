resource "google_container_cluster" "primary" {
  name     = "microservice-cluster"
  location = var.gcp_region

  remove_default_node_pool = true
  initial_node_count       = 1

  networking_mode = "VPC_NATIVE"

  # Enable basic auth and dashboard
  addons_config {
    http_load_balancing {
      disabled = false
    }
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-pool"
  cluster    = google_container_cluster.primary.name
  location   = var.gcp_region

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  initial_node_count = 2
}
