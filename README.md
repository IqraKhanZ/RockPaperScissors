# NewProject

Full-stack Rock Paper Scissors web app with a React (Vite) frontend and a Node.js/Express backend connected to MongoDB.

## What this website is

This is a Rock Paper Scissors game project that uses OpenCV and MediaPipe for hand-gesture based gameplay, along with a complete auth flow:
- Sign up and login
- Email verification and OTP flow
- Forgot password and change password
- Google OAuth login
- Protected user session (`/home` route in frontend)

Frontend lives in `my-react-app/` and backend API lives in `backend/`.

## Tech stack

- Frontend: React 19 + Vite + React Router
- Backend: Node.js + Express
- Game/vision: OpenCV + MediaPipe (hand gesture detection)
- Database: MongoDB (Mongoose)
- Auth: JWT + Passport (Google OAuth)
- Email: Nodemailer + Handlebars templates

## Project structure

```text
newproject/
├─ backend/
│  ├─ Controllers/
│  ├─ Middlewares/
│  ├─ Models/
│  ├─ Routes/
│  └─ index.js
├─ my-react-app/
│  ├─ src/
│  └─ vite.config.js
└─ .gitignore
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas (or local MongoDB)
- Gmail App Password (for email sending)
- Google OAuth credentials (optional but required for Google login)

## Environment variables

Create `backend/.env` with values like:

```env
PORT=8080
MONGO_CONN=mongodb+srv://<username>:<password>@<cluster>/<dbName>
JWT_SECRET=<your_jwt_secret>
MAIL_USER=<your_email@gmail.com>
MAIL_PASS=<your_gmail_app_password>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
CLIENT_URL=http://localhost:5173
```

Create `my-react-app/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Install dependencies

From project root, run:

```bash
cd backend
npm install

cd ../my-react-app
npm install
```

## Run locally

Use two terminals.

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd my-react-app
npm run dev
```

Then open: `http://localhost:5173`

## Live demo

You can test the website here: **https://rock-paper-scissors-frontend-theta.vercel.app/**

> **Note:** No videos are recorded, stored, or uploaded by this app. Camera access is used only for live hand-gesture detection during gameplay.

## Main API routes

- Health: `GET /ping`
- Auth routes: `POST /auth/signup`, `POST /auth/login`, `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/me`
- User routes: `POST /user/register`, `POST /user/verify`, `POST /user/login`, `POST /user/logout`, `POST /user/forgot-password`, `POST /user/verify-otp/:email`, `POST /user/change-password/:email`

Base local backend URL: `http://localhost:8080`

## Scripts

### Backend (`backend/package.json`)
- `npm run start` – run server
- `npm run dev` – run with nodemon

### Frontend (`my-react-app/package.json`)
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built app
- `npm run lint` – run ESLint

## Deployment notes

- Both apps include `vercel.json`.
- Set all required environment variables in your hosting dashboard.
- Update `CLIENT_URL` and `VITE_API_BASE_URL` to production URLs.

## Security notes

- Never commit real credentials (Mongo URI, JWT secret, mail password, OAuth secrets).
- Keep `.env` files private (already covered in root `.gitignore`).
- If secrets were exposed before, rotate them immediately.
