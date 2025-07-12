resource "kubernetes_deployment_v1" "llm-api" {
    metadata {
        name = "llm-api"
        labels = {
            app = "llm-api"
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                app = "llm-api"
            }
        }

        template {
            metadata {
                labels = {
                    app = "llm-api"
                }
            }

            spec {

                # This is where read permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.llm_k8s_sa.metadata[0].name

                container {
                    name  = "llm-api"
                    image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/llm-api:latest"
                    image_pull_policy = "Always"
                    # image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/llm-api:debug"

                    env_from {
                        secret_ref {
                        name = "llm-env"
                        }
                    }

                    port {
                        container_port = 8000
                    }

                    command = ["/bin/sh", "-c"]

                    args = [
                        "uvicorn app.main:app --host 0.0.0.0 --port 8000"
                    ]  

                    resources {
                        requests = {
                            cpu    = "100m"
                            memory = "128Mi"
                        }

                        limits = {
                            cpu    = "500m"
                            memory = "512Mi"
                        }
                    }

                    liveness_probe {
                        http_get {
                            path = "/healthz"
                            port = 8000
                        }
                        initial_delay_seconds = 10
                        period_seconds        = 10
                        timeout_seconds       = 3
                        failure_threshold     = 3
                        success_threshold     = 1
                    }
                }
            }
        }
    }
}

resource "kubernetes_service_v1" "llm-api" {
    metadata {
        name = "llm-api"
    }

    spec {
        selector = {
        app = "llm-api"
        }

        port {
        protocol    = "TCP"
        port        = 8000
        target_port = 8000
        }

        type = "LoadBalancer"
    }
}


# Resource: Horizontal Pod Autoscaler V2
resource "kubernetes_horizontal_pod_autoscaler_v2" "llm-api_hpa" {
    metadata {
        name = "llm-api-hpa" 
    }

    spec {
        min_replicas = 1
        max_replicas = 10

        scale_target_ref {
            api_version = "apps/v1"
            kind        = "Deployment"
            name        = kubernetes_deployment_v1.llm-api.metadata[0].name 
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