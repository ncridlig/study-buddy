# Create a GKE ServiceAccount for backend
resource "kubernetes_service_account" "backend_k8s_sa" {
  metadata {
    name      = "${local.name}-backend-k8s-sa"
    namespace = "default" # Perhaps should be changed
    annotations = {
      "iam.gke.io/gcp-service-account" = data.terraform_remote_state.gke.outputs.gke-sa-email
    }
  }
}

locals {
  ksa_name      = kubernetes_service_account.backend_k8s_sa.metadata[0].name
  ksa_namespace = kubernetes_service_account.backend_k8s_sa.metadata[0].namespace
  full_member   = "serviceAccount:${var.gcp_project_id}.svc.id.goog[${local.ksa_namespace}/${local.ksa_name}]"
}

# Allow impersonation
resource "google_service_account_iam_member" "backend_identity_binding" {
  service_account_id = data.terraform_remote_state.gke.outputs.gke-sa-name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.full_member
}

resource "google_project_iam_member" "gke_node_sa_artifactregistry_access" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${data.terraform_remote_state.gke.outputs.gke-sa-email}"
}
