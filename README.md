# study-buddy

This is the Scalable and Reliable Services repository.

# Objective

Based on the amazing work by Sangio:
[Study Friend](https://github.com/sangioai/study-friend)

We believe our project could be a great help to others, along with a great use case for the power of scalable services on the cloud. The plan is to create a “Study Friend” which ingests materials the user wants to learn, and then exports a PDF guide in question <-> answer pair format.

This will require a user interface where the PDF materials can be uploaded and downloaded, alongside backend storage to house them. The UI-UX will also have a signup, which we can use to rate limit users and keep their data sequestered. Finally, the killer feature will be an “Export to Anki” option, which creates flashcards that can be natively imported into this open source app.

Alongside the frontend and backend, we will need LLM capabilities. We propose to learn and apply Mistral’s chat API, which provides us with free access to a state of the art model. We will also create a privacy focused option, which leverages a module in the cloud we spin up with Qwen2.5, Deepseek, or other models found on HuggingFace. This provides us experience with two types of deployment.

We believe our project can run in the Function as Service (FaaS) stack, since Google Cloud will automatically scale to the number of users. If this level of abstraction does not provide enough flexibility we are comfortable with Docker and the Container as a Service (CaaS) framework. As of right now, the “Study Friend” concept works only locally.

# Building Bricks

1. Stateless Frontend (only user cookies are statefull)
2. Stateless AI (model inference)
3. Docker Backend (FastAPI)
4. Docker Database (POSTGres)

---

## ⚙️ Setup Instructions

### 1. 🔐 Create a `.env` file

Make a copy of `.env.production.example` and rename it as `.env`. Then edit `.env` file as follows:

- **Database** configurations. The following 3 variables are common between the current `.env` file you are currently building, and the `.env` from backend directory. In order not face conflict, they need to have similar values accross bothe `.env` files.  
  `NAME=your_db_name`
  `USER=your_db_user`
  `PASSWORD=your_db_password`

## 2. 📦 Create Docker volumes and network

you must create the external volumes and network used by docker-compose.yml:

```bash
docker volume create pgdata
docker volume create static_volume
docker volume create media_volume
docker volume create rd1-data
docker volume create rd2-data
docker network create app-network
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

- Admin Panel of backend: http://localhost/admin/
- Swagger API Docs of backend: http://localhost/docs/
- Swagger API Docs of llm service: http://localhost:8000/docs/

---

## 🧹 Clean Up

To stop and remove all containers:

```bash
docker-compose down -v
```
