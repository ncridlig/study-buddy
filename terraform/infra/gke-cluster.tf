resource "google_container_cluster" "gke_cluster" {
    name     = "${local.name}-gke-cluster"
    location = var.gcp_region

    remove_default_node_pool = true
    initial_node_count       = 1

    # Network
    network = google_compute_network.myvpc.self_link
    subnetwork = google_compute_subnetwork.mysubnet.self_link

    deletion_protection = false

    ### Workload Identity on GKE cluster and mapping GCP service account to GKE service account ###
    workload_identity_config {
        workload_pool = "${var.gcp_project_id}.svc.id.goog"
    }
    ###############################################################################################

    # Enable Vertical Pod Autoscaling
    vertical_pod_autoscaling {
        enabled = true
    } 
}
