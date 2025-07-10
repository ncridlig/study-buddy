resource "google_storage_bucket" "static" {
    name          = var.static_bucket_name
    location      = var.gcp_region
    force_destroy = true # Set to false in production
    uniform_bucket_level_access = true
}

resource "google_storage_bucket" "media" {
    name          = var.media_bucket_name
    location      = var.gcp_region
    force_destroy = true # Set to false in production
    uniform_bucket_level_access = true
}

# Admin permission for static
resource "google_storage_bucket_iam_member" "static_writer" {
    bucket = google_storage_bucket.static.name
    role   = "roles/storage.objectAdmin"
    member = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Admin permission for media
resource "google_storage_bucket_iam_member" "media_writer" {
    bucket = google_storage_bucket.media.name
    role   = "roles/storage.objectAdmin"
    member = "serviceAccount:${google_service_account.gke_sa.email}"
}

output "static_bucket_name" {
    value = google_storage_bucket.static.name
}

output "media_bucket_name" {
    value = google_storage_bucket.media.name
}