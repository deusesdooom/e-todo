# 📝 E-Todo Application

A modern, containerized To-Do list application built with a three-tier architecture, featuring a MySQL database, Node.js/Express backend API, and a responsive frontend interface.

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

## 🏗️ Architecture Overview

The application follows a three-container microservices architecture, orchestrated with Docker Compose for seamless deployment and scalability.

| Component | Technology | Port (Host) | Role |
|-----------|-----------|-------------|------|
| **Frontend** | HTML, CSS, JavaScript + Nginx | `8080` | Static content serving and user interface |
| **Backend API** | Node.js / Express | `5000` | RESTful API for business logic and data operations |
| **Database** | MySQL 8.0 | `3307` | Persistent storage for users and todo items |

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Methods](#deployment-methods)
  - [Method 1: Docker Compose (Recommended)](#method-1-docker-compose-recommended)
  - [Method 2: Local Development](#method-2-local-development)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✅ Prerequisites

### For Docker Deployment (Recommended)
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### For Local Development
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- [MySQL](https://www.mysql.com/) (v8.0)

## 🚀 Quick Start

Clone the repository and start the application with Docker Compose:

```bash
git clone <repository-url>
cd etodo-app
docker compose up --build
```

Access the application at **http://localhost:8080**

## 🐳 Method 1: Docker Compose (Recommended)

This method provides a complete, production-ready deployment with all services containerized and networked.

### Step 1: Verify Prerequisites

Ensure you have the following files in your project root:
- `docker-compose.yml`
- `nginx.conf`
- `backend/` directory with API code
- `frontend/` directory with static files

### Step 2: Build and Start Services

```bash
docker compose up --build
```

**Flags:**
- `--build`: Forces rebuild of all container images
- `-d`: (Optional) Run in detached mode

### Step 3: Verify Services

Check that all containers are running:

```bash
docker compose ps
```

Expected output should show three healthy containers:
- `etodo-frontend`
- `etodo-backend`
- `etodo-database`

### Step 4: Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:8080 |
| **Backend API** | http://localhost:5000 |
| **Database** | `localhost:3307` |

### Step 5: Stop Services

To stop and remove all containers, networks, and volumes:

```bash
docker compose down -v
```

**Note:** The `-v` flag removes volumes, which will delete all database data. Omit this flag to preserve data between restarts.

## 💻 Method 2: Local Development

Run the backend locally for development and debugging purposes.

### Prerequisites

Ensure you have:
- Node.js v18+ installed
- MySQL server running (either via Docker or locally)

### Step 1: Start the Database

If using Docker for the database only:

```bash
docker run -d \
  --name etodo-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword123 \
  -e MYSQL_DATABASE=etodo \
  -e MYSQL_USER=etodo_user \
  -e MYSQL_PASSWORD=etodo_password \
  -p 3307:3306 \
  mysql:8.0
```

### Step 2: Configure Environment

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=etodo_user
DB_PASSWORD=etodo_password
DB_NAME=etodo
PORT=5000
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Start the Backend

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The API will be available at **http://localhost:5000**

### Step 5: Serve the Frontend

For local development, you can serve the frontend using a simple HTTP server:

```bash
cd frontend
npx http-server -p 8080
```

Or open `frontend/index.html` directly in your browser (note: CORS restrictions may apply).

## 🗄️ Database Management

### Connection Details

| Parameter | Value |
|-----------|-------|
| **Host** | `localhost` |
| **Port** | `3307` |
| **Database** | `etodo` |
| **Username** | `etodo_user` |
| **Password** | `etodo_password` |
| **Root Password** | `rootpassword123` |

### Recommended SQL Clients

- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [DBeaver](https://dbeaver.io/)
- [TablePlus](https://tableplus.com/)
- VS Code: [MySQL extension](https://marketplace.visualstudio.com/items?itemName=formulahendry.vscode-mysql)

### Direct Database Access

Connect to the MySQL container:

```bash
docker exec -it etodo-database mysql -u etodo_user -p
```

Enter password: `etodo_password`

### Database Schema

The application uses the following tables:

**users**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `username` (VARCHAR)
- `email` (VARCHAR)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)

**todos**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY)
- `title` (VARCHAR)
- `description` (TEXT)
- `completed` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Authentication

**POST** `/auth/register`
- Register a new user
- Body: `{ "username": "string", "email": "string", "password": "string" }`

**POST** `/auth/login`
- Authenticate user
- Body: `{ "email": "string", "password": "string" }`

#### Todos

**GET** `/todos`
- Retrieve all todos for authenticated user

**POST** `/todos`
- Create a new todo
- Body: `{ "title": "string", "description": "string" }`

**PUT** `/todos/:id`
- Update a specific todo
- Body: `{ "title": "string", "description": "string", "completed": boolean }`

**DELETE** `/todos/:id`
- Delete a specific todo

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=etodo-database
DB_PORT=3306
DB_USER=etodo_user
DB_PASSWORD=etodo_password
DB_NAME=etodo

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### Nginx Configuration

The `nginx.conf` file in the project root configures the frontend server. Modify as needed for custom routing or SSL.

## 🔧 Troubleshooting

### Containers Won't Start

Check logs for specific services:

```bash
docker compose logs backend
docker compose logs database
docker compose logs frontend
```

### Database Connection Issues

Verify the database is ready:

```bash
docker compose exec database mysqladmin ping -u root -p
```

### Port Conflicts

If ports 8080, 5000, or 3307 are in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8081:80"  # Change host port to 8081
```

### Reset Database

To completely reset the database:

```bash
docker compose down -v
docker compose up --build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- MEHDI BEN KHADRA - Initial work

## 🙏 Acknowledgments

- Node.js and Express.js communities
- Docker documentation
- MySQL team

---

**Built with ❤️ using Docker, Node.js, and MySQL**