resource "kubernetes_secret_v1" "frontend_env" {
    metadata {
        name = "frontend-env"
    }

    data = {
        NEXT_PUBLIC_API_URL       = var.NEXT_PUBLIC_API_URL 
    }

    type = "Opaque"
}
