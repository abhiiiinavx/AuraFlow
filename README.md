# Aura Task Suite

An advanced AI-powered task management application built with React, TypeScript, Tailwind CSS, Express, MongoDB, JWT auth, Socket.IO, Recharts, Zustand, TanStack Query, Zod, and AI provider integrations.

## Quick Start

```bash
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:8080`.

The frontend includes resilient demo data so the interface remains usable before a MongoDB connection is configured. For production behavior, configure the server environment variables in `server/.env`.

## Environment

Copy `server/.env.example` to `server/.env`.

```env
PORT=8080
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/aura-task-suite
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
EMAIL_FROM=Aura Task Suite <noreply@example.com>
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
OPENAI_API_KEY=
GEMINI_API_KEY=
AI_PROVIDER=mock
```

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/register` - create an account.
- `POST /auth/login` - login and receive a JWT.
- `POST /auth/forgot-password` - request a reset token.
- `POST /auth/reset-password` - reset a password.
- `POST /auth/verify-email` - verify an email token.
- `GET /auth/me` - fetch the current user.
- `POST /auth/logout` - logout endpoint for clients.

### Tasks

- `GET /tasks` - list tasks with `search`, `status`, `priority`, `sort`, `page`, and `limit`.
- `POST /tasks` - create a task.
- `PATCH /tasks/:id` - update a task.
- `DELETE /tasks/:id` - delete a task.
- `PATCH /tasks/:id/archive` - archive a task.
- `PATCH /tasks/:id/restore` - restore a task.
- `GET /tasks/export/csv` - export tasks as CSV.
- `GET /tasks/export/pdf` - export tasks as a lightweight PDF-ready JSON payload.

### Analytics, Notifications, AI, Profile

- `GET /analytics/summary` - productivity metrics and chart data.
- `GET /notifications` - list in-app notifications.
- `PATCH /notifications/:id/read` - mark a notification as read.
- `POST /ai/generate-tasks` - turn plain text into tasks.
- `POST /ai/detect-priority` - infer a priority.
- `POST /ai/schedule` - suggest a due date.
- `POST /ai/next-task` - recommend next work.
- `POST /ai/summarize` - summarize completed work.
- `GET /users/profile` - current profile.
- `PATCH /users/profile` - update profile details.
- `POST /users/avatar` - upload an avatar.

## Deployment

Frontend deploy target: Vercel.

- Build command: `npm run build --workspace client`
- Output directory: `client/dist`
- Required env: `VITE_API_URL=https://your-render-api.onrender.com/api`

Backend deploy target: Render.

- Build command: `npm install && npm run build --workspace server`
- Start command: `npm run start --workspace server`
- Required env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional AI/email variables.

Database target: MongoDB Atlas.
