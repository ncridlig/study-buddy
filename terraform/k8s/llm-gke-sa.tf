# Create a GKE ServiceAccount for llm
resource "kubernetes_service_account" "llm_k8s_sa" {
  metadata {
    name      = "${local.name}-llm-k8s-sa"
    namespace = "default" # Perhaps should be changed
    annotations = {
      "iam.gke.io/gcp-service-account" = data.terraform_remote_state.gke.outputs.llm-sa-email
    }
  }
}

locals {
  llm_ksa_name      = kubernetes_service_account.llm_k8s_sa.metadata[0].name
  llm_ksa_namespace = kubernetes_service_account.llm_k8s_sa.metadata[0].namespace
  llm_full_member   = "serviceAccount:${var.gcp_project_id}.svc.id.goog[${local.llm_ksa_namespace}/${local.llm_ksa_name}]"
}

# Allow impersonation
resource "google_service_account_iam_member" "llm_identity_binding" {
  service_account_id = data.terraform_remote_state.gke.outputs.llm-sa-name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.llm_full_member
}

resource "google_project_iam_member" "llm_gke_node_sa_artifactregistry_access" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${data.terraform_remote_state.gke.outputs.llm-sa-email}"
}