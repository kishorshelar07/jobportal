# 🚀 JobPortal — Production-Grade Job Platform

A full-stack job portal platform built with Node.js, Express, MongoDB, and React. Supports three distinct user roles with complete flows for job discovery, applications, and recruitment management.

---

## 🛠️ Tech Stack

**Backend**: Node.js · Express.js · MongoDB (Mongoose) · JWT · Bcrypt · Multer · Nodemailer  
**Frontend**: React 18 · Vite · React Router v6 · Framer Motion · Chart.js · React Hook Form · React Toastify  
**Auth**: JWT access tokens (15min) + refresh tokens (7 days, httpOnly cookies)  
**Security**: Helmet · CORS · Rate Limiting · Express Validator · Bcrypt (12 rounds)

---

## 📁 Project Structure

```
jobportal/
├── backend/
│   ├── src/
│   │   ├── config/        # db.js, multer.js, email.js
│   │   ├── controllers/   # auth, profile, jobs, recruiter, admin, notifications
│   │   ├── middleware/    # auth, role, validate, rateLimiter
│   │   ├── models/        # User, JobSeekerProfile, Company, Job, Application, ...
│   │   ├── routes/v1/     # auth, profile, jobs, recruiter, admin, notifications
│   │   ├── services/      # email.service.js, notification.service.js
│   │   ├── utils/         # AppError, asyncHandler, formatResponse, jwt
│   │   ├── seed.js        # Demo data seeder
│   │   └── app.js
│   ├── uploads/           # Profile pics / resumes / logos
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/           # axios + all API modules
    │   ├── components/    # Navbar, Footer, JobCard, UI primitives, charts
    │   ├── context/       # AuthContext
    │   ├── pages/         # jobseeker/, recruiter/, admin/, auth/
    │   ├── utils/         # formatDate, formatSalary, etc.
    │   ├── constants/     # STATUS_CONFIG, JOB_TYPES, WORK_MODES
    │   └── App.jsx
    └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/api/health

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jobportal.com | Admin@1234 |
| Recruiter | recruiter1@jobportal.com | Recruiter@1234 |
| Job Seeker | seeker1@jobportal.com | Seeker@1234 |

---

## ✨ Features

### Job Seeker
- ✅ Register with email OTP verification
- ✅ LinkedIn-style profile with completion ring
- ✅ Upload profile picture and resume
- ✅ Work experience, education, skills CRUD
- ✅ Job search with advanced filters (type, mode, salary, date, experience)
- ✅ Skill match % on job cards
- ✅ Apply with resume + cover letter
- ✅ Save/bookmark jobs
- ✅ Track applications with status timeline
- ✅ Dashboard with stats and donut chart
- ✅ Real-time notifications (bell icon)
- ✅ Recommended jobs based on skills

### Recruiter
- ✅ Company profile with logo upload
- ✅ Admin can verify companies (badge)
- ✅ 3-step job posting wizard
- ✅ Save as Draft or Publish directly
- ✅ Edit, close, reopen, duplicate jobs
- ✅ Split-view applicant management
- ✅ Status update with notes → email notification to seeker
- ✅ Status history per applicant
- ✅ Download applicant resumes
- ✅ Dashboard with bar + pie charts

### Admin
- ✅ Platform-wide stats dashboard
- ✅ User activation/deactivation
- ✅ Company verification management
- ✅ Job moderation (close inappropriate jobs)
- ✅ Monthly signups line chart

---

## 📡 API Reference

All endpoints versioned at `/api/v1/`. Every response:
```json
{ "success": true, "message": "", "data": {}, "errors": [] }
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register (jobseeker/recruiter) |
| POST | /auth/login | Login → access token + refresh cookie |
| POST | /auth/refresh-token | Silent token refresh |
| POST | /auth/logout | Clear refresh token |
| POST | /auth/verify-email | Verify OTP |
| POST | /auth/forgot-password | Send reset link |
| POST | /auth/reset-password | Reset with token |

### Jobs (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /jobs | Search + filter + paginate jobs |
| GET | /jobs/:id | Get job detail + similar jobs |
| POST | /jobs/:id/apply | Apply (jobseeker) |
| POST | /jobs/:id/save | Toggle save job |

---

## 🔒 Security

- Passwords hashed with Bcrypt (12 salt rounds)
- JWT access: 15 min | Refresh: 7 days (httpOnly cookie)
- Rate limiting: 10 req/15min on auth routes
- Helmet security headers on all responses
- Input validation via Express Validator
- File type + size strictly enforced
- All queries scoped to authenticated user (no data leaks)
- CORS restricted to frontend origin

---

## 🗄️ Seed Data

Running `npm run seed` creates:
- **1** Admin account
- **5** Recruiter accounts + Company profiles (3 verified)
- **20** Job Seeker accounts with full profiles
- **50** Active job listings across all companies
- **~100** Applications with various statuses

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | #1558D6 |
| Navy | #0D2137 |
| Success | #16A34A |
| Danger | #DC2626 |
| Card Radius | 12px |
| Font Display | Plus Jakarta Sans |
| Font Body | Inter |

---

## 📦 Production Build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
# Deploy dist/ to any static host (Vercel, Netlify, etc.)
```
