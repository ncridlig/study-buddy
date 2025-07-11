resource "google_project_iam_member" "storage_access_sa_storage_viewer" {
    project = var.gcp_project_id
    role    = "roles/storage.objectViewer"
    member  = "serviceAccount:${data.terraform_remote_state.gke.outputs.storage-sa-email}"
}

resource "google_service_account_iam_member" "allow_impersonation" {
    service_account_id = data.terraform_remote_state.gke.outputs.storage-sa-name
    role               = "roles/iam.serviceAccountTokenCreator"
    member             = "serviceAccount:${data.terraform_remote_state.gke.outputs.gke-sa-email}"
}