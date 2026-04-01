# CareerBridge ✏️

**CareerBridge** is an AI-powered job matching platform that connects ambitious candidates with forward-thinking companies. Built with a modern full-stack: React + Vite frontend, Node.js + Express + Prisma backend, and MongoDB Atlas database.

[![Deploy Backend to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🚀 Features

### For Candidates
- **Smart AI Matching** — Groq LLM (llama-3.3-70b) scores your resume against each job's tech stack with a percentage match.
- **One-Click Apply** — Submit with your pre-filled profile; duplicate applications are blocked.
- **Application Tracking** — Real-time status (Applied → Reviewing → Interview → Accepted/Rejected) from a sleek dashboard.
- **Profile Management** — Update skills, bio, location, and resume link from one page.

### For Recruiters
- **Built-In ATS** — Post jobs, manage applicants, and update statuses in one place.
- **AI Candidate Ranking** — Every application shows an AI match percentage so you instantly see the best fits.
- **Company Profile** — Attach a company name, logo, and description to your postings.

### Platform-Wide
- **JWT Authentication** — Secure, role-based auth (Candidate / Recruiter) with separate dashboards.
- **Premium Dark UI** — Glassmorphism, CSS animations, fully responsive across all screen sizes.
- **Cloudinary Uploads** — Resume PDFs and avatars stored on Cloudinary CDN.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, React Router v7, TanStack Query |
| Styling | Vanilla CSS (CSS Variables, Glassmorphism, Flexbox/Grid) |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas + Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Groq SDK (`llama-3.3-70b-versatile`) with keyword fallback |
| File Uploads | Multer + Cloudinary |
| Notifications | React Toastify |

---

## 🛠️ Local Development

### Prerequisites
- **Node.js 20+**
- **MongoDB** — local replica set **or** a free [MongoDB Atlas](https://cloud.mongodb.com) cluster (replica set required for Prisma transactions)

### 1. Clone the repo

```bash
git clone https://github.com/AyushAnand-28/CareerBridge.git
cd CareerBridge
```

### 2. Backend setup

```bash
cd backend

# Copy env template and fill in your values
cp .env.example .env

# Install deps (also runs prisma generate via postinstall)
npm install

# Push schema to your database
npx prisma db push

# (Optional) seed with demo jobs & users
npm run seed

# Start dev server on http://localhost:5000
npm run dev
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend

# Copy env template (leave VITE_API_URL empty for local dev — Vite proxy handles it)
cp .env.example .env.local
# In .env.local set: VITE_API_URL=   (empty string)

npm install

# Start dev server on http://localhost:5173
npm run dev
```

---

## ☁️ Production Deployment

### Stack
| Service | Platform | Plan |
|---------|----------|------|
| Database | MongoDB Atlas | Free M0 |
| Backend API | Render.com | Free Web Service |
| Frontend | Vercel | Free Hobby |

---

### Step 1 — MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://cloud.mongodb.com).
2. Create a **free M0 cluster** → choose any region.
3. Under **Database Access**: add a user with Read/Write permissions.
4. Under **Network Access**: add `0.0.0.0/0` (allow all IPs — Render uses dynamic IPs).
5. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careerbridge?retryWrites=true&w=majority
   ```

---

### Step 2 — Deploy Backend to Render

1. Push your repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint**.
3. Connect your GitHub repo — Render will detect `backend/render.yaml` automatically.
4. In the **Environment** tab, set these secret values:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Atlas connection string from Step 1 |
| `JWT_SECRET` | A 64-char random string (Render auto-generates one) |
| `FRONTEND_URL` | Your Vercel URL from Step 3 (set/update after Step 3) |
| `CLOUDINARY_CLOUD_NAME` | From [cloudinary.com](https://cloudinary.com) Dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary Dashboard |
| `GROQ_API_KEY` | From [console.groq.com/keys](https://console.groq.com/keys) |

5. Click **Create Service**. Render builds & deploys automatically.
6. Once live, run the schema push once from your local machine:
   ```bash
   # Inside backend/ with your Atlas DATABASE_URL in .env
   npx prisma db push
   ```
7. Verify: visit `https://careerbridge-api.onrender.com/health` — should return `{"status":"ok"}`.

---

### Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL, e.g. `https://careerbridge-api.onrender.com` |

4. Click **Deploy**. Vercel detects Vite and `vercel.json` automatically (SPA routing is pre-configured).
5. Copy your Vercel URL (e.g. `https://careerbridge.vercel.app`).

---

### Step 4 — Wire Them Together

1. Go back to Render → your service → **Environment**.
2. Update `FRONTEND_URL` to your Vercel URL from Step 3.
3. Click **Save Changes** — Render redeploys automatically.

✅ Your full-stack app is now live!

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 64-char secret for signing tokens |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime, e.g. `7d` |
| `PORT` | ✅ | Server port (default `5000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | Vercel URL for CORS (comma-separated for multiple) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `GROQ_API_KEY` | ⚪ | Groq API key (falls back to keyword matching if missing) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ in prod | Backend API URL. Leave empty for local dev (Vite proxy handles it). |

---

## 📝 License

This project is open-source under the [ISC License](LICENSE).
