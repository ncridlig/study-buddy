######## Service account for Backend ########
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
############################################################

######## A separate service account for LLM_Service ########
resource "google_service_account" "llm_sa" {
    account_id   = "${local.name}-llm-sa"
    display_name = "${local.name} LLM Service Account"
}

output "llm-sa-email" {
    value = google_service_account.llm_sa.email
}

output "llm-sa-name" {
    value = google_service_account.llm_sa.name
}
############################################################

######## A separate service account for Frontend ########
resource "google_service_account" "frontend_sa" {
    account_id   = "${local.name}-frontend-sa"
    display_name = "${local.name} Frontend Service Account"
}

output "frontend-sa-email" {
    value = google_service_account.frontend_sa.email
}

output "frontend-sa-name" {
    value = google_service_account.frontend_sa.name
}
