resource "kubernetes_secret_v1" "backend_env" {
    metadata {
        name = "backend-env"
    }

    data = {
        SECRET_KEY                  = var.SECRET_KEY
        DEBUG                       = var.DEBUG
        NAME                        = var.NAME
        USER                        = var.USER
        PASSWORD                    = var.PASSWORD
        HOST                        = var.HOST
        PORT                        = var.PORT
        REDIS_HOST                  = var.REDIS_HOST
        DJANGO_SUPERUSER_EMAIL      = var.DJANGO_SUPERUSER_EMAIL
        DJANGO_SUPERUSER_FIRSTNAME  = var.DJANGO_SUPERUSER_FIRSTNAME
        DJANGO_SUPERUSER_LASTNAME   = var.DJANGO_SUPERUSER_LASTNAME
        DJANGO_SUPERUSER_PASSWORD   = var.DJANGO_SUPERUSER_PASSWORD
        DJANGO_SETTINGS_MODULE      = var.DJANGO_SETTINGS_MODULE
        ALLOWED_HOSTS               = var.ALLOWED_HOSTS
        ALLOWED_ORIGINS             = var.ALLOWED_ORIGINS
        LLM_SERVICE_URL             = var.LLM_SERVICE_URL
        CSRF_TRUSTED_ORIGINS        = var.CSRF_TRUSTED_ORIGINS
        ON_CLOUD                    = var.ON_CLOUD
        GS_PROJECT_ID               = var.gcp_project_id
        GS_BUCKET_STATIC_NAME       = var.GS_BUCKET_STATIC_NAME
        GS_BUCKET_MEDIA_NAME        = var.GS_BUCKET_MEDIA_NAME
        # GOOGLE_APPLICATION_CREDENTIALS = var.GOOGLE_APPLICATION_CREDENTIALS
    }

    type = "Opaque"
}
