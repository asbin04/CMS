# CMS (Company Management System)

A full-stack Company Management System built with a **Spring Boot 3** REST API and a **React + TypeScript (Vite)** frontend.

---

## 🛠️ Tech Stack

* **Backend:** Java 17+, Spring Boot 3, Spring Security, JWT, Spring Data JPA, Swagger / OpenAPI
* **Frontend:** React 18+, TypeScript, Vite, Axios
* **Database:** PostgreSQL / MySQL

---

## 📁 Project Structure

```text
CMS/
├── backend/       # Spring Boot REST API
├── frontend/      # React + TypeScript client (Vite)
├── .gitignore     # Unified Git ignore rules
└── README.md      # Project documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
* **Java JDK** 17+
* **Node.js** 18+ & npm
* **PostgreSQL** or **MySQL** server

### 2. Environment Setup
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Run Backend
```bash
cd backend
./mvnw spring-boot:run
# Windows PowerShell: .\mvnw.cmd spring-boot:run
```
* **API Server:** `http://localhost:8080`
* **Swagger UI:** `http://localhost:8080/swagger-ui.html`

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
* **Client App:** `http://localhost:5173`
