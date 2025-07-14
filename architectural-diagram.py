from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import GKE, ComputeEngine  # NodePool doesn't exist
from diagrams.gcp.network import VPC, ExternalIpAddresses
from diagrams.gcp.storage import GCS
from diagrams.gcp.security import Iam
from diagrams.k8s.compute import Pod
from diagrams.gcp.compute import GPU

# Define the diagram's appearance and direction
graph_attr = {
    "fontsize": "12",
    "bgcolor": "transparent"
}

# Define the main diagram context
with Diagram("GKE and Storage Architecture on GCP", show=False, graph_attr=graph_attr, direction="TB") as diag:
    
    # --- Networking ---
    static_ip = ExternalIpAddresses("Nginx Static IP")
    
    with Cluster("GCP Project ('gruppo-11')"):
        with Cluster("VPC ('myvpc')"):
            with Cluster("Subnet ('mysubnet')"):

                # --- GKE Cluster ---
                with Cluster("GKE Cluster"):
                    gke_cluster = GKE("gke_cluster")
                    
                    with Cluster("Node Pools"):
                        # Standard Node Pool for general workloads
                        with Cluster("Standard Pool ('nodepool_1')"):
                            standard_node = ComputeEngine("Node(s)")
                            nginx_pod = Pod("nginx-pod")
                            backend_pod = Pod("backend-pod")
                            standard_node - [nginx_pod, backend_pod]

                        # GPU Node Pool for specialized workloads
                        with Cluster("GPU Pool ('gpu_pool')"):
                            gpu_node = GPU("T4 GPU Node(s)")
                            llm_pod = Pod("llm-worker-pod")
                            gpu_node - llm_pod
                    
                    # Illustrate GCS Fuse CSI Driver connecting the cluster to storage
                    gke_cluster >> Edge(label="GCS Fuse CSI", style="dashed", color="grey")

        # --- Storage Layer ---
        with Cluster("Google Cloud Storage"):
            static_bucket = GCS("static-volume\n(Static Assets)")
            media_bucket = GCS("media-volume\n(User Uploads)")
            frontend_bucket = GCS("frontend-volume\n(Build Files)")

        # --- IAM and Service Accounts ---
        with Cluster("Service Accounts (IAM)"):
            gke_sa = Iam("gke-sa\n(Backend)")
            llm_sa = Iam("llm-sa\n(LLM Worker)")
            frontend_sa = Iam("frontend-sa\n(Frontend)")

    # --- Define Relationships and Data Flow ---
    
    # Ingress Traffic Flow
    static_ip >> nginx_pod >> backend_pod
    
    # Internal Service Communication
    backend_pod >> Edge(label="sends task") >> llm_pod
    llm_pod >> Edge(label="callback") >> backend_pod

    # IAM Permissions (Service Account -> GCS Bucket)
    gke_sa >> Edge(label="Object Admin") >> static_bucket
    gke_sa >> Edge(label="Object Admin") >> media_bucket
    llm_sa >> Edge(label="Object Viewer (Read-only)") >> media_bucket
    frontend_sa >> Edge(label="Object Admin") >> frontend_bucket
    
    # Pods using Service Accounts (Workload Identity)
    backend_pod >> Edge(label="uses", style="dotted", color="darkgreen") >> gke_sa
    llm_pod >> Edge(label="uses", style="dotted", color="darkgreen") >> llm_sa
    
    # Show GCS Fuse mount points for clarity
    gke_cluster >> media_bucket
