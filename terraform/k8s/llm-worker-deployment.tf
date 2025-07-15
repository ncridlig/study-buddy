resource "kubernetes_deployment_v1" "llm-worker" {
  metadata {
    name = "llm-worker"
    labels = {
      app = "llm-worker"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "llm-worker"
      }
    }

    template {
      metadata {
        labels = {
          app = "llm-worker"
        }
        annotations = {
          "gke-gcsfuse/volumes" = "true"
        }
      }

      spec {
        # The only service to use the non default GPU node pool

        toleration {
          key      = "accelerator"
          operator = "Equal"
          value    = "gpu"
          effect   = "NoSchedule"
        }

        # This is where read permission to buckets is assigned to this pod
        service_account_name = kubernetes_service_account.llm_k8s_sa.metadata[0].name

        container {
          name              = "llm-worker"
          image             = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/llm-worker:latest"
          image_pull_policy = "Always"
          # image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/llm-worker:debug"

          env_from {
            secret_ref {
              name = "llm-env"
            }
          }

          command = ["/bin/sh", "-c"]

          args = [
            "celery -A celery_worker.celery_app worker -l info"
          ]

          resources {
            requests = {
              cpu              = "0.5"
              memory           = "6Gi"
              "nvidia.com/gpu" = 1
            }
            limits = {
              cpu              = "3"
              memory           = "12Gi"
              "nvidia.com/gpu" = 1
            }
          }

          # Mount the volume inside the container
          volume_mount {
            name       = "gcsfuse-volume"
            mount_path = "/media-volume"
            read_only  = true
          }
        }

        # Define the CSI volume for GCS Fuse
        volume {
          name = "gcsfuse-volume"

          csi {
            driver = "gcsfuse.csi.storage.gke.io"
            volume_attributes = {
              bucketName   = "media-volume"
              mountOptions = "implicit-dirs"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "llm-worker" {
  metadata {
    name = "llm-worker"
  }

  spec {
    selector = {
      app = "llm-worker"
    }

    # Add at least one port even if unused
    port {
      name        = "dummy"
      port        = 5555
      target_port = 5555
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}


# Resource: Horizontal Pod Autoscaler V2
resource "kubernetes_horizontal_pod_autoscaler_v2" "llm-worker_hpa" {
  metadata {
    name = "llm-worker-hpa"
  }

  spec {
    min_replicas = 1
    max_replicas = 3

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment_v1.llm-worker.metadata[0].name
    }
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 90
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 90
        }
      }
    }
  }
}