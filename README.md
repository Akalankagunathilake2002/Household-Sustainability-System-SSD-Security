# SE4030 – Secure Software Development Assignment

## Group Members

- A.H.R Gunathilake (Group Leader)
- Pathiraja P.W.Y.D.
- Ummu Salma M. H.
- U.D.D.S Ranasinghe

## Project#

**Household Sustainability System (EcoPulse)** – a MERN application (Express + MongoDB backend, React/Vite frontend) for household energy audits, waste management, disaster alerts, a green marketplace and AI-based sustainability recommendations.

## Links

| Item | Link |
|------|------|
| Original project (third party, before fixes) | https://github.com/Dilmith-Ranasinghe518/Household-Sustainability-System |
| Modified project (after fixing vulnerabilities) | https://github.com/Akalankagunathilake2002/Household-Sustainability-System-SSD-Security |
| YouTube video (max 20 min) | _TODO: add link once recorded_ |

The commit history of the modified repository is part of the submission. Each vulnerability is fixed in its own commit with a detailed message (see "Suggested commit plan").

---

## Vulnerabilities identified in the original application

The security review identified 16 vulnerabilities. The first 8 vulnerabilities were fixed as part of the security hardening work, while the remaining 8 vulnerabilities are documented as unresolved items.

### A. Vulnerabilities solved

| # | Vulnerability | CWE | OWASP Category | Affected Component(s) | Severity |
|---|---|---|---|---|---|
| 1 | **Privilege Escalation at Registration** | CWE-269, CWE-602 | A01 – Broken Access Control | `authController.js`, `models/User.js`, `authMiddleware.js`, `frontend/../Register.jsx` | High |
| 2 | **Hardcoded Credentials** | CWE-798, CWE-321 | A02 – Cryptographic Failures; A05 – Security Misconfiguration; A07 – Identification and Authentication Failures | `helpers/authHelper.js`, `backend/readFirst.txt` | High |
| 3 | **NoSQL Operator Injection** | CWE-943 | A03 – Injection | `authController.js` | High |
| 4 | **Unauthenticated Gemini Endpoint** | CWE-306, CWE-770, CWE-598 | A04 – Insecure Design; A05 – Security Misconfiguration | `routes/gemini.js` | Medium |
| 5 | **Mass Assignment** | CWE-915 | A04 – Insecure Design | `productController.js`, `disasterController.js`, `articleController.js`, `actionController.js` | High |
| 6 | **Sensitive Data Exposure** | CWE-532 | A09 – Security Logging and Monitoring Failures; A05 – Security Misconfiguration | `authController.js`, `productController.js`, `articleController.js`, `orderController.js`, `auditController.js`, `weatherController.js`, `routes/gemini.js`, `services/emailService.js` | Medium |
| 7 | **Weak OTP Handling** | CWE-338, CWE-256 | A02 – Cryptographic Failures; A07 – Identification and Authentication Failures | `authController.js`, `models/ResgistraionOTP.js`, `models/User.js` | High |
| 8 | **Vulnerable Dependencies** | CWE-1104, CWE-1395 | A06 – Vulnerable and Outdated Components | `backend/package.json` | High |

### B. Vulnerabilities not solved

| # | Vulnerability | CWE | OWASP Category | Affected Component(s) | Severity |
|---|---|---|---|---|---|
| 9 | **JWT Stored in localStorage** | CWE-922 | A02 – Cryptographic Failures | `frontend/…/context/AuthContext.jsx`, `services/api.js` | Medium |
| 10 | **Seller Contact Exposure** | CWE-359 | A01 – Broken Access Control | `productController` | Medium |
| 11 | **Draft Articles Are Accessible** | CWE-639, CWE-284 | A01 – Broken Access Control | `articleController` | Low |
| 12 | **Public FEMA Proxy** | CWE-770 | A04 – Insecure Design | `routes/disasterRoutes.js` | Low |
| 13 | **Weather Parameter Injection** | CWE-88, CWE-20 | A03 – Injection | `weatherController.js` | Low |
| 14 | **Missing Input Validation** | CWE-20, CWE-840 | A04 – Insecure Design | `actionController`, `productController`, `auditController`, `supportTicketController`, `scoringController` | Low |
| 15 | **Null-Reference Errors** | CWE-476 | A04 – Insecure Design | `wasteController`, `actionController` | Low |
| 16 | **Test/Report Artifacts** | CWE-540, CWE-798 | A05 – Security Misconfiguration | `backend/playwright-report`, `backend/test_*.sh` | Low |

### Vulnerability Status Summary

- **Total vulnerabilities identified:** 16
- **Solved vulnerabilities:** 8
- **Unsolved vulnerabilities:** 8
- **High severity:** 5
- **Medium severity:** 3
- **Low severity:** 8

The solved vulnerabilities cover privilege escalation, hardcoded credentials, NoSQL operator injection, an unauthenticated Gemini endpoint, mass assignment, sensitive data exposure, weak OTP handling, and vulnerable dependencies. The remaining vulnerabilities are documented separately as items that were not solved within the implemented security changes.

---

## OAuth 2.0 / OpenID Connect feature: "Sign in with Google"

**Grant type:** Authorization Code with PKCE and the `openid email profile` scopes.

**Flow**
1. The user clicks "Continue with Google" on the login page.
2. `GET /api/auth/google` generates `state` and a PKCE `code_verifier`, stores them in a short-lived server-side store, and redirects to Google.
3. Google redirects to `GET /api/auth/google/callback?code=...&state=...`.
4. The backend checks `state`, exchanges the code (with the verifier) for tokens, and verifies the ID token (`google-auth-library`, checking audience and `email_verified`).
5. The backend finds the user by `googleId` or verified email, or creates one with the `user` role only. It then issues the app's own JWT.
6. The backend redirects to the frontend, which completes the login (use a short-lived one-time exchange code rather than putting the JWT in the URL).

**Changes needed**
- Backend: `models/User.js` (`googleId`, `authProvider`, password required only for local accounts), new routes and controller for the Google flow, environment variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- Frontend: "Continue with Google" button on `Login.jsx`, and an `/oauth/callback` page that stores the token through `AuthContext`.
- Google Cloud Console: create an OAuth client and add the redirect URIs for local and deployed environments.

---

## Report outline

1. Application overview
2. Testing methodology and tools (with screenshots or output)
3. Each vulnerability: description, evidence, impact, fix (before/after code)
4. Vulnerabilities not fixed and the reason
5. OAuth / OpenID Connect implementation
6. Secure SDLC practices that would have prevented these issues: threat modelling at design time, secure code review checklists, SAST, secret scanning and dependency scanning in CI, input validation library standards, least-privilege defaults, secrets management, security-focused unit tests

---

# Original Project README

# 🌱 Household Sustainability System

A full-stack sustainability platform that helps households monitor energy usage, report electricity issues, manage waste, access disaster alerts, use a green marketplace, and receive AI-powered sustainability recommendations.

---

# 🌍 Live Deployment

### Backend (Render)
https://household-sustainability-system.onrender.com/api

### Frontend
https://household-sustainability-system.vercel.app/

# 🚀 Deployment Guide

This project uses a split deployment setup:

- **Backend** is hosted on **Render**
- **Frontend** is hosted on **Vercel**

This setup allows the frontend and backend to be deployed independently while still working together as one full-stack application.
---

## 🧩 How Deployment Works

The system is deployed in two parts:

### 1. Frontend on Vercel
The frontend contains the user interface of the application.  
It is responsible for:

- showing pages and dashboards
- handling navigation
- collecting user input
- sending requests to the backend API

When a user opens the website, they are using the frontend hosted on Vercel.

### 2. Backend on Render
The backend contains the server-side logic and API endpoints.  
It is responsible for:

- authentication and authorization
- database operations
- handling business logic
- processing user requests
- returning data to the frontend

When the frontend needs data, it sends a request to the backend hosted on Render.

---

## 🔁 Request Flow

The deployment flow works like this:

1. The user opens the frontend on Vercel
2. The frontend sends API requests to the Render backend
3. The backend processes the request
4. The backend connects to the database and returns a response
5. The frontend displays the returned data to the user

In simple terms:

**User → Vercel Frontend → Render Backend → Database → Frontend → User**

---

## ⚙️ Why Use Render for Backend and Vercel for Frontend

This project uses two platforms because each one is well suited for a different part of the system.

### Render is used for the backend because:
- it is suitable for hosting Node.js/Express backend services
- it supports environment variables securely
- it can redeploy automatically when code is pushed
- it is easy to connect with GitHub repositories

### Vercel is used for the frontend because:
- it is very convenient for deploying modern frontend applications
- it supports fast frontend builds and updates
- it works well with GitHub-based deployment
- it automatically creates production deployments from the connected project

---

# 🛠️ Deployment Process

### Backend Deployment on Render

The backend is deployed by connecting the GitHub repository to Render as a Web Service.

Basic process:

1. Connect the GitHub repository to Render
2. Select the backend service or backend root folder
3. Add environment variables in Render dashboard
4. Set build and start commands
5. Deploy the backend
6. Render provides a live backend URL

### Frontend Deployment on Vercel

The frontend is deployed by connecting the same GitHub repository to Vercel.

Basic process:

1. Connect the GitHub repository to Vercel
2. Select the frontend root folder
3. Add environment variables if needed
4. Set the frontend framework/build settings
5. Deploy the frontend
6. Vercel provides a live frontend URL

---

# 🔐 Environment Variables

Sensitive values such as API keys, database URLs, and secrets are not stored directly in the source code.

Instead:

- backend environment variables are configured in **Render**
- frontend environment variables are configured in **Vercel**

This makes the deployment more secure and easier to manage across different environments.

---

# 🔄 Automatic Updates

After the hosting platforms are connected to GitHub:

- pushing backend changes can trigger a new backend deployment on Render
- pushing frontend changes can trigger a new frontend deployment on Vercel

This helps keep the live application updated with the latest code changes.

---

# ✅ Summary

This project uses a modern full-stack deployment strategy:

- **Frontend** is deployed on **Vercel**
- **Backend** is deployed on **Render**
- both services are connected through API communication
- GitHub is used as the source for deployment
- environment variables are managed securely in each platform

This deployment approach makes the system easier to maintain, update, and scale.
---

# ✨ System Features

## 1️⃣ User Management System
- User registration with OTP verification
- Secure login using JWT
- Forgot password & reset password
- Role-based access (User / Admin)
- Protected routes

---

## 2️⃣ Waste Management System
- Users create and track waste logs
- Admin monitors all waste entries
- MongoDB-based data storage

---

## 3️⃣ Sustainability Marketplace
- Product listing
- Create, update, delete products
- User-specific product management
- Order creation
- Automatic order expiry via cron job

---

## 4️⃣ Issue Reporting & Management (Support Tickets)
- Users report electricity-related issues
- Provide bill amount, kWh usage, and time period
- Admin reviews and responds
- Ticket status tracking:
  - new
  - need_more_info
  - in_progress
  - resolved
  - closed
- Message thread between user and admin

---

## 5️⃣ Disaster Management System
- Admin creates disaster alerts (Flood, Fire, etc.)
- Update severity and status
- Users view disaster alerts

---

## 6️⃣ Recommendation, Actions & Blog System
- Sustainability action tracking
- Blog/article publishing
- Gemini AI integration
- Weather API integration

---

# 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Security
- JWT Authentication
- Role-based Authorization
- CORS configuration
- Input validation
- Error handling

### Deployment
- Backend → Render
- Frontend → Vercel

---

# 🏗 Project Structure

## Backend
```text
backend/
 ├── src/
 │   ├── index.js
 │   ├── routes/
 │   ├── controllers/
 │   ├── models/
 │   ├── middleware/
 │   ├── services/
 │   └── utils/
