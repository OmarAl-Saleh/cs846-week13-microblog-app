# CS846 Week 13 – Microblog Platform

## Overview

This project implements a **microblogging web application (Twitter-like)** as part of **CS 846: LLMs for Software Engineering (Winter 2026)**.

The system was developed using an **LLM-assisted workflow (GitHub Copilot)**, applying structured prompting, iterative development, and validation techniques learned throughout the course.

---

## Features

### Core Functionality

* User signup and login (JWT-based authentication)
* Create short posts (max length enforced)
* Global feed of posts (no follower graph)
* Like posts (idempotent)
* Reply to posts (one level deep only)
* View user profile and their posts

### Constraints (as required)

* No private messaging
* No reposts/retweets
* No follower system (global feed only)

---

## Tech Stack

### Backend

* Node.js + Express
* TypeScript
* PostgreSQL
* JWT authentication
* Pino (structured logging)

### Frontend

* React + Vite
* TypeScript
* Lightweight CSS styling

### Testing

* Jest
* Supertest

---

## Project Structure

```
root/
├── backend/
│   ├── src/
│   ├── sql/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cs846-week13-microblog
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure environment

Create `.env` file based on `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/microblog
JWT_SECRET=your_secret
BCRYPT_ROUNDS=10
```

#### Setup database

```bash
psql -U postgres -d microblog -f ./sql/init.sql
```

#### Run backend

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## API Overview

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`

### Posts

* `GET /api/posts` → global feed
* `POST /api/posts` → create post
* `POST /api/posts/:id/like`
* `POST /api/posts/:id/reply`
* `GET /api/posts/:id/replies`

### Users

* `GET /api/users/:username/posts`

---

## Key Implementation Details

### Authentication

* JWT-based authentication
* Token stored on frontend and attached to requests

### Data Model

* Users
* Posts (with parent_post_id for replies)
* Likes (unique constraint for idempotency)

### Logging

* Structured logging using **Pino**
* Logs for:

  * post creation
  * like actions
  * validation errors
  * system errors

### Testing

* Unit tests for service layer
* Integration tests for API routes
* Mocked DB for fast execution



---

## Course Context

This project demonstrates:

* Prompt engineering for software development
* Iterative LLM-assisted coding workflows
* Debugging and validation strategies
* Applying guidelines across:

  * requirements engineering
  * testing
  * logging
  * performance

---

## Author

* **Omar AlSaleh**
* University of Waterloo
* CS 846 – LLMs for Software Engineering (Winter 2026)
