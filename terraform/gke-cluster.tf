resource "google_container_cluster" "gke_cluster" {
    name     = "${local.name}-gke-cluster"
    location = var.gcp_region

    remove_default_node_pool = true
    initial_node_count       = 1

    # Network
    network = google_compute_network.myvpc.self_link
    subnetwork = google_compute_subnetwork.mysubnet.self_link

    deletion_protection = false
}
