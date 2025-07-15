resource "kubernetes_secret_v1" "llm_env" {
  metadata {
    name = "llm-env"
  }

  data = {
    DEBUG                    = var.DEBUG
    REDIS_HOST               = var.REDIS_HOST_LLM
    BACKEND_URL              = var.BACKEND_URL
    ASYNC_JOB_MAX_RETRIES    = var.ASYNC_JOB_MAX_RETRIES
    ASYNC_JOB_RETRY_DELAY    = var.ASYNC_JOB_RETRY_DELAY
    ASYNC_JOB_TIMEOUT        = var.ASYNC_JOB_TIMEOUT
    MARK_LEFTOVER_RESULT_KEY = var.MARK_LEFTOVER_RESULT_KEY
    MARK_DANGLING_RESULT_KEY = var.MARK_DANGLING_RESULT_KEY
    STUDY_FRIEND_CUDA        = var.STUDY_FRIEND_CUDA
    GS_PROJECT_ID            = var.gcp_project_id
    GS_BUCKET_STATIC_NAME    = var.GS_BUCKET_STATIC_NAME
    GS_BUCKET_MEDIA_NAME     = var.GS_BUCKET_MEDIA_NAME
  }

  type = "Opaque"
}
