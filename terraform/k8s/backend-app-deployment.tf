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
            }

            spec {

                # This is where read/write permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.backend_k8s_sa.metadata[0].name

                container {
                    name  = "backend"
                    image = "europe-west1-docker.pkg.dev/gruppo-11/microservice-docker-repo/backend:latest"
                    # image = "europe-west1-docker.pkg.dev/gruppo-11/microservice-docker-repo/backend:debug"

                    env_from {
                        secret_ref {
                        name = "backend-env"
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
                }
            }
        }
    }
}

resource "kubernetes_service_v1" "backend" {
    metadata {
        name = "backend"
    }

    spec {
        selector = {
        app = "backend"
        }

        port {
        protocol    = "TCP"
        port        = 8000
        target_port = 8000
        }

        type = "ClusterIP"
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