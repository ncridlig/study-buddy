resource "google_compute_address" "nginx_static_ip" {
    name   = "${local.name}-nginx-static-ip"
    region = var.gcp_region
}

output "nginx_static_ip_address" {
    value = google_compute_address.nginx_static_ip.address
}
