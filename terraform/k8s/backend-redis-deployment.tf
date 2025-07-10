resource "kubernetes_deployment_v1" "redis" {
    metadata {
        name = "redis"
        labels = {
            app = "redis"
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                app = "redis"
            }
        }

        template {
            metadata {
                labels = {
                    app = "redis"
                }
            }

            spec {
                # This is where read/write permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.backend_k8s_sa.metadata[0].name

                volume {
                    name = "redis-storage"
                    persistent_volume_claim {
                        claim_name = kubernetes_persistent_volume_claim_v1.rd1_pvc.metadata[0].name
                    }
                }

                container {
                    name  = "redis"       # # Must match the VPA container name
                    image = "redis:alpine"

                    command = [
                        "redis-server", "--appendonly", "yes", "--appendfsync", "everysec"
                    ]

                    port {
                        container_port = 6379
                    }

                    volume_mount {
                        name       = "redis-storage"
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

resource "kubernetes_service_v1" "redis" {
    metadata {
        name = "rd"
    }

    spec {
        selector = {
            app = "redis"
        }

        port {
            port        = 6379
            target_port = 6379
        }

        type = "ClusterIP"
    }
}


# Vertical pod autoscaler for redis db of backend
resource "kubernetes_manifest" "myapp1_vpa" {
    manifest = {
        apiVersion = "autoscaling.k8s.io/v1"
        kind       = "VerticalPodAutoscaler"
        metadata = {
            name      = "rd1-vpa"
            namespace = "default"
        }
        spec = {
            targetRef = {
                kind       = "Deployment"
                name       = kubernetes_deployment_v1.redis.metadata[0].name 
                apiVersion = "apps/v1"
            }
            updatePolicy = {
                updateMode = "Auto"
            }
            resourcePolicy = {
                containerPolicies = [
                    {
                        containerName       = "redis"  # Must match the deployment container name
                        mode                = "Auto"
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
