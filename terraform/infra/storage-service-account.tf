resource "google_service_account" "storage_access_sa" {
    account_id   = "${local.name}-storage-access-sa"
    display_name = "${local.name} Storage Access Service Account"
}

output "storage-sa-email" {
    value = google_service_account.storage_access_sa.email
}

output "storage-sa-name" {
    value = google_service_account.storage_access_sa.name
}