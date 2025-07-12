# This file defines the Nginx configuration for serving the frontend application.
# It creates a Kubernetes ConfigMap that will be mounted into the Nginx pod.

resource "kubernetes_config_map_v1" "frontend_nginx_config" {
  metadata {
    name = "frontend-nginx-config"
  }

  data = {
    # This nginx.conf is tailored for a Single Page Application (SPA) like React, Vue, or Angular.
    "nginx.conf" = <<EOF
worker_processes auto;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Enable gzip compression for better performance
  gzip on;
  gzip_proxied any;
  gzip_comp_level 4;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  server {
    # Nginx will listen on port 80 inside the container.
    listen 80;
    server_name localhost;

    # The root directory where your frontend's static files are located.
    # This assumes your frontend container serves files from the /app/build directory.
    root /app/build;
    index index.html;

    # This location block is crucial for SPAs.
    # It ensures that any request not matching a static file is redirected to index.html,
    # allowing your client-side router (like React Router) to handle the URL.
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Optional: If you want to proxy API calls through this Nginx instance
    # to avoid CORS issues, you can add a location block like this.
    # location /api/ {
    #   # Assumes your llm-api service is named 'llm-api'
    #   proxy_pass http://llm-api:8000/;
    #   proxy_set_header Host $host;
    #   proxy_set_header X-Real-IP $remote_addr;
    #   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #   proxy_set_header X-Forwarded-Proto $scheme;
    # }
  }
}
EOF
  }
}
