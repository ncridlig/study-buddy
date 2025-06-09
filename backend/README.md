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

- `SECRET_KEY`  
  Produce value for this field using [djecrety](https://djecrety.ir/). This is needed for running a Django application.

- `DEBUG`  
  Set this field to _True_ for activating debug mode and see output logs. Set it to _False_ for real world scenarios.

- **Database** configurations  
  `NAME=your_db_name`
  `USER=your_db_user`
  `PASSWORD=your_db_password`
  `HOST=your_db_host`
  `PORT=your_db_port`

- **Superuser** information  
  `DJANGO_SUPERUSER_EMAIL=superuser_email`
  `DJANGO_SUPERUSER_FIRSTNAME=superuser_firstname`
  `DJANGO_SUPERUSER_LASTNAME=superuser_lastname`
  `DJANGO_SUPERUSER_PASSWORD=superuser_password`

- **Settings** Module  
  Use `DJANGO_SETTINGS_MODULE = 'study.settings.developement'` if you intend to run the app locally. And use `DJANGO_SETTINGS_MODULE = 'study.settings.production'` if you intend to run it using containerizing applications such as Docker.

- **CORS** Support  
  To allow external services (e.g., frontend), have access to this application, you need to put their corresponding origins in `ALLOWED_ORIGINS` and separate them with a space. For instance, `ALLOWED_ORIGINS="http://localhost:3000 http://127.0.0.1:3000"`, grants access to `http://localhost:3000` and `http://127.0.0.1:3000`.

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
