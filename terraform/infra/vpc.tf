# Resource: VPC
resource "google_compute_network" "myvpc" {
    name = "${local.name}-vpc"
    auto_create_subnetworks = false   
}

# Resource: Subnet
resource "google_compute_subnetwork" "mysubnet" {
    name = "${local.name}-${var.gcp_region}-subnet"
    region = var.gcp_region
    ip_cidr_range = "10.128.0.0/20"
    network = google_compute_network.myvpc.id 
    private_ip_google_access = true
}