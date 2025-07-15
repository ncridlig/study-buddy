resource "kubernetes_deployment_v1" "backend" {
    metadata {
        name = "backend"
        labels = {
            app = "backend"
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                app = "backend"
            }
        }

        template {
            metadata {
                labels = {
                    app = "backend"
                }
                annotations = {
                    "gke-gcsfuse/volumes" = "true"
                }
            }

            spec {

                # This is where read/write permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.backend_k8s_sa.metadata[0].name

                container {
                    name  = "backend"
                    image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/backend:latest"
                    # image = "europe-west1-docker.pkg.dev/gruppo-11/microservice-docker-repo/backend:debug"

                    env_from {
                        secret_ref {
                        name = "backend-env"
                        }
                    }

                    env {
                        name = "POD_IP"
                        value_from {
                            field_ref {
                                field_path = "status.podIP"
                            }
                        }
                    }

                    port {
                        container_port = 8000
                    }

                    command = ["/bin/sh", "-c"]

                    args = [
                        "python /app/manage.py collectstatic --noinput && python /app/manage.py migrate && python /app/manage.py init_admin && daphne -b 0.0.0.0 -p 8000 study.asgi:application"
                    ]  

                    resources {
                        requests = {
                            cpu    = "300m"
                            memory = "512Mi"
                        }

                        limits = {
                            cpu    = "1500m"
                            memory = "2Gi"
                        }
                    }
                    
                    liveness_probe {
                        http_get {
                            path = "/healthz"
                            port = 8000
                        }
                        initial_delay_seconds = 10
                        period_seconds        = 20
                        timeout_seconds       = 2
                        failure_threshold     = 3
                        success_threshold     = 1
                        }

                        readiness_probe {
                        http_get {
                            path = "/healthz"
                            port = 8000
                        }
                        initial_delay_seconds = 5
                        period_seconds        = 10
                        timeout_seconds       = 2
                        failure_threshold     = 3
                        success_threshold     = 1
                        }

                    # Mount the volumes inside the container
                    volume_mount {
                        name       = "gcsfuse-media-volume"
                        mount_path = "/app/media"
                        read_only  = true
                    }
                    volume_mount {
                        name       = "gcsfuse-static-volume"
                        mount_path = "/app/staticfiles"
                        read_only  = true
                    }
                }
                # Define the CSI volumes for GCS Fuse
                volume {
                name = "gcsfuse-media-volume"

                csi {
                    driver = "gcsfuse.csi.storage.gke.io"
                    volume_attributes = {
                    bucketName   = "media-volume"
                    mountOptions = "implicit-dirs"
                    }
                }
                }
                volume {
                name = "gcsfuse-static-volume"

                csi {
                    driver = "gcsfuse.csi.storage.gke.io"
                    volume_attributes = {
                    bucketName   = "static-volume"
                    mountOptions = "implicit-dirs"
                    }
                }
                }
            }
        }
    }
}

# FOR DEV
# resource "kubernetes_service_v1" "backend" {
#     metadata {
#         name = "backend"
#     }

#     spec {
#         selector = {
#         app = "backend"
#         }

#         port {
#         protocol    = "TCP"
#         port        = 8000
#         target_port = 8000
#         }

#         type = "ClusterIP"
#     }
# }

# FOR PROD
resource "kubernetes_service_v1" "backend_internal" {
  metadata {
    name = "backend-internal"

    # annotations = {
    #   "cloud.google.com/neg" : "{\"ingress\": true}",
    #   "cloud.google.com/backend-config" : "{\"default\": \"api-sec-config\"}"
    # }
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      protocol    = "TCP"
      port        = 80 
      target_port = 8000 
    }

    type = "LoadBalancer"
  }
}

# Resource: Horizontal Pod Autoscaler V2
resource "kubernetes_horizontal_pod_autoscaler_v2" "backend_hpa" {
    metadata {
        name = "backend-hpa" 
    }

    spec {
        min_replicas = 1
        max_replicas = 10

        scale_target_ref {
            api_version = "apps/v1"
            kind        = "Deployment"
            name        = kubernetes_deployment_v1.backend.metadata[0].name 
        }
        metric {
            type = "Resource"
            resource {
                name = "cpu"
                target {
                    type               = "Utilization"
                    average_utilization = 60
                }
            }
        }

        metric {
            type = "Resource"
            resource {
                name = "memory"
                target {
                    type               = "Utilization"
                    average_utilization = 70
                }
            }
        }
    }
}

# resource "kubernetes_manifest" "api_backendconfig" {
#   manifest = {
#     "apiVersion" = "cloud.google.com/v1"
#     "kind"       = "BackendConfig"
#     "metadata" = {
#       "name"      = "api-sec-config"
#       "namespace" = "default"
#     }
#     # "spec" = {
#     #   # This block attaches the WAF policy
#     #   "securityPolicy" = {
#     #     "name" = google_compute_security_policy.waf_policy.name
#     #   }
#     # }
#   }
# }