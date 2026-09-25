# SE4030 – Secure Software Development Assignment

## Group Members

- A.H.R Gunathilake (Group Leader)
- Pathiraja P.W.Y.D.
- Ummu Salma M. H.
- U.D.D.S Ranasinghe

## Project

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

Found by manual (white box) review of the whole backend (routes, controllers, services, models, middleware, config) and the frontend auth flow, API layer and rendering code. Dependency issues come from `npm audit`. Suggested tools to add evidence before submitting: Semgrep (static analysis) and OWASP ZAP (black box scan of the running app).

**Severity scale:** Critical, High, Medium, Low.

### A. Authentication and session management

| # | Vulnerability | Type (CWE) | OWASP 2021 | Severity | Location | Fix |
|---|---------------|------------|------------|----------|----------|-----|
| 1 | **Privilege escalation at registration.** `role` is read from the request body, so anyone can register as `admin`. | CWE-269 Improper Privilege Management, CWE-915 | A01 Broken Access Control | Critical | `controllers/authController.js` (`completeRegister`) | Ignore client-supplied role. Allow only `user` (and `waste_collector` when the admin enabled role selection). Never `admin`. |
| 2 | **Email verification bypass.** When the OTP setting is off, `/register/initiate` returns a register token with no email check. The public `GET /api/settings` also tells attackers whether the bypass is on. | CWE-287 Improper Authentication, CWE-200 | A07 Identification and Authentication Failures | High | `authController.initiateRegister`, `routes/settingsRoutes.js` | Always require the OTP. Add a `purpose: 'register'` claim to the register token and check it. Restrict `/api/settings` to the fields the UI needs. |
| 3 | **Weak OTP handling.** OTP generated with `Math.random()`, stored in plaintext, no attempt limit, and written to logs (`Generated OTP: ...`, plus the email fallback log). | CWE-338 Weak PRNG, CWE-256/312 Plaintext storage, CWE-307, CWE-532 | A02 Cryptographic Failures, A07 | High | `authController`, `services/emailService.js`, `models/RegistrationOTP.js`, `models/User.js` | `crypto.randomInt`, store an HMAC of the OTP, expire it, cap attempts at 5, single use, remove OTP logging. |
| 4 | **No rate limiting.** Login, OTP verify, forgot-password and register can be brute-forced or spammed with emails. | CWE-307 Excessive Authentication Attempts, CWE-770 | A07 | High | `routes/authRoutes.js`, `index.js` | `express-rate-limit` on auth routes and a general API limit. |
| 5 | **NoSQL operator injection.** `req.body.email` goes straight into `findOne({ email })`. Sending `{"email": {"$ne": null}}` to forgot-password matches the first user in the database and returns that user's id. | CWE-943 Improper Neutralization in Data Query Logic | A03 Injection | High | `authController` (`login`, `forgotPassword`, `verifyRegisterOTP`) | Require `typeof email === 'string'`, use `express-mongo-sanitize`. |
| 6 | **Over-long JWT lifetime, no revocation.** `expiresIn: 360000` seconds (about 100 hours). | CWE-613 Insufficient Session Expiration | A07 | Medium | `authController` | 1–2 hour access token, configurable through an environment variable. |
| 7 | **User enumeration.** Forgot-password returns "User not found"; registration says "User already exists"; login timing differs for unknown emails. | CWE-204 Observable Response Discrepancy, CWE-208 | A07 | Medium | `authController` | Same response whether or not the account exists; dummy bcrypt compare for unknown emails. |
| 8 | **Weak password and input validation.** Any password (even one character) is accepted. No checks on email, username, phone. | CWE-521 Weak Password Requirements, CWE-20 | A07, A04 | Medium | `authController` | Password policy (8+ chars, upper, lower, digit), `validator` for email, length checks. |
| 9 | **Token stored in `localStorage`.** An XSS bug would expose it. (No XSS sink was found, so this is defence in depth.) | CWE-922 Insecure Storage of Sensitive Information | A02 | Medium | `frontend/src/context/AuthContext.jsx`, `services/api.js` | Move to an HttpOnly cookie, or document as an accepted risk (see "Not fixed"). |

### B. Access control and data exposure

| # | Vulnerability | Type (CWE) | OWASP 2021 | Severity | Location | Fix |
|---|---------------|------------|------------|----------|----------|-----|
| 10 | **Mass assignment.** `Object.assign(product, req.body)`; `req.body` passed directly to `findByIdAndUpdate` for disasters, actions, articles. A seller can change `seller`, `status`, `co2Saved`. An action owner can overwrite `likes`, `comments`, `reports`, `isFlagged` and `createdBy` (inflate score, un-flag reported content). | CWE-915 Improperly Controlled Modification of Object Attributes | A01, A04 | High | `productController.updateProduct`, `disasterController.updateDisaster`, `actionController.updateAction`, `articleController.updateArticle` | Whitelist the allowed fields for each update. |
| 11 | **Seller contact details exposed publicly.** `GET /api/products` populates `seller` with `email` and `mobileNumber` for unauthenticated users. | CWE-359 Exposure of Private Personal Information, CWE-200 | A01 | Medium | `productController.getProducts` / `getProductById` | Return only `username`, or require auth for contact details. |
| 12 | **Unpublished (draft) articles readable by anyone.** `getArticleById` looks up by id with no `isPublished` check. | CWE-639 Authorization Bypass via User-Controlled Key, CWE-284 | A01 | Low | `articleController.getArticleById` | Filter on `isPublished: true` unless the requester is an admin. |
| 13 | **Unauthenticated Gemini endpoint.** Anyone can call `/api/gemini/generate` and spend the API key quota. The key is in the URL query string and upstream error bodies are returned to the client. | CWE-306 Missing Authentication, CWE-770, CWE-598 Sensitive Data in URL, CWE-209 | A04, A05 | Medium | `routes/gemini.js` | Require auth, strict rate limit, cap input length, send the key in the `x-goog-api-key` header, generic error message. |
| 14 | **Public proxy to an external API.** `GET /api/disasters/live-fema` needs no login and calls FEMA on every request. | CWE-770 Allocation of Resources Without Limits | A04 | Low | `routes/disasterRoutes.js` | Require auth, cache the result, rate limit. |

### C. Injection and input handling

| # | Vulnerability | Type (CWE) | OWASP 2021 | Severity | Location | Fix |
|---|---------------|------------|------------|----------|----------|-----|
| 15 | **Regex injection / ReDoS.** The `search` query value is used in `$regex` unescaped. | CWE-1333 Inefficient Regular Expression Complexity, CWE-943 | A03 | Medium | `supportTicketController` (`getMyTickets`, `getAllTicketsAdmin`) | Escape regex special characters and cap the length. |
| 16 | **Query parameter injection in the weather API.** `city`, `lat`, `lon` are concatenated into the OpenWeather URL without encoding, so a caller can add or override parameters such as `units` or `appid`. | CWE-88 Argument Injection, CWE-20 | A03 | Low | `controllers/weatherController.js` | Pass values through axios `params`, validate `lat`/`lon` as numbers, limit `city` length. |
| 17 | **Missing input validation and limits.** Comment text, report reason, ticket text and product fields have no length or type checks. Product `price` can be negative. Audit inputs are not range-checked, so a negative usage value earns the maximum score. `JSON.parse(req.body.existingImages)` is unguarded, and image URLs can be arbitrary. | CWE-20 Improper Input Validation, CWE-840 Business Logic Errors | A04 | Low | `actionController`, `productController`, `auditController`, `supportTicketController`, `scoringController` | Validate with a schema library (e.g. `validator`/`joi`), enforce ranges and maximum lengths. |
| 18 | **Unrestricted file upload.** No size limit or MIME check, only a Cloudinary format hint. | CWE-434 Unrestricted Upload, CWE-400 | A04, A05 | Medium | `middleware/upload.js` | `limits.fileSize` (5 MB), allow only JPEG, PNG and WEBP. |

### D. Configuration, secrets and error handling

| # | Vulnerability | Type (CWE) | OWASP 2021 | Severity | Location | Fix |
|---|---------------|------------|------------|----------|----------|-----|
| 19 | **Hardcoded credentials committed to the repository.** `backend/readFirst.txt` held a real MongoDB connection string with password, the JWT secret, the Gemini API key and the Gmail app password. The same JWT secret was also hardcoded as a fallback in `backend/tests/helpers/authHelper.js`. The file was deleted from the working tree but the secrets remain readable in git history (commits `eff5191`, `5bc6dc2`). Anyone with repo access can read the database and forge admin tokens. | CWE-798 Hardcoded Credentials, CWE-540 Sensitive Information in Source Code | A02, A05 | **Critical** | `backend/readFirst.txt`, `backend/tests/helpers/authHelper.js` | Removed the hardcoded fallback in `authHelper.js` (tests now require `JWT_SECRET` from the environment), added `backend/.env.example` with placeholders, and hardened `.gitignore`. **Still required:** rotate every leaked secret (Atlas password, `JWT_SECRET`) and purge the file from git history (`git filter-repo` / BFG). |
| 20 | **Missing security headers and request limits.** No `helmet`, no body size limit (Express default 100 KB is implicit). | CWE-693 Protection Mechanism Failure, CWE-1021 | A05 Security Misconfiguration | Medium | `backend/src/index.js` | `helmet()`, `express.json({ limit: '100kb' })`. |
| 21 | **Sensitive data in logs and error responses.** Login logs email and payload; many controllers return `error.message`, `err.errors` or `'Server Error: ' + err.message` to the client; upstream API error bodies are forwarded. | CWE-532 Insertion of Sensitive Information into Log, CWE-209 Error Message Information Exposure | A09 Logging Failures, A05 | Medium | `authController`, `productController`, `articleController`, `orderController`, `auditController`, `weatherController`, `routes/gemini.js` | Log without secrets, return generic messages, add a central error handler. |
| 22 | **Unhandled exceptions can crash the server.** `updateDisaster` and `deleteDisaster` have no `try/catch`, so an invalid id causes an unhandled promise rejection, which terminates the process on Node 15+. There is no global error handler, and a failed DB connection is swallowed. | CWE-248 Uncaught Exception, CWE-755 Improper Handling of Exceptional Conditions | A05, A04 | Medium | `disasterController.js`, `index.js`, `config/db.js` | Wrap handlers (or use an async wrapper), validate ids with `mongoose.isValidObjectId`, add a global error handler. |
| 23 | **Race condition when placing orders.** The controller checks `product.status === 'Available'` and then saves, so two buyers can order the same product at the same time. | CWE-362 Race Condition (TOCTOU) | A04 Insecure Design | Medium | `orderController.createOrder` | Atomic `findOneAndUpdate({ _id, status: 'Available' }, { status: 'Reserved' })`. |
| 24 | **Null-dereference crash on deleted references.** `getBins` uses `bin.user._id`; if the bin's user was deleted this throws and the whole list fails. Like/comment/report on an unknown id throws a `TypeError` whose message is returned to the client. | CWE-476 NULL Pointer Dereference | A04 | Low | `wasteController.getBins`, `actionController` | Null checks, return 404. |
| 25 | **Vulnerable dependencies.** `npm audit` reported 16 issues (9 high, 7 moderate), including `path-to-regexp` (ReDoS) and `qs` (DoS) through `express`. | CWE-1104 Use of Unmaintained Third-Party Components, CWE-1395 | A06 Vulnerable and Outdated Components | High | `backend/package.json` | `npm audit fix`, then re-run the audit and keep before/after output for the report. |
| 26 | **Hardcoded production API URL in the frontend.** `apiConfig.js` points at the deployed Render backend, so local development and tests hit production data. | CWE-1188 Insecure Default Initialization | A05 | Low | `frontend/src/config/apiConfig.js` | Use `import.meta.env.VITE_API_URL`. |
| 27 | **Test and report artifacts committed.** `backend/playwright-report/`, `test-results/` and `reports/artillery_report.json` are checked in; the Playwright report contains an `Authorization` header/token string. The `test_*.sh` scripts use fixed passwords (`password123`). | CWE-540, CWE-798 | A05 | Low | `backend/playwright-report`, `backend/test_*.sh` | Add them to `.gitignore`, remove from the repo, read test credentials from environment variables. |

**Total: 27 findings** (2 Critical, 6 High, 12 Medium, 7 Low; well above the 7 required).

### Reviewed and found acceptable (mention in the report)

- React escapes rendered output; no `dangerouslySetInnerHTML`, `eval` or `innerHTML` in the frontend. `react-markdown` (used for the chatbot) does not render raw HTML.
- External links use `rel="noopener noreferrer"`.
- Passwords are hashed with bcrypt.
- Ownership checks exist for audits, orders, tickets, products and action edits; admin-only routes use the `admin` middleware; `GET /api/weather` requires login.
- CORS uses an explicit origin allow-list.
- `.env` is gitignored, and `render.yaml` reads secrets from the Render dashboard (`sync: false`).

### Suggested items to leave unfixed (explain in the report)

- **#9 token in `localStorage`:** moving to HttpOnly cookies means adding CSRF protection and changing every frontend request, which is a large change for the assignment's scope. Document it as an accepted risk and note the mitigations (short token lifetime after #6, no XSS sinks found).
- **#11 seller contact details:** the marketplace uses them for buyer-seller contact, so removing them changes the feature. Fix by requiring login instead, or accept and document.
- **#19 git history purge:** rotating the secrets is required; rewriting the history of the original third-party repository is not possible for you. In the new repo, start from a clean history or purge the file.

### Limitations of this review

- Manual code review only; Semgrep and OWASP ZAP have not been run yet. Their output should be added as evidence.
- I could not check whether `readFirst.txt` or other secrets exist in the git history of the original repo; check with `git log --all -- backend/readFirst.txt`.
- The deployed site was not tested.

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

## Suggested commit plan (one commit per change, detailed messages)

1. Baseline: original code, unchanged.
2. Fix #19: remove `readFirst.txt`, add `.env.example`, rotate secrets.
3. Fix #25: dependency updates (`npm audit fix`), including before/after audit output.
4. Fix #1: block admin role self-assignment.
5. Fix #2, #3: mandatory OTP, secure and hashed OTP with attempt limit.
6. Fix #4: rate limiting.
7. Fix #5: NoSQL operator injection (type checks and sanitization).
8. Fix #10: whitelist updatable fields.
9. Fix #15: escape search regex.
10. Fix #13, #14: secure the Gemini endpoint and the FEMA proxy.
11. Fix #20: helmet and body limits.
12. Fix #6, #7, #8: token lifetime, generic responses, password and input validation.
13. Fix #11, #12: seller contact exposure, draft articles.
14. Fix #16, #17: weather parameters, input validation.
15. Fix #18: upload limits.
16. Fix #21, #22, #24: error handling, logging cleanup, null checks.
17. Fix #23: atomic order placement.
18. Fix #26, #27: frontend API URL from env, remove committed artifacts.
19. Feature: Google OAuth 2.0 / OIDC login.
20. Docs: final report and this README.

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

## 🛠️ Deployment Process

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

## 🔐 Environment Variables

Sensitive values such as API keys, database URLs, and secrets are not stored directly in the source code.

Instead:
- backend environment variables are configured in **Render**
- frontend environment variables are configured in **Vercel**

This makes the deployment more secure and easier to manage across different environments.

---

## 🔄 Automatic Updates

After the hosting platforms are connected to GitHub:

- pushing backend changes can trigger a new backend deployment on Render
- pushing frontend changes can trigger a new frontend deployment on Vercel

This helps keep the live application updated with the latest code changes.

---

## ✅ Summary

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
```
backend/
 ├── src/
 │   ├── index.js
 │   ├── routes/
 │   ├── controllers/
 │   ├── models/
 │   ├── middleware/
 │   ├── services/
 │   └── utils/
```

## Frontend
```
frontend/
 ├── src/
 │   ├── pages/
 │   ├── components/
 │   ├── layouts/
 │   ├── services/
 │   ├── config/
 │   └── context/
```

---

# ⚙️ Local Setup

## Backend Setup
```bash
cd backend
npm install
npm start
```

Create `.env` file inside backend:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_key
```

Backend runs at:
```
http://localhost:5000/api
```

---

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

# 🌐 API Documentation

## Base URL

Production:
```
https://household-sustainability-system.onrender.com/api
```

Local:
```
http://localhost:5000/api
```

---

# 🔑 AUTH API (/api/auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register/initiate | Start registration and send OTP |
| POST | /auth/register/verify | Verify OTP |
| POST | /auth/register/complete | Complete registration |
| POST | /auth/login | Login and receive JWT |
| POST | /auth/forgot-password | Send reset link |
| POST | /auth/reset-password | Reset password |

---

# 👤 USER API (/api/user)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /user/profile | Get logged-in user profile |

---

# 🛡 ADMIN API (/api/admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/dashboard | Admin dashboard |
| GET | /admin/users | Get all users |
| PUT | /admin/users/:id | Update user |
| DELETE | /admin/users/:id | Delete user |

---

# ⚡ ISSUE MANAGEMENT (/api/issues)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /issues | Create support ticket |
| GET | /issues/my | Get user tickets |
| GET | /issues/:id | Get specific ticket |
| POST | /issues/:id/messages | Add message |
| GET | /issues | Get all tickets |
| PUT | /issues/:id | Update ticket |
| DELETE | /issues/:id | Delete ticket |

---

# 🌪 DISASTER MANAGEMENT (/api/disasters)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /disasters | Get disasters |
| GET | /disasters/:id | Get single disaster |
| POST | /disasters | Create disaster |
| PUT | /disasters/:id | Update disaster |
| DELETE | /disasters/:id | Delete disaster |

---

# ♻️ WASTE MANAGEMENT (/api/waste)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /waste | Get user waste logs |
| POST | /waste | Create waste entry |
| PUT | /waste/:id | Update waste |
| GET | /waste/all | Get all waste records |

---

# 🛒 MARKETPLACE PRODUCTS (/api/products)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | Get all products |
| GET | /products/:id | Get single product |
| POST | /products | Create product |
| PUT | /products/:id | Update product |
| DELETE | /products/:id | Delete product |
| GET | /products/my | Get user's products |
| GET | /products/admin | Get all products (admin) |

---

# 📦 ORDERS (/api/orders)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Create order |
| GET | /orders | Get user orders |
| GET | /orders/admin | Get all orders |
| PUT | /orders/:id | Update order status |

---

# 📝 ARTICLES (/api/articles)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /articles | Get published articles |
| GET | /articles/:id | Get single article |
| POST | /articles | Create article |
| PUT | /articles/:id | Update article |
| DELETE | /articles/:id | Delete article |

---

# 📊 ACTIONS (/api/actions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /actions | Get actions |
| POST | /actions | Create action |
| PUT | /actions/:id | Update action |
| DELETE | /actions/:id | Delete action |

---

# 🤖 GEMINI API (/api/gemini)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /gemini | Get AI recommendation |

---

# 🌦 WEATHER API (/api/weather)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /weather | Get weather data |

---

# 📘 API Usage Guide

This document explains:

- HTTP Methods used
- Authentication requirements
- Request format
- Response format
- Example requests & responses

Base URL (Production):
https://household-sustainability-system.onrender.com/api

Base URL (Local):
http://localhost:5000/api

------------------------------------------------------------

# 📌 HTTP Methods Used

GET
- Used to retrieve data
- Does NOT modify data

POST
- Used to create new data

PUT
- Used to update existing data

DELETE
- Used to remove data

------------------------------------------------------------

# 🔐 Authentication Requirements

Most protected endpoints require JWT authentication.

After login, the server returns a JWT token.

All protected requests must include this header:

Authorization: Bearer <JWT_TOKEN>

Example:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Admin-only endpoints require:
- Valid JWT
- role = "admin"

------------------------------------------------------------

# 📄 Request Format

All requests use JSON format.

Headers:

Content-Type: application/json

Example Request Body:

{
  "title": "High electricity bill",
  "monthlyBillLKR": 6777,
  "monthlyKwh": 321
}

------------------------------------------------------------

# 📦 Response Format

Success Response Example:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

Error Response Example:

{
  "success": false,
  "message": "Error message"
}

Note:
Some endpoints return direct objects or arrays instead of wrapped "success/data".

------------------------------------------------------------

# 🔑 AUTHENTICATION EXAMPLE

## Login

POST /api/auth/login

Request:

{
  "email": "user@gmail.com",
  "password": "123456"
}

Response:

{
  "success": true,
  "token": "jwt_token_here"
}

------------------------------------------------------------

# ⚡ ISSUE MANAGEMENT EXAMPLE

## Create Support Ticket

POST /api/issues
Authorization: Bearer <JWT_TOKEN>

Request:

{
  "title": "High electricity bill",
  "category": "High Bill",
  "monthlyBillLKR": 6777,
  "monthlyKwh": 321,
  "text": "My bill increased suddenly."
}

Response:

{
  "_id": "66aa123",
  "title": "High electricity bill",
  "status": "new",
  "priority": "low"
}

------------------------------------------------------------

# 🌪 DISASTER MANAGEMENT EXAMPLE

## Create Disaster (Admin Only)

POST /api/disasters
Authorization: Bearer <ADMIN_TOKEN>

Request:

{
  "title": "Flood Warning",
  "type": "Flood",
  "severity": "high",
  "status": "active"
}

Response:

{
  "_id": "77bb123",
  "title": "Flood Warning",
  "severity": "high",
  "status": "active"
}

------------------------------------------------------------

# 🛒 MARKETPLACE EXAMPLE

## Create Product

POST /api/products
Authorization: Bearer <JWT_TOKEN>

Request:

{
  "name": "Reusable Bottle",
  "price": 2500,
  "stock": 10
}

Response:

{
  "_id": "99dd123",
  "name": "Reusable Bottle",
  "price": 2500
}

------------------------------------------------------------

# ♻️ WASTE MANAGEMENT EXAMPLE

## Create Waste Entry

POST /api/waste
Authorization: Bearer <JWT_TOKEN>

Request:

{
  "type": "Plastic",
  "quantity": 5
}

Response:

{
  "_id": "88cc123",
  "type": "Plastic",
  "quantity": 5
}

------------------------------------------------------------

# 📦 ORDER EXAMPLE

## Create Order

POST /api/orders
Authorization: Bearer <JWT_TOKEN>

Request:

{
  "productId": "99dd123",
  "quantity": 2
}

Response:

{
  "_id": "aaee123",
  "status": "pending",
  "quantity": 2
}

------------------------------------------------------------

# 📝 ARTICLE EXAMPLE

## Create Article (Admin)

POST /api/articles
Authorization: Bearer <ADMIN_TOKEN>

Request:

{
  "title": "Save Energy",
  "content": "Reduce AC usage",
  "isPublished": true
}

Response:

{
  "success": true,
  "message": "Article created successfully"
}

------------------------------------------------------------

# 🤖 GEMINI AI EXAMPLE

POST /api/gemini
Authorization: Bearer <JWT_TOKEN>

Request:

{
  "prompt": "Give energy saving tips"
}

Response:

{
  "success": true,
  "answer": "Try using LED bulbs and reduce standby power."
}

------------------------------------------------------------

# 🌦 WEATHER API EXAMPLE

GET /api/weather?city=Colombo

Response:

{
  "city": "Colombo",
  "temp": 29,
  "condition": "Cloudy"
}

# 🚀 Future Improvements
- Complete full frontend UI polish
- Add unit testing (Jest)
- Add performace testing
- Add load testing
- Add analytics dashboards


---

# 👥 Project Type
Software Engineering Academic Group Project  
Secure RESTful API with MongoDB Integration
