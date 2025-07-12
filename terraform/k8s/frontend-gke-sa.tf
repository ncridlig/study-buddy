# Create a GKE ServiceAccount for frontend
resource "kubernetes_service_account" "frontend_k8s_sa" {
    metadata {
        name      = "${local.name}-frontend-k8s-sa"
        namespace = "default"        # Perhaps should be changed
        annotations = {
            "iam.gke.io/gcp-service-account" = data.terraform_remote_state.gke.outputs.frontend-sa-email
        }
    }
}

locals {
    frontend_ksa_name      = kubernetes_service_account.frontend_k8s_sa.metadata[0].name
    frontend_ksa_namespace = kubernetes_service_account.frontend_k8s_sa.metadata[0].namespace
    frontend_full_member   = "serviceAccount:${var.gcp_project_id}.svc.id.goog[${local.frontend_ksa_namespace}/${local.frontend_ksa_name}]"
}

# Allow impersonation
resource "google_service_account_iam_member" "frontend_identity_binding" {
    service_account_id = data.terraform_remote_state.gke.outputs.frontend-sa-name
    role               = "roles/iam.workloadIdentityUser"
    member             = local.frontend_full_member
}

resource "google_project_iam_member" "frontend_node_sa_artifactregistry_access" {
    project = var.gcp_project_id
    role    = "roles/artifactregistry.reader"
    member  = "serviceAccount:${data.terraform_remote_state.gke.outputs.frontend-sa-email}"
}
