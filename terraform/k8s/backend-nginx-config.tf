resource "kubernetes_config_map_v1" "nginx_config" {
    metadata {
        name = "nginx-config"
    }

    data = {
        "nginx.conf" = <<EOF
    worker_processes 1;

    events {
        worker_connections 1024;
    }

    http {
        client_max_body_size 50M;

        upstream backend {
            server backend:8000;
        }

        include /etc/nginx/mime.types;

        server {
            listen       8080;
            server_name  localhost;

            location /static/ {
                alias /app/staticfiles/;
            }

            location /media/ {
                alias /app/media/;
            }

            location / {
                proxy_pass http://backend;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            location /ws/ {
                proxy_pass http://backend;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host \$host;
            }
        }
    }
    EOF
    }
}
