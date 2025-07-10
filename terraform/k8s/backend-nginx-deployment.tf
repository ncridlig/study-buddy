resource "kubernetes_deployment_v1" "backend_nginx" {
    metadata {
        name = "backend-nginx"
        labels = {
            app = "backend-nginx"
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                app = "backend-nginx"
            }
        }

        template {
            metadata {
                labels = {
                    app = "backend-nginx"
                }
            }

            spec {
                # This is where read/write permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.backend_k8s_sa.metadata[0].name

                volume {
                    name = "nginx-config"

                    config_map {
                        name = kubernetes_config_map_v1.nginx_config.metadata[0].name
                    }
                }

                container {
                    name  = "nginx"
                    image = "nginx:alpine"

                    port {
                        container_port = 8080
                    }

                    volume_mount {
                        name      = "nginx-config"
                        mount_path = "/etc/nginx/nginx.conf"
                        sub_path   = "nginx.conf"
                    }

                    resources {
                        requests = {
                            cpu    = "250m"
                            memory = "64Mi"
                        }

                        limits = {
                            cpu    = "1000m"
                            memory = "512Mi"
                        }
                    }
                }
            }
        }
    }
}

resource "kubernetes_service_v1" "nginx" {
    metadata {
        name = "nginx"
    }

    spec {
        selector = {
            app = "backend-nginx"
        }

        type             = "LoadBalancer"
        load_balancer_ip = "35.195.39.220"

        port {
            protocol    = "TCP"
            port        = 8080
            target_port = 8080
        }
    }
}


# Resource: Horizontal Pod Autoscaler V2
resource "kubernetes_horizontal_pod_autoscaler_v2" "nginx_hpa" {
    metadata {
        name = "nginx-hpa" 
    }

    spec {
        min_replicas = 1
        max_replicas = 8

        scale_target_ref {
            api_version = "apps/v1"
            kind        = "Deployment"
            name        = kubernetes_deployment_v1.backend_nginx.metadata[0].name 
        }
        metric {
            type = "Resource"
            resource {
                name = "cpu"
                target {
                    type                = "Utilization"
                    average_utilization = 50
                }
            }
        }
    }
}