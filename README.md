# AuraFlow

An advanced AI-powered task management application built with React, TypeScript, Tailwind CSS, Express, Socket.IO, Zustand, TanStack Query, Recharts, Zod, and AI integrations.

## Live Demo

### Frontend

https://aura-flow-client.vercel.app

### Backend API

https://auraflow-api-ck2v.onrender.com

### Repository

https://github.com/abhiiiinavx/AuraFlow

---

## Features

* JWT Authentication
* Task CRUD
* Analytics Dashboard
* Notifications
* AI Task Generation
* Priority Detection
* Smart Scheduling
* Profile Management
* Socket.IO Support
* Responsive UI
* Dark Mode
* Charts and Productivity Metrics
* Demo Data Fallback

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Zustand
* TanStack Query
* Recharts
* Socket.IO Client
* Framer Motion

### Backend

* Node.js
* Express
* TypeScript
* Socket.IO
* JWT Authentication
* Zod Validation
* OpenAI / Gemini Support

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/abhiiiinavx/AuraFlow.git
cd AuraFlow
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:8080
```

---

## Environment Variables

### Client (.env)

```env
VITE_API_URL=https://auraflow-api-ck2v.onrender.com/api
VITE_SOCKET_URL=https://auraflow-api-ck2v.onrender.com
```

### Server (.env)

```env
PORT=10000
CLIENT_URL=https://aura-flow-client.vercel.app
JWT_SECRET=your-secret-key
AI_PROVIDER=mock
```

Optional:

```env
MONGO_URI=
OPENAI_API_KEY=
GEMINI_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## API Overview

Base URL:

```
/api
```

### Auth

* POST /auth/register
* POST /auth/login
* POST /auth/me
* POST /auth/logout

### Tasks

* GET /tasks
* POST /tasks
* PATCH /tasks/:id
* DELETE /tasks/:id
* PATCH /tasks/:id/archive
* PATCH /tasks/:id/restore
* GET /tasks/export/csv
* GET /tasks/export/pdf

### Analytics

* GET /analytics/summary

### Notifications

* GET /notifications
* PATCH /notifications/:id/read

### AI

* POST /ai/generate-tasks
* POST /ai/detect-priority
* POST /ai/schedule
* POST /ai/next-task
* POST /ai/summarize

### Users

* GET /users/profile
* PATCH /users/profile
* POST /users/avatar

---

## Deployment

### Frontend (Vercel)

Build Command:

```bash
npm run build --workspace client
```

Output Directory:

```text
client/dist
```

Environment Variables:

```env
VITE_API_URL=https://auraflow-api-ck2v.onrender.com/api
VITE_SOCKET_URL=https://auraflow-api-ck2v.onrender.com
```

---

### Backend (Render)

Build Command:

```bash
npm install && npm run build --workspace server
```

Start Command:

```bash
npm run start --workspace server
```

Environment Variables:

```env
PORT=10000
CLIENT_URL=https://aura-flow-client.vercel.app
JWT_SECRET=your-secret-key
```

---

## Future Enhancements

* MongoDB Atlas Integration
* Real-time Collaboration
* Kanban Board
* Calendar View
* Pomodoro Timer
* AI Productivity Assistant
* Email Notifications
* Team Workspaces

---

## Author

**Abhinav Pratap Singh**

GitHub:
https://github.com/abhiiiinavx

LinkedIn:
https://www.linkedin.com/
