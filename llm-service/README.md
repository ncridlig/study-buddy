---

This is the LLM-service for the study-buddy project.

The main part is a celery worker which has study_friend, the inference LLM engine, built as a local package. Then there is an API which connects this service to the backend. Finally, there is redis store for persistence across different queries. It uses topics, image conversion storage, and finally the markdown output which is what is rendered by the frontend.

---

## ⚙️ Setup Instructions

### 1. 🔐 Create a `.env` file

Make a copy of `.env.production.example` and rename it as `.env`. Then edit `.env` file as follows:

- `REDIS_HOST`  
  Set a name for redis database of LLM-service. Keep this in mind that this must be different from the name used for redis database in backend `.env` file.

- `BACKEND_URL`  
  If you intend to use the current docker compose file, then set this variable to `http://web:8000/result/llm_callback/` or `http://web/result/llm_callback/`. In case you decided to modify backend service name, change these address accordingly.

- _Asynchronous Heavy LLM Jobs_ Configs  
  `ASYNC_JOB_MAX_RETRIES`=maximum number of times that LLM-Service retries to send the results to backend(in case backend was down for any reason)
  `ASYNC_JOB_RETRY_DELAY`=period to wait between each retry(in seconds)
  `ASYNC_JOB_TIMEOUT`=period to keep and not delete the results(in seconds)
  `MARK_LEFTOVER_RESULT_KEY`=the name of the key to add to the dictionary result of a task. It is used to mark the tasks whose results have been produced, but the transfer of results to backend have been unsuccessful.
  `MARK_DANGLING_RESULT_KEY`=the name of the key to add to the dictionary result of a task. It is used to mark the tasks whose results are dangling.

## 2. 📦 Create Docker volumes and network

you must create the external volumes and network used by docker-compose.yml:

```bash
docker volume create rd2-data
docker network create llm-app-network
```

Mount the `Media` volume of backend to have access to the files as well:

```bash
docker volume create media_volume
```

To establish the communication of backend and LLM-Service, you need to build the bridge between them:

```bash
docker network create shared-bridge
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

- Swagger API Docs: http://localhost:8001/docs/
- The primary API is /llm-callback.

---

## 🧹 Clean Up

To stop and remove all containers:

```bash
docker-compose down -v
```

## 🧠 LLM 
The image extraction and large language model inference lives in the study_friend package. To run locally:

```bash
cd study_friend
python3.11 -m venv venv
source venv/bin/activate
python -m pip install . 
```