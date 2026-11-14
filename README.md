# Code-a-Nova Hackathon Registration Portal

A full-stack **MERN + Nodemailer** Hackathon Registration Portal built for **Code-a-Nova 2026**. Participants can create an account, verify their email using a single-use 6-digit OTP (10-minute expiry), authenticate via JWT + `bcrypt`, manage their profile, and register solo or team entries (1–5 members) with automated email confirmation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Local Setup & Installation](#local-setup--installation)
5. [Environment Variables Guide](#environment-variables-guide)
6. [API Documentation](#api-documentation)
7. [Deployment Guide](#deployment-guide)
8. [Screenshots](#screenshots)

---

## Project Overview

- **Public Pages:** Landing page (`Home`), event rubric & tracks (`About`), inquiry desk (`Contact`), account creation (`Signup`), 6-digit verification (`OTP Verify`), and `Login`.
- **Protected Pages (JWT Guard):** Participant `Dashboard` (profile details, inline profile editing, hackathon entry overview, and registration withdrawal) and `Registration` (14-field hackathon submission with dynamic team member inputs).
- **Security & Auth:**
  - Passwords hashed with `bcrypt` before persisting to MongoDB.
  - Cryptographically random 6-digit OTPs stored as SHA-256 hashes with a strict **10-minute expiry** and **single-use invalidation**.
  - Protected backend routes enforce `Authorization: Bearer <token>` JWT verification.
- **Email Delivery (Nodemailer):**
  - Sends OTP verification emails, hackathon registration confirmations, and contact notifications strictly using **`Code-a-Nova`** as the sender name.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose (`mongodb-memory-server` included as local dev fallback) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt`, custom 6-digit OTP utility |
| **Email Service** | Nodemailer (Gmail SMTP via App Password) |

---

## Repository Structure

```text
code-a-nova-hackathon-portal/
├── client/                     # React + Vite + Tailwind CSS frontend
│   ├── public/
│   │   └── _redirects          # Netlify SPA fallback rule
│   ├── src/
│   │   ├── api/                # Axios instance with JWT interceptor
│   │   ├── components/         # Navbar, Footer, PrivateRoute
│   │   ├── constants/          # Colleges, courses, branches, domains, event copy
│   │   ├── context/            # AuthContext (JWT & user session state)
│   │   ├── pages/              # Home, About, Contact, Signup, OtpVerify, Login, Dashboard, Registration
│   │   └── utils/              # Client-side field validators
│   ├── .env.example
│   ├── vercel.json             # Vercel SPA rewrite rule
│   └── package.json
├── server/                     # Node.js + Express + Mongoose REST API
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection + local embedded fallback
│   ├── controllers/            # authController, userController, hackathonController, contactController
│   ├── middleware/             # authMiddleware (JWT protect), errorMiddleware
│   ├── models/                 # User, HackathonRegistration, ContactMessage
│   ├── routes/                 # authRoutes, userRoutes, hackathonRoutes, contactRoutes
│   ├── utils/                  # mailer (Nodemailer), otp, validation
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## Local Setup & Installation

### Prerequisites
- Node.js `v18+` (verified on `v24.13.1`)
- npm `v9+`
- MongoDB Atlas connection string (or use the built-in local embedded MongoDB dev fallback included in `server/devDependencies`)

### 1. Clone the Repository

```bash
git clone https://github.com/Nandhakishore-141/code-a-nova-hackathon-portal.git
cd code-a-nova-hackathon-portal
```

### 2. Backend Setup (`/server`)

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example` (or update the existing `.env` values):

```bash
cp .env.example .env
```

Start the backend server:

```bash
npm run dev
```

- The API listens on `http://localhost:5000`.
- **Database note:** If `MONGO_URI` in `server/.env` is still a placeholder during local development, `server/config/db.js` automatically starts a local embedded MongoDB instance stored in `server/.local-db` so you can test locally even without a system `mongod` installation. Replace `MONGO_URI` with your MongoDB Atlas URI for cloud persistence and production.
- **Email note:** If `EMAIL_USER` and `EMAIL_PASS` in `server/.env` are placeholders during local development, Nodemailer safely prints the OTP and confirmation preview in the backend terminal. Provide a real Gmail address and 16-character Gmail App Password to send real emails.

### 3. Frontend Setup (`/client`)

Open a second terminal:

```bash
cd client
npm install
```

Create `client/.env` from `client/.env.example`:

```bash
cp .env.example .env
```

Start the Vite dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables Guide

### Backend (`server/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Express HTTP port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/codeanova?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used to sign/verify JWTs | `long_random_hex_secret` |
| `JWT_EXPIRES_IN` | JWT expiration window | `7d` |
| `EMAIL_USER` | Dedicated Code-a-Nova Gmail address | `codeanova.hackathon@gmail.com` |
| `EMAIL_PASS` | 16-character Google App Password (no spaces) | `abcd efgh ijkl mnop` -> `abcdefghijklmnop` |
| `CONTACT_EMAIL` | Public contact email displayed in portal | `contact@codeanova.dev` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173,https://your-app.vercel.app` |

### Generating a Gmail App Password
1. Enable **2-Step Verification** on the dedicated Code-a-Nova Google account.
2. Go to **Google Account -> Security -> App passwords**.
3. Create an App Password for `Mail`, copy the 16-character password, and paste it into `EMAIL_PASS` in `server/.env`.

### Frontend (`client/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the Express API | `http://localhost:5000/api` |

---

## API Documentation

All protected endpoints require the HTTP header:
`Authorization: Bearer <jwt_token>`

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create unverified user (`bcrypt` hashed password) and email 6-digit OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit OTP (10-min limit, single-use) and mark account verified |
| `POST` | `/api/auth/resend-otp` | Public | Issue a fresh 6-digit OTP (30-second cooldown) |
| `POST` | `/api/auth/login` | Public | Authenticate with `bcrypt.compare()` and return JWT + safe user profile |

### User Profile (`/api/user`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/me` | JWT | Fetch logged-in participant profile |
| `PUT` | `/api/user/update` | JWT | Update `fullName`, `collegeName`, `mobileNumber`, or password |

### Hackathon Registration (`/api/hackathon`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/hackathon/register` | JWT | Submit 14-field registration with dynamic team members & send confirmation email |
| `GET` | `/api/hackathon/my-entry` | JWT | Fetch logged-in user's submitted hackathon entry |
| `DELETE` | `/api/hackathon/:id` | JWT | Withdraw/delete registration owned by the logged-in user |

### Contact & Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/contact` | Public | Save contact message in MongoDB and send notification email |
| `GET` | `/api/health` | Public | API health status check |

---

## Deployment Guide

### Backend (Render Web Service / Blueprint)
1. In [Render](https://dashboard.render.com), click **New + -> Blueprint** and connect this repository:
   - Render automatically detects `render.yaml` at the root!
   - Alternatively, select **New + -> Web Service**, set **Root Directory** to `server`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
2. Configure the required environment variables in Render:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: High-entropy random secret (automatically generated if using Blueprint)
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://code-a-nova-hackathon-portal.vercel.app` or `*`)
   - `EMAIL_USER`: Your Gmail address for sending verification OTPs
   - `EMAIL_PASS`: 16-character Google App Password
   - `CONTACT_EMAIL`: `contact@codeanova.dev`
3. Click **Deploy Web Service**. Once live, your backend will be accessible at `https://<your-service>.onrender.com`.

### Frontend (Vercel)
1. In [Vercel](https://vercel.com/new), click **Add New... -> Project** and import `code-a-nova-hackathon-portal`.
2. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (or leave default `./` since root `vercel.json` is configured)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (or `client/dist` if root)
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g. `https://code-a-nova-api.onrender.com/api`)
4. Click **Deploy**. Vercel will build and publish your frontend with automated SSL and SPA routing.
5. Copy your live Vercel URL and update `CLIENT_URL` in your Render backend settings so CORS allows requests from your domain.

---

## Screenshots

> Add captured screenshots before final submission:

| Screen | Preview |
| --- | --- |
| Home Page (Landing & Timeline) | `![Home Page](./docs/screenshots/home.png)` |
| Signup & 6-Digit OTP Verification | `![OTP Verification](./docs/screenshots/otp-verify.png)` |
| Participant Dashboard | `![Dashboard](./docs/screenshots/dashboard.png)` |
| Hackathon Registration Form | `![Registration Form](./docs/screenshots/registration.png)` |
| Confirmation Email Preview | `![Confirmation Email](./docs/screenshots/confirmation-email.png)` |
