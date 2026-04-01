# CareerBridge ✏️

**CareerBridge** is an AI-powered job matching platform designed to seamlessly connect ambitious candidates with forward-thinking companies. Built with a modern tech stack, the platform uses advanced semantic matching to rank candidates against job requirements and provides a beautiful, responsive, and seamless UI for both candidates and recruiters.

---

## 🚀 Features

### For Candidates
* **Smart AI Matching:** Get instantly matched to jobs using advanced AI algorithms that dynamically calculate a **Smart Match Score** by comparing your resume with the job description.
* **One-Click Apply:** Submit applications to open roles instantly. The system prevents duplicate applications and tracks your progress.
* **Application Tracking:** View the real-time status of all your applications from a sleek candidate dashboard.
* **Seamless Profile Management:** Keep your skills, bio, and resume (via PDF links) up to date.

### For Recruiters
* **Built-In ATS (Applicant Tracking System):** Post new jobs, track open roles, and manage all your applicants in one place.
* **AI Candidate Ranking:** Automatically see the AI match percentage for every incoming application to prioritize the best candidates instantly.
* **Application Status Updates:** Mark applications as *Reviewed*, *Accepted*, or *Rejected*.

### Platform-Wide
* **Role-Based Authentication:** Secure JWT-based authentication system with completely separate dashboards for Candidates and Recruiters.
* **Modern & Dynamic UI:** Premium dark-themed user interface utilizing vibrant colors, glassmorphism, responsive components, and dynamic hover effects.
* **Real-time Toasts:** Instant feedback on interactions (login success, application submission, errors) via React Toastify.

---

## 💻 Tech Stack

### Frontend
* **Core:** React 19, TypeScript
* **Build Tool:** Vite
* **Routing:** React Router v7
* **Data Fetching:** TanStack React Query (`@tanstack/react-query`)
* **Styling:** Custom CSS (Flexbox/Grid, CSS Variables, Glassmorphism, Micro-animations)
* **Notifications:** React Toastify 

### Backend
* **Core:** Node.js, Express.js (v5), TypeScript
* **Database & ORM:** MongoDB, Prisma ORM
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **AI & Parsing Engine:** 
  * Google Generative AI SDK (`@google/generative-ai`)
  * Groq SDK (`groq-sdk`)
  * PDF Text Parsing (`pdf-parse`)
* **File Handling:** Multer, Cloudinary

---

## 🛠️ Setup & Installation

### Prerequisites
1. **Node.js**: Ensure you have Node.js 18+ installed on your machine.
2. **MongoDB Database**: Set up a local MongoDB replica set or use MongoDB Atlas. Note that Prisma transactions with MongoDB require a Replica Set.

### 1. Clone the Repository
```bash
git clone https://github.com/AyushAnand-28/CareerBridge.git
cd CareerBridge
```

### 2. Environment Variables Configuration
Navigate to the `backend` directory and create a `.env` file with the following variables:
```env
# backend/.env
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/careerbridge?retryWrites=true&w=majority"
JWT_SECRET="your_super_secret_jwt_string"

# AI Integration Keys (depending on your setup)
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

### 3. Backend Setup
```bash
cd backend
npm install

# Push the schema to your MongoDB database and generate the Prisma Client
npx prisma db push
npx prisma generate

# (Optional) Seed the database with fake jobs and sample users
npm run seed

# Run the backend dev server
npm run dev
```

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Run the frontend dev server
npm run dev
```

The application will now be running. 
* Frontend typically runs at: [http://localhost:5173](http://localhost:5173)
* Backend API typically runs at: [http://localhost:5000](http://localhost:5000)

---

## 📝 License

This project is open-source and available under the [ISC License](LICENSE).
