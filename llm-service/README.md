This needs store user credentials and authenticate.
Then on a user by user basis, there needs to be storage by topic, and then pdf's which have been uploaded.
Also topics, need to have the image conversion storage, and finally the markdown output which is what is rendered by the frontend.

---

This is the LLM-service for the study-buddy project.

**The rest of explanations for LLM part need to be added**

---

## ⚙️ Setup Instructions

### 1. 🔐 Create a `.env` file

Make a copy of `.env.production.example` and rename it as `.env`. Then edit `.env` file as follows:

- `REDIS_HOST`  
  Set a name for redis database of LLM-service. Keep this in mind that this must be different from the name used for redis database in backend `.env` file.

- `BACKEND_URL`  
  If you intend to use the current docker compose file, then set this variable to `http://web:8000/result/llm_callback/` or `http://web/result/llm_callback/`. In case you decided to modify backend service name, change these address accordingly.

## 2. 📦 Create Docker volumes and network

you must create the external volumes and network used by docker-compose.yml:

```bash
docker volume create rd2-data
docker network create llm-app-network
```

## 3. 🚀 Run the containers

Start the application stack (remember to change directory to where `docker-compose.yml` file exists):

```bash
docker-compose up --build -d
```

You can check the state of containers:

```bash
docker ps -a
```

---

## 🌐 Accessing the Application

- Swagger API Docs: http://localhost/docs/

---

## 🧹 Clean Up

To stop and remove all containers:

```bash
docker-compose down -v
```
