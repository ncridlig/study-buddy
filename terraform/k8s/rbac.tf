# Give github-terraform@gruppo-11.iam.gserviceaccount.com permissions to modify the cluster
resource "kubernetes_role_v1" "terraform_secret_manager" {
  metadata {
    name      = "terraform-secret-manager"
    namespace = "default"
  }

  rule {
    api_groups = [""]
    resources  = [
      "secrets", 
      "deployments",
      "services"     
    ]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

resource "kubernetes_role_binding_v1" "terraform_manages_secrets" {
  metadata {
    name      = "terraform-manages-secrets"
    namespace = "default"
  }

  subject {
    kind = "User"
    name = "github-terraform@gruppo-11.iam.gserviceaccount.com"
  }

  role_ref {
    kind      = "Role"
    name      = kubernetes_role_v1.terraform_secret_manager.metadata[0].name
    api_group = "rbac.authorization.k8s.io"
  }
}