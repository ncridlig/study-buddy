data "terraform_remote_state" "gke"{
    backend = "gcs"
    config = {
        bucket = "sb-terraform-on-gcp"
        prefix = "dev/gke-public-cluster"
    } 
}

output "p1_gke_cluster_name" {
    value = data.terraform_remote_state.gke.outputs.gke_cluster_name
}

output "p1_gke_cluster_location" {
    value = data.terraform_remote_state.gke.outputs.gke_cluster_location
}

output "nginx_static_ip_address" {
    value = data.terraform_remote_state.gke.outputs.nginx_static_ip_address
}