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

    ######## THE GCS BUCKET DRIVER IS AUTOMATICALLY INSTALLED AND MANAGED WITH AUTOPILOT CLUSTERS, TURN THIS ON
    ######## IF YOU DO NOT WANT TO HAVE TO DESTROY AND CREATE THE CLUSTER EVERY TIME
    # Run the GKE Metadata Server on this node (necessary for gcs_fuse_csi_driver)
    node_config {
        workload_metadata_config {
            mode = "GKE_METADATA"
        }
    }

    # Allow mounting buckets
    addons_config {
        gcs_fuse_csi_driver_config {
            enabled = true
        }
    }
}
