# CareerBridge ✏️

> **AI-powered job matching platform** — connecting ambitious candidates with forward-thinking companies through smart resume analysis, real-time application tracking, and a polished dual-role dashboard experience.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Local Setup](#-local-setup)
- [Database Seeding](#-database-seeding)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🔍 Overview

CareerBridge provides two completely separate experiences within one platform:

- **Candidates** upload their resume, build a skills profile, and get AI-scored job matches — then apply in one click and track every application stage.
- **Recruiters** post jobs, see every applicant's AI match percentage instantly, and update application statuses as candidates move through the pipeline.

The AI engine uses **Groq's `llama-3.3-70b-versatile`** model to compare a candidate's resume text and listed skills against the job's description and required tech stack, returning a 0–100 match score with a short written analysis. If no Groq API key is configured, the system automatically falls back to keyword-based matching so the app always works.

---

## 🚀 Features

### Candidate
| Feature | Description |
|---------|-------------|
| 🎯 AI Match Score | Groq LLM scores your resume against each job (0–100%) with a written summary |
| ⚡ One-Click Apply | Apply instantly using your pre-filled profile; duplicate applications are blocked |
| 📊 Application Tracker | Live status board — Applied → Reviewing → Interview → Accepted / Rejected |
| 💾 Saved Jobs | Bookmark jobs to review later |
| 👤 Profile Settings | Update name, bio, location, skills, avatar, and resume PDF link |
| 🌟 Recommended Jobs | Personalised tab showing your best-matched open roles |

### Recruiter
| Feature | Description |
|---------|-------------|
| 📝 Post Jobs | Create job listings with title, description, tech stack, salary range, and employment type |
| 🏢 Company Profile | Attach a company name, logo URL, website, and location to your postings |
| 📥 Applicant Dashboard | See all applicants per job with AI match scores and resume links |
| 🔄 Status Updates | Move candidates between stages: Reviewing → Interview → Accepted / Rejected |
| 📊 Job Management | View, filter, and close your active job postings |

### Platform-Wide
| Feature | Description |
|---------|-------------|
| 🔐 JWT Auth | Role-based authentication (Candidate / Recruiter) — completely separate dashboards |
| 🌙 Dark UI | Premium dark theme with glassmorphism, CSS animations, and responsive layouts |
| ☁️ Cloudinary Uploads | Resumes and profile images stored on Cloudinary CDN |
| 🔔 Toast Notifications | Instant feedback on all actions via React Toastify |

---

## 💻 Tech Stack

### Frontend
```
React 19          — UI framework
TypeScript        — Type safety
Vite 7            — Build tool & dev server
React Router v7   — Client-side routing
TanStack Query    — Server state & caching
React Toastify    — Toast notifications
Vanilla CSS       — Custom design system (CSS variables, glassmorphism, animations)
```

### Backend
```
Node.js           — Runtime
Express 5         — HTTP framework
TypeScript        — Type safety
Prisma ORM        — Database client & schema management
MongoDB Atlas     — Document database (replica set required for transactions)
jsonwebtoken      — JWT signing & verification
bcryptjs          — Password hashing
Multer            — Multipart file handling
Cloudinary SDK    — File upload & CDN storage
Groq SDK          — LLM-based resume analysis
pdf-parse         — Extract text from uploaded PDF resumes
```

---

## 📁 Project Structure

```
CareerBridge/
├── README.md
├── DEPLOYMENT.md          ← Production deployment guide (Render + Vercel + Atlas)
│
├── backend/
│   ├── src/
│   │   ├── index.ts       ← Express server entry point
│   │   ├── middleware/
│   │   │   ├── auth.ts    ← JWT verification middleware
│   │   │   └── upload.ts  ← Multer + Cloudinary upload middleware
│   │   ├── routes/
│   │   │   ├── auth.ts    ← /api/auth (register, login, me)
│   │   │   ├── jobs.ts    ← /api/jobs (CRUD + recommended)
│   │   │   ├── applications.ts  ← /api/applications (apply, status, AI score)
│   │   │   └── profile.ts ← /api/profile (get/update user profile)
│   │   └── utils/
│   │       ├── ai.ts      ← Groq resume analysis + keyword fallback
│   │       ├── cloudinary.ts    ← Cloudinary SDK config
│   │       ├── pdfParser.ts     ← PDF text extraction
│   │       └── prisma.ts  ← Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma  ← Database models
│   │   └── seed.ts        ← Demo data seeder
│   ├── Dockerfile         ← Multi-stage production image
│   ├── render.yaml        ← Render.com Blueprint config
│   ├── .env.example       ← Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx       ← React entry point
    │   ├── App.tsx        ← Router, layouts, landing page
    │   ├── context/
    │   │   └── AuthContext.tsx  ← Auth state + JWT storage
    │   ├── components/    ← AuthModal, AuthGuard, AppFooter, …
    │   └── pages/
    │       ├── JobsList.tsx
    │       ├── JobDetail.tsx
    │       ├── CandidateDashboard.tsx
    │       ├── RecruiterDashboard.tsx
    │       └── ProfileSettings.tsx
    ├── vercel.json        ← SPA routing rewrite rule
    ├── .env.example       ← Environment variable template
    └── package.json
```

---

## ✅ Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Bundled with Node.js |
| MongoDB | 6+ | Local replica set **or** [MongoDB Atlas](https://cloud.mongodb.com) free tier |

> **Why a replica set?** Prisma's MongoDB adapter requires a replica set to support multi-document transactions. A single standalone `mongod` will not work.

---

## 🔑 Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.example` and fill in your values:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/careerbridge?retryWrites=true&w=majority"

# Auth
JWT_SECRET="generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS — set to your frontend URL in production
FRONTEND_URL="http://localhost:5173"

# Cloudinary (https://cloudinary.com → Dashboard → API Keys)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Groq AI (https://console.groq.com/keys) — optional, falls back to keyword matching
GROQ_API_KEY="your_groq_api_key"
```

### Frontend — `frontend/.env.local`

Copy `frontend/.env.example`:

```env
# Leave empty in local dev — Vite's proxy forwards /api to localhost:5000
# In production, set this to your deployed backend URL
VITE_API_URL=""
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AyushAnand-28/CareerBridge.git
cd CareerBridge
```

### 2. Start a local MongoDB replica set

If you don't have one already:

```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Convert standalone to replica set — add to mongod.conf:
# replication:
#   replSetName: "rs0"

# Then initialise:
mongosh --eval "rs.initiate()"
```

Or skip this and use a free [MongoDB Atlas](https://cloud.mongodb.com) cluster instead.

### 3. Set up the backend

```bash
cd backend
cp .env.example .env          # then edit .env with your values

npm install                    # also runs prisma generate (postinstall hook)
npx prisma db push             # push schema to your database
npm run dev                    # starts on http://localhost:5000
```

Verify it's running:
```bash
curl http://localhost:5000/health
# → {"status":"ok","uptime":...}
```

### 4. Set up the frontend

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local     # VITE_API_URL can stay empty for local dev

npm install
npm run dev                    # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌱 Database Seeding

Populate the database with realistic demo jobs and sample users:

```bash
cd backend
npm run seed
```

This creates:
- **5 candidate accounts** with skills and resume URLs
- **3 recruiter accounts** with company profiles
- **20+ job postings** across Engineering, Design, Data Science, DevOps, and more

Sample login after seeding:
| Role | Email | Password |
|------|-------|----------|
| Candidate | `alice@example.com` | `password123` |
| Recruiter | `recruiter1@example.com` | `password123` |

---

## 📜 Available Scripts

### Backend (`cd backend`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Runs with nodemon (hot reload) |
| Build | `npm run build` | Compiles TypeScript → `dist/` |
| Start (prod) | `npm start` | Runs compiled `dist/index.js` |
| Seed | `npm run seed` | Populates DB with demo data |
| Prisma Studio | `npx prisma studio` | Opens visual DB browser at :5555 |
| Generate client | `npx prisma generate` | Regenerates Prisma client after schema changes |

### Frontend (`cd frontend`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Vite dev server with HMR |
| Build | `npm run build` | TypeScript check + Vite production bundle |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | ESLint check |

---

## ☁️ Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide to deploy on:
- **MongoDB Atlas** (database)
- **Render.com** (backend API)
- **Vercel** (frontend)

---

## 📝 License

This project is open-source and available under the [ISC License](LICENSE).
