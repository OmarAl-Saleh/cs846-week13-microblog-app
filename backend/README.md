# Microblog Backend (auth scaffold)

This folder contains a minimal TypeScript Express backend scaffold focused on authentication and user profile.

Quick start (local Postgres required):

```bash
cd backend
npm install
# create DB and run sql/init.sql with psql or a DB client
cp .env.example .env
# edit .env and set DATABASE_URL, JWT_SECRET
npm run dev
```

Endpoints:
- POST /api/auth/signup { username, password, display_name }
- POST /api/auth/login { username, password }
- GET /api/auth/profile/:username
- GET /api/auth/me (requires Authorization: Bearer <token>)
