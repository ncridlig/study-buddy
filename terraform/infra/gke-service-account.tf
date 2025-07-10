resource "google_service_account" "gke_sa" {
    account_id   = "${local.name}-gke-sa"
    display_name = "${local.name} GKE Service Account"
}

output "gke-sa-email" {
    value = google_service_account.gke_sa.email
}

output "gke-sa-name" {
    value = google_service_account.gke_sa.name
}


######## A separate service account for LLM_Service ########
# resource "google_service_account" "llm_sa" {
#     account_id   = "${local.name}-llm-sa"
#     display_name = "${local.name} LLM Service Account"
# }
############################################################


######## Bind read-only IAM roles to the llm_sa ########
# resource "google_storage_bucket_iam_member" "static_reader_llm" {
#     bucket = google_storage_bucket.static.name
#     role   = "roles/storage.objectViewer"
#     member = "serviceAccount:${google_service_account.llm_sa.email}"
# }

# resource "google_storage_bucket_iam_member" "media_reader_llm" {
#     bucket = google_storage_bucket.media.name
#     role   = "roles/storage.objectViewer"
#     member = "serviceAccount:${google_service_account.llm_sa.email}"
# }
############################################################


######## Create the GKE Service account. Whichever pod that uses this service account is linked to GCP llm_sa ########
# resource "kubernetes_service_account" "llm_k8s_sa" {
#     metadata {
#         name      = "llm-k8s-sa"
#         namespace = "default"  # or your actual namespace
#         annotations = {
#             "iam.gke.io/gcp-service-account" = google_service_account.llm_sa.email
#         }
#     }
# }
############################################################


######## Allow impersonation (IAM policy binding) ########
# resource "google_service_account_iam_member" "llm_identity_binding" {
#     service_account_id = google_service_account.llm_sa.name
#     role               = "roles/iam.workloadIdentityUser"
#     member             = "serviceAccount:${var.gcp_project_id}.svc.id.goog[default/llm-k8s-sa]"
# }
############################################################


######## Lastly use this in terraform deployment codes (Dont uncomment here) ########
# spec:
#     serviceAccountName: llm-k8s-sa
############################################################
