# architectural-diagram.py
from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import GKE
from diagrams.gcp.database import SQL, Memorystore
from diagrams.gcp.network import FirewallRules, ExternalIpAddresses
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
from diagrams.programming.framework import Django, NextJs, FastAPI
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
            ssl_cert = Ingress("study-buddy.duckdns.org")

            with Cluster("IAM"):
                gcp_storage_admin = Iam("Storage Admin Account")
                gcp_storage_read = Iam("Storage Read Account")

            # --- Databases outside the GKE cluster ---
            with Cluster("Cloud Database"):
                pg_sql = SQL("PostgreSQL 15\n(hr-prod-postgresql)")

                  # --- Storage and IAM ---
            with Cluster("Google Cloud Storage"):
                static_bucket = GCS("static-volume")
                media_bucket = GCS("media-volume")
                
            with Cluster("VPC ('default')"):   
                static_ip = ExternalIpAddresses("ingress_static_ip")

                # --- GKE Cluster ---
                with Cluster("GKE Cluster (hr-prod-gke-cluster)"):
                    gke_cluster = GKE("hr-prod-gke-cluster")
                    firewall = FirewallRules("/ingress Firewall")
                    k8s_env = KMS("K8s env")
                    #     k8s_sa = Iam("backend-k8s-sa")
                    
                    with Cluster("Standard Node Pool ('nodepool_1')"):

                        # --- Frontend Services ---
                        with Cluster("Frontend"):
                            frontend_deploy = Deployment("frontend")
                            frontend_pods = [NextJs("frontend-pod-1"), NextJs("...")]
                            frontend_hpa = Docker("frontend-image")
                            frontend_internal = Service("frontend-internal\n(Load balancer)")
                            frontend_deploy >> frontend_pods
                            frontend_hpa >> Edge(color="darkblue") >> frontend_deploy
                            frontend_pods - frontend_internal
                        
                        # --- Backend Services ---
                        with Cluster("Backend"):
                            backend_deploy = Deployment("backend")
                            backend_pods = [Django("backend-pod-1"), Django("...")]
                            backend_hpa = Docker("backend-image")
                            backend_internal = Service("backend-internal\n(Load balancer)")
                            backend_deploy >> backend_pods
                            backend_hpa >> Edge(color="darkblue") >> backend_deploy
                            backend_pods - backend_internal

                        # --- Backend Celery Workers ---
                        with Cluster("Backend Workers"):
                            celery_deploy = Deployment("backend-celery")
                            celery_pods = [Celery("celery-worker-1"), Celery("...")]
                            celery_hpa = Docker("celery-image")
                            celery_deploy >> celery_pods
                            celery_hpa >> Edge(color="darkblue") >> celery_deploy

                        # --- Backend Redis ---
                        with Cluster("Backend Cache"):
                            redis_deploy = Deployment("redis")
                            redis_pod = Redis("redis-pod")
                            redis_vpa = Docker("redis-image")
                            redis_svc = Service("rd\n(ClusterIP)")
                            redis_deploy - redis_pod
                            redis_vpa >> Edge(color="purple") >> redis_deploy
                            redis_pod - redis_svc

                        # --- LLM API ---
                        with Cluster("LLM FastAPI"):
                            llm_api_deploy = Deployment("llm-api")
                            llm_api_pods = [FastAPI("llm-api-pod-1"), FastAPI("...")]
                            llm_api_hpa = Docker("llm-api-image")
                            llm_api_deploy >> llm_api_pods
                            llm_api_hpa >> Edge(color="darkblue") >> llm_api_deploy
                            llm_api_svc = Service("llm-api\n(ClusterIP)")
                            llm_api_pods - llm_api_svc

                        # --- LLM Redis ---
                        with Cluster("LLM Cache"):
                            redis_deploy = Deployment("llm-redis")
                            redis_pod = Redis("llm-redis-pod")
                            redis_vpa = Docker("redis-image")
                            llm_redis_svc = Service("llm-rd\n(ClusterIP)")
                            redis_deploy >> redis_pod
                            redis_vpa >> Edge(color="purple") >> redis_deploy
                            redis_pod - llm_redis_svc
                        
                    # --- GPU Node Pool ---
                    with Cluster("GPU Node Pool ('gpu_pool')"):
                        
                        # --- LLM Celery Workers ---
                        with Cluster("LLM Workers"):
                            llm_worker_deploy = Deployment("llm-worker")
                            llm_worker_pods = [Celery("llm-worker-pod-1"), Celery("...")]
                            llm_worker_hpa = Docker("llm-worker-image")
                            llm_worker_deploy >> llm_worker_pods
                            llm_worker_hpa >> Edge(color="darkblue") >> llm_worker_deploy
            
                        
    # --- Define Relationships ---
    
    # Ingress Traffic Flow
    user >> ssl_cert >> static_ip >> firewall >> gke_cluster
    gke_cluster >> backend_internal
    gke_cluster >> frontend_internal

    # Frontend Dependencies
    
    # Backend Dependencies
    backend_internal >> Edge(label="task queue") >> redis_svc
    backend_internal >> Edge(label="read/write", style="dashed", color="grey") >> gcp_storage_admin
    
    # Backend Celery Worker Dependencies
    celery_pods[0] >> Edge(label="Cache queries") >> redis_svc
    celery_pods[0] >> Edge(label="send generation task") >> llm_api_svc
    celery_pods[0] >> Edge(label="read", style="dashed", color="grey") >> gcp_storage_admin
    
    # LLM API Dependencies
    llm_api_svc >> Edge(label="run generation task") >> llm_worker_pods[0]

    # LLM Worker Dependencies
    llm_worker_pods[0] >> Edge(label="Cache queries") >> llm_redis_svc
    llm_worker_pods[0] >> Edge(label="read", style="dashed", color="grey") >> gcp_storage_read
    llm_worker_pods[0] >> Edge(label="callback") >> backend_internal
    
    # Configuration and Identity
    for pod in backend_pods + llm_worker_pods:
        k8s_env >> pod
    gcp_storage_admin >> media_bucket
    gcp_storage_admin >> static_bucket
    gcp_storage_admin >> pg_sql
    gcp_storage_read  >> media_bucket

# Diagram is generated