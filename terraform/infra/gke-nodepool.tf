resource "google_container_node_pool" "nodepool_1" {
    name       = "${local.name}-node-pool-1"
    location   = var.gcp_region
    cluster    = google_container_cluster.gke_cluster.name
    # node_count = 1  # Fixed-size node pool (scalling is manual)
    initial_node_count = 1 # Needs autoscalling and should not be use with "node_count"
    autoscaling {
        min_node_count = 1
        max_node_count = 3
        location_policy = "ANY"  
    }

    node_config {
        # preemptible  = true    # Spot VMs which are way cheaper, but max life is 24h
        machine_type = var.machine_type
        # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
        service_account = google_service_account.gke_sa.email
        oauth_scopes = [
            "https://www.googleapis.com/auth/cloud-platform",
        ]
    }
}
