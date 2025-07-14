# architectural-diagram.py
from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import GKE
from diagrams.gcp.database import SQL, Memorystore
from diagrams.gcp.network import VPC, ExternalIpAddresses
from diagrams.gcp.storage import GCS
from diagrams.gcp.security import Iam, KMS
from diagrams.k8s.compute import Pod, Deployment, ReplicaSet
from diagrams.k8s.network import Service, Ingress
from diagrams.k8s.clusterconfig import HPA
from diagrams.onprem.network import Nginx
from diagrams.onprem.client import Users
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.container import Docker
from diagrams.onprem.queue import Celery
from diagrams.programming.framework import Django, NextJs
from diagrams.programming.language import Python

# Define the diagram's appearance and direction
graph_attr = {
    "fontsize": "12",
    "bgcolor": "transparent",
    "splines": "spline", # Use curved lines for a cleaner look
}

# Define the main diagram context
with Diagram("gke_and_storage_architecture_on_gcp", show=False, graph_attr=graph_attr, direction="LR") as diag:

    with Cluster("World Wide Web"):
        
        # --- External Resources ---
        user = Users("User/Browser", shape="actor")
        
        with Cluster("GCP Project ('gruppo-11')"):

            with Cluster("IAM"):
                gcp_sa = Iam("gke-sa")

            # --- Databases outside the GKE cluster ---
            with Cluster("Databases"):
                pg_sql = SQL("Cloud SQL\n(PostgreSQL)")

                  # --- Storage and IAM ---
            with Cluster("Google Cloud Storage"):
                static_bucket = GCS("static-volume")
                media_bucket = GCS("media-volume")
                
            with Cluster("VPC ('default')"):
                static_ip = Ingress("study-buddy.duckdns.org")

                # --- GKE Cluster ---
                with Cluster("GKE Cluster"):
                    gke_cluster = GKE("gke_cluster")
                    
                    with Cluster("Standard Node Pool ('nodepool_1')"):

                        # --- Frontend Services ---
                        with Cluster("Frontend"):
                            frontend_deploy = Deployment("frontend")
                            frontend_pods = [NextJs("frontend-pod-1"), NextJs("...")]
                            frontend_hpa = Docker("frontend-image")
                            frontend_svc = Service("frontend\n(ClusterIP)")
                            frontend_deploy - frontend_pods
                            frontend_hpa >> Edge(color="darkblue") >> frontend_deploy
                            frontend_pods >> frontend_svc
                        
                        # --- Backend Services ---
                        with Cluster("Backend"):
                            backend_deploy = Deployment("backend")
                            backend_pods = [Django("backend-pod-1"), Django("...")]
                            backend_hpa = Docker("backend-image")
                            backend_svc = Service("backend\n(ClusterIP)")
                            backend_deploy - backend_pods
                            backend_hpa >> Edge(color="darkblue") >> backend_deploy
                            backend_pods >> backend_svc

                        # --- Celery Workers ---
                        with Cluster("Async Workers"):
                            celery_deploy = Deployment("backend-celery")
                            celery_pods = [Celery("celery-worker-1"), Celery("...")]
                            celery_hpa = Docker("celery-image")
                            celery_deploy - celery_pods
                            celery_hpa >> Edge(color="darkblue") >> celery_deploy

                        # --- Ingress Proxy ---
                        with Cluster("Ingress"):
                            nginx_deploy = Deployment("backend-nginx")
                            nginx_pods = [Nginx("nginx-pod-1"), Nginx("...")]
                            nginx_hpa = Docker("nginx-image")
                            nginx_svc = Service("nginx\n(LoadBalancer)")
                            nginx_deploy - nginx_pods
                            nginx_hpa >> Edge(color="darkblue") >> nginx_deploy
                            nginx_pods >> nginx_svc

                        # --- In-memory Store ---
                        with Cluster("Cache / Message Broker"):
                            redis_deploy = Deployment("redis")
                            redis_pod = Redis("redis-pod")
                            redis_vpa = Docker("redis-image")
                            redis_svc = Service("rd\n(ClusterIP)")
                            redis_deploy - redis_pod
                            redis_vpa >> Edge(color="purple") >> redis_deploy
                            redis_pod >> redis_svc
                        
                    # --- GPU Node Pool ---
                    with Cluster("GPU Node Pool ('gpu_pool')"):
                        with Cluster("ML Workers"):
                            llm_deploy = Deployment("llm-worker")
                            llm_pods = [Python("llm-worker-pod-1"), Python("...")]
                            llm_hpa = Docker("llm-worker-image")
                            llm_deploy - llm_pods
                            llm_hpa >> Edge(color="darkblue") >> llm_deploy
                    
                    # --- Kubernetes Config ---
                    with Cluster("Kubernetes Configuration"):
                        k8s_secret = KMS("backend-env")
                        k8s_sa = Iam("backend-k8s-sa")
                        
    # --- Define Relationships ---
    
    # Ingress Traffic Flow
    user >> static_ip >> nginx_svc
    nginx_pods >> Edge(label="/") >> backend_svc
    
    # Backend Dependencies
    backend_pods >> Edge(label="DB queries") >> pg_sql
    backend_pods >> Edge(label="task queue") >> redis_svc
    backend_pods >> Edge(label="read/write", style="dashed", color="grey") >> media_bucket
    backend_pods >> Edge(label="write", style="dashed", color="grey") >> static_bucket
    
    # Celery Worker Dependencies
    celery_pods >> Edge(label="consumes from") >> redis_svc
    celery_pods >> Edge(label="DB queries") >> pg_sql
    celery_pods[0] >> Edge(label="sends task") >> llm_pods[0]
    celery_pods >> Edge(label="read", style="dashed", color="grey") >> static_bucket # As per file
    
    # LLM Worker Dependencies
    llm_pods >> Edge(label="read", style="dashed", color="grey") >> media_bucket
    llm_pods >> Edge(label="callback") >> backend_svc
    
    # Configuration and Identity
    for pod in backend_pods + celery_pods:
        k8s_secret >> Edge(label="mounts env") >> pod
    gcp_sa << Edge(label="impersonates (Workload Identity)", color="darkgreen") << k8s_sa
    k8s_sa >> Edge(label="is used by", style="dotted", color="darkgreen") >> backend_pods
    k8s_sa >> Edge(label="is used by", style="dotted", color="darkgreen") >> celery_pods
    k8s_sa >> Edge(label="is used by", style="dotted", color="darkgreen") >> nginx_pods

# Diagram is generated