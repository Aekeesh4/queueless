# QueueLess — Smart Queue Management System

> A full-stack queue management system that helps customers join service queues and allows staff to manage and process those queues efficiently.

## 🚀 Live Demo

**Frontend:** https://queueless-rho.vercel.app

**Backend API:** https://queueless-8p13.onrender.com

---

## 📌 Overview

QueueLess is a full-stack queue management application designed to reduce waiting time and make service-based queue handling more organized.

The system supports different user roles such as:

- Customer
- Staff

Customers can log in, select a service, join a queue, and track their queue status.

Staff members can access the queue management system and process customers through different queue states.

---

## ✨ Features

### 👤 Customer

- Customer registration and login
- JWT-based authentication
- Select an available service
- Join a service queue
- Generate queue token
- View queue information
- Track queue status
- Logout functionality

### 👨‍💼 Staff

- Staff authentication
- Access staff queue management functionality
- View customers in the queue
- Process queue tokens
- Update queue status
- Mark customers as completed

### 🔐 Authentication & Security

- JWT authentication
- Password-based authentication
- Role-based access control
- Stateless Spring Security configuration
- Protected API endpoints
- CORS configuration for frontend-backend communication

### 🗄️ Backend

- RESTful APIs
- Spring Boot
- Spring Data JPA
- Hibernate
- Database persistence
- Service and controller based architecture

### 🌐 Deployment

- Frontend deployed on Vercel
- Backend deployed on Render
- Production environment variables configured
- Frontend communicates with the deployed backend API

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate

### Database

- PostgreSQL

### Deployment

- Vercel — Frontend
- Render — Backend

### Development Tools

- Git
- GitHub
- Postman
- IntelliJ IDEA

---

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    │      / Staff         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Spring Boot API    │
                    │                      │
                    │ Controllers          │
                    │ Services             │
                    │ JWT Security         │
                    │ JPA / Hibernate      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Database       │
                    └──────────────────────┘


🔑 Authentication Flow

QueueLess uses JWT-based authentication.

Login Flow
User
  │
  │ username + password
  ▼
Frontend
  │
  │ POST /api/auth/login
  ▼
Spring Boot Backend
  │
  ├── Validate credentials
  │
  ├── Generate JWT
  │
  ▼
JWT Token
  │
  ▼
Frontend
  │
  └── Token used for protected API requests


📁 Backend Structure
queueless-backend/
│
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── queueless/
│                   └── backend/
│
│                       ├── config/
│                       │   └── SecurityConfig.java
│                       │
│                       ├── controller/
│                       │
│                       ├── dto/
│                       │
│                       ├── entity/
│                       │
│                       ├── repository/
│                       │
│                       ├── security/
│                       │
│                       ├── service/
│                       │
│                       └── QueuelessBackendApplication.java
│
└── pom.xml


📁 Frontend Structure
queueless-frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env
├── vite.config.js
├── package.json
└── index.html


💻 Running Locally
1. Clone the repository
git clone https://github.com/Aekeesh4/queueless.git
cd queueless
2. Run the Backend

Navigate to the backend directory:

cd queueless-backend

Run the Spring Boot application using your IDE or Maven:

mvn spring-boot:run

The backend will run locally on the configured port.

3. Run the Frontend

Open another terminal:

cd queueless-frontend

Install dependencies:

npm install

Create .env:

VITE_API_URL=http://localhost:8080/api

Start the development server:

npm run dev

The Vite development server will provide a local URL.



🚀 Deployment
Backend

The Spring Boot backend is deployed on:

Render

https://queueless-8p13.onrender.com
Frontend

The React/Vite frontend is deployed on:

Vercel

https://queueless-rho.vercel.app

The production frontend communicates with the deployed backend using:

VITE_API_URL=https://queueless-8p13.onrender.com/api



🔄 Production Request Flow
Browser
   │
   ▼
Vercel
QueueLess Frontend
   │
   │ HTTPS API Request
   ▼
Render
Spring Boot Backend
   │
   ├── Spring Security
   ├── JWT Authentication
   ├── Controllers
   ├── Services
   └── JPA / Hibernate
          │
          ▼
      PostgreSQL


🧠 Key Concepts Implemented

This project demonstrates practical implementation of:

REST APIs
Spring Boot
Dependency Injection
MVC architecture
DTOs
JPA entities
Repository pattern
Service layer
JWT authentication
Spring Security
Role-based authorization
CORS
React frontend
REST API integration
PostgreSQL
Git/GitHub
Production deployment


🔮 Future Improvements

Real-time queue updates using WebSockets
Estimated waiting time for customers
Email/SMS notifications
Admin dashboard
Service creation and management
Queue analytics
Appointment scheduling
Improved role-based permissions
Better error handling and validation



👨‍💻 Author

Aekeessh4

GitHub:
https://github.com/Aekeesh4
                    
