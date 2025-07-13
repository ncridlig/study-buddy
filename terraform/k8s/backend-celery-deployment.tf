resource "kubernetes_deployment_v1" "backend_celery" {
    metadata {
        name = "backend-celery"
        labels = {
            app = "backend-celery"
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                app = "backend-celery"
            }
        }

        template {
            metadata {
                labels = {
                    app = "backend-celery"
                }
                annotations = {
                    "gke-gcsfuse/volumes" = "true"
                }
            }

            spec {
                # This is where read/write permission to buckets is assigned to this pod
                service_account_name = kubernetes_service_account.backend_k8s_sa.metadata[0].name

                container {
                    name  = "celery"
                    image = "europe-west1-docker.pkg.dev/gruppo-11/microservice-docker-repo/backend:latest"
                    # image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/backend:latest"

                    command = ["/bin/sh", "-c"]

                    args = [
                        "celery -A study worker -l info"
                    ]

                    env_from {
                        secret_ref {
                            name = "backend-env"
                        }
                    }

                    resources {
                        requests = {
                            cpu    = "250m"
                            memory = "256Mi"
                        }

                        limits = {
                            cpu    = "1000m"
                            memory = "1Gi"
                        }
                    }
                    # Mount the volume inside the container
                    volume_mount {
                        name       = "gcsfuse-static-volume"
                        mount_path = "/app/staticfiles"
                        read_only  = true
                    }
                }
                # Define the CSI volume for GCS Fuse
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


# Resource: Horizontal Pod Autoscaler V2
resource "kubernetes_horizontal_pod_autoscaler_v2" "backend_celery_hpa" {
    metadata {
        name = "backend-celery-hpa" 
    }

    spec {
        min_replicas = 1
        max_replicas = 10

        scale_target_ref {
            api_version = "apps/v1"
            kind        = "Deployment"
            name        = kubernetes_deployment_v1.backend_celery.metadata[0].name 
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
