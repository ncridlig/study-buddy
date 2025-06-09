# 📚 Study-Buddy Backend

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

This is the backend service for the study-buddy project, built with Django and Dockerized for easy deployment. It handles user authentication, topic and file management, and provides API documentation via Swagger.

---

## 🚀 Features

- 🔐 User authentication system
- 📂 Topic and file management
- 📝 API documentation with Swagger
- 🐳 Dockerized for easy deployment
- ⚙️ Configurable environment settings

---

✅ Prerequisites

- Docker & Docker Compose installed

- `.env` file with correct environment variables (see below)

---

## ⚙️ Setup Instructions

### 1. 🔐 Create a `.env` file

Make a copy of `.env.production.example` and rename it as `.env`. Then edit `.env` file as follows:

- **SECRET_KEY** for Django app
  SECRET_KEY = produce it using [djecrety](https://djecrety.ir/)
  <br />
- **DEBUG**
  DEBUG = True --> activating debug mode and see logs
  DEBUG = False --> in real world cases
  <br />
- **Database** configs
  NAME=your_db_name
  USER=your_db_user
  PASSWORD=your_db_password
  HOST=your_db_host
  PORT=your_db_port
  <br />
- **Superuser** info
  DJANGO_SUPERUSER_EMAIL=superuser_email
  DJANGO_SUPERUSER_FIRSTNAME=superuser_firstname
  DJANGO_SUPERUSER_LASTNAME=superuser_lastname
  DJANGO_SUPERUSER_PASSWORD=superuser_password
  <br />
- **Settings Module**
  DJANGO_SETTINGS_MODULE = 'study.settings.developement' --> to run the app locally
  DJANGO_SETTINGS_MODULE = 'study.settings.production' --> to run the app with docker
  <br />
- **CORS Support**
  Put the allowed origins from other outside services (e.g., frontend) in _ALLOWED_ORIGINS_ and separate them with a space. For instance:
  ```bash
  ALLOWED_ORIGINS="http://localhost:3000 http://127.0.0.1:3000"
  ```

## 2. 📦 Create Docker volumes and network

you must create the external volumes and network used by docker-compose.yml:

```bash
docker volume create pgdata
docker volume create static_volume
docker volume create media_volume
docker network create app-network
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

- Admin Panel: http://localhost/admin/
- Swagger API Docs: http://localhost/docs/

---

## 🧹 Clean Up

To stop and remove all containers:

```bash
docker-compose down -v
```
