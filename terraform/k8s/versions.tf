terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.10"
    }

    kubernetes = {
      source = "hashicorp/kubernetes"
      version = ">= 2.37.1"
    }
  }

  backend "gcs" {
    bucket = "sb-terraform-on-gcp"
    prefix = "dev/k8s"
  }
}

# module "backend-deployment" {
#   source = "./microservice-backend"

#   # env vars
#   SECRET_KEY                  = var.SECRET_KEY
#   DEBUG                       = var.DEBUG
#   NAME                        = var.NAME
#   USER                        = var.USER
#   PASSWORD                    = var.PASSWORD
#   HOST                        = var.HOST
#   PORT                        = var.PORT
#   REDIS_HOST                  = var.REDIS_HOST
#   DJANGO_SUPERUSER_EMAIL      = var.DJANGO_SUPERUSER_EMAIL
#   DJANGO_SUPERUSER_FIRSTNAME  = var.DJANGO_SUPERUSER_FIRSTNAME
#   DJANGO_SUPERUSER_LASTNAME   = var.DJANGO_SUPERUSER_LASTNAME
#   DJANGO_SUPERUSER_PASSWORD   = var.DJANGO_SUPERUSER_PASSWORD
#   DJANGO_SETTINGS_MODULE      = var.DJANGO_SETTINGS_MODULE
#   ALLOWED_HOSTS               = var.ALLOWED_HOSTS
#   ALLOWED_ORIGINS             = var.ALLOWED_ORIGINS
#   LLM_SERVICE_URL             = var.LLM_SERVICE_URL
#   CSRF_TRUSTED_ORIGINS        = var.CSRF_TRUSTED_ORIGINS

#   # # tf resources names
#   # service_account_name        = kubernetes_service_account.backend_k8s_sa.metadata[0].name
#   # redis_pvc_name              = kubernetes_persistent_volume_claim_v1.rd1_pvc.metadata[0].name
# }
