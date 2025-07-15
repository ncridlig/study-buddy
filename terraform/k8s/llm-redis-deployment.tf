resource "kubernetes_deployment_v1" "llm-redis" {
  metadata {
    name = "llm-redis"
    labels = {
      app = "llm-redis"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "llm-redis"
      }
    }

    template {
      metadata {
        labels = {
          app = "llm-redis"
        }
      }

      spec {
        # This is where read/write permission to buckets is assigned to this pod
        service_account_name = kubernetes_service_account.llm_k8s_sa.metadata[0].name

        volume {
          name = "llm-redis-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.llm-redis_pvc.metadata[0].name
          }
        }

        container {
          name  = "llm-redis" # # Must match the VPA container name
          image = "redis:alpine"

          command = [
            "redis-server", "--appendonly", "yes", "--appendfsync", "everysec"
          ]

          port {
            container_port = 6379
          }

          volume_mount {
            name       = "llm-redis-storage"
            mount_path = "/data"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "1000m"
              memory = "1Gi"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "llm-redis" {
  metadata {
    name = "llm-rd"
  }

  spec {
    selector = {
      app = "llm-redis"
    }

    port {
      port        = 6379
      target_port = 6379
    }

    type = "ClusterIP"
  }
}


# Vertical pod autoscaler for redis db of backend
resource "kubernetes_manifest" "llm_redis_vpa" {
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "llm-rd-vpa"
      namespace = "default"
    }
    spec = {
      targetRef = {
        kind       = "Deployment"
        name       = kubernetes_deployment_v1.llm-redis.metadata[0].name
        apiVersion = "apps/v1"
      }
      updatePolicy = {
        updateMode = "Auto"
      }
      resourcePolicy = {
        containerPolicies = [
          {
            containerName = "llm-redis" # Must match the deployment container name
            mode          = "Auto"
            controlledResources = [
              "cpu",
              "memory"
            ]
            minAllowed = {
              cpu    = "50m"
              memory = "64Mi"
            }
            maxAllowed = {
              cpu    = "2000m"
              memory = "2Gi"
            }
          }
        ]
      }
    }
  }
}
