# 🔒 06. Security Audit & Best Practices

This document provides a comprehensive security analysis and improvement plan for the ShopSphere project. It is organized by stack layer and complexity level.

---

## 🛡 1. Basic Security (Must-Have)

### 🔴 High Risk: Missing Input Validation & Sanitization

**What It Prevents:** SQL/NoSQL Injection, Cross-Site Scripting (XSS).
**Why Important:** Without validation, attackers can send malicious data that executes code on your server or database.

**Where to Add:**
-   **Backend**: `controllers/userController.js`, `controllers/productController.js` (before processing `req.body`).

**Implementation Strategy:**
1.  **Use Libraries**: Install `joi` or `express-validator`.
2.  **Define Schemas**: Create validation schemas for every API endpoint (e.g., email must be valid format, password must be min 8 chars).
3.  **Sanitize**: Strip HTML tags from user inputs (like product descriptions) to prevent XSS.

**Real-World Example:**
An attacker registers with `{"email": {"$ne": null}, "password": "password"}`. If not validated, this NoSQL injection could log them in as the first user found (often the admin).

---

### 🔴 High Risk: CORS Misconfiguration

**What It Prevents:** Unauthorized websites from making requests to your API.
**Why Important:** By default, `cors()` allows all origins (`*`). This means a malicious site can fetch data from your API if a user visits it.

**Where to Add:**
-   **Backend**: `server.js`.

**Implementation Strategy:**
1.  **Restrict Origin**: Configure `cors` to only allow your frontend domain.
    ```javascript
    app.use(cors({
        origin: ["http://localhost:5173", "https://your-production-site.com"],
        credentials: true
    }));
    ```

**Real-World Example:**
A phishing site makes an AJAX request to your banking API. Since CORS is open, the browser allows the request, and the attacker steals data.

---

### 🟠 Medium Risk: Environment Variable Exposure

**What It Prevents:** Leaking sensitive keys (Stripe Secret, DB URI).
**Why Important:** If `.env` is committed to Git, anyone can access your database or charge your users.

**Where to Add:**
-   **Root**: `.gitignore`.

**Implementation Strategy:**
1.  **Check `.gitignore`**: Ensure `.env` is listed.
2.  **Use Example File**: Create `.env.example` with dummy values for other developers.

---

## 🛡 2. Intermediate Security

### 🟠 Medium Risk: Rate Limiting

**What It Prevents:** Brute-force attacks, DDoS (Distributed Denial of Service).
**Why Important:** Attackers can spam your login endpoint to guess passwords or crash your server.

**Where to Add:**
-   **Backend**: `server.js` or specific routes (`userRoute.js`).

**Implementation Strategy:**
1.  **Use Library**: Install `express-rate-limit`.
2.  **Apply Middleware**: Limit login attempts (e.g., 5 requests per 15 minutes) and general API requests (e.g., 100 per 15 minutes).

**Real-World Example:**
A botnet tries 10,000 passwords per second against your admin login page until it cracks it.

---

### 🟠 Medium Risk: HTTP Headers Security (Helmet)

**What It Prevents:** Clickjacking, XSS, Sniffing attacks.
**Why Important:** Express reveals it powers the backend via `X-Powered-By` header, giving attackers hints.

**Where to Add:**
-   **Backend**: `server.js`.

**Implementation Strategy:**
1.  **Use Library**: Install `helmet`.
2.  **Apply Middleware**: `app.use(helmet())` at the top of your middleware stack.

**Real-World Example:**
An attacker embeds your site in an `<iframe>` (Clickjacking) to trick users into clicking hidden buttons. Helmet's `X-Frame-Options` prevents this.

---

### 🟡 Low Risk: Secure Error Handling

**What It Prevents:** Information Leakage.
**Why Important:** Default Express error pages show stack traces, revealing file paths and library versions.

**Where to Add:**
-   **Backend**: `middlewares/errorMiddleware.js` (new file).

**Implementation Strategy:**
1.  **Custom Handler**: Create a middleware that catches errors.
2.  **Production Check**: If `NODE_ENV === 'production'`, return a generic message ("Something went wrong"). Only show stack traces in development.

---

## 🛡 3. Advanced / Production-Level Security

### 🔴 High Risk: Token Security (JWT)

**What It Prevents:** Session Hijacking (XSS/CSRF).
**Why Important:** Storing JWTs in `localStorage` makes them accessible to any JavaScript code (XSS).

**Where to Add:**
-   **Backend**: `controllers/userController.js`.
-   **Frontend**: `context/ShopContext.jsx`.

**Implementation Strategy:**
1.  **HttpOnly Cookies**: Instead of sending the token in the response body, send it as an `httpOnly` cookie.
2.  **Why?**: JavaScript cannot read `httpOnly` cookies, making them immune to XSS theft.
3.  **CSRF Protection**: If using cookies, you must also implement CSRF protection (e.g., `csurf` library or double-submit cookie pattern).

**Real-World Example:**
A malicious script injected via a product comment reads `localStorage.getItem('token')` and sends it to the attacker.

---

### 🟠 Medium Risk: Database Hardening (MongoDB)

**What It Prevents:** Data Exfiltration.
**Why Important:** Default MongoDB settings are often open.

**Where to Add:**
-   **Database**: MongoDB Atlas Dashboard.
-   **Backend**: `models/*.js`.

**Implementation Strategy:**
1.  **Network Access**: Whitelist only your backend server's IP address in MongoDB Atlas.
2.  **Field Selection**: In controllers, use `.select('-password')` to ensure password hashes are never returned in API responses, even by accident.
3.  **Schema Validation**: Use Mongoose validation (`match`, `enum`) strictly.

---

### 🟡 Low Risk: Logging & Monitoring

**What It Prevents:** Undetected Breaches.
**Why Important:** You need to know *when* you are being attacked.

**Where to Add:**
-   **Backend**: `server.js`.

**Implementation Strategy:**
1.  **Logging**: Use `winston` or `morgan` to log all requests.
2.  **Monitoring**: Use a service like Sentry or Datadog to alert you on error spikes or unusual traffic patterns.

---

## ✅ Production Security Checklist

1.  [ ] **HTTPS**: Enforced on Frontend (Netlify/Vercel) and Backend (Render/Heroku handles this).
2.  [ ] **Secrets**: All `.env` variables are set in the deployment dashboard.
3.  [ ] **Dependencies**: Run `npm audit` to check for known vulnerabilities in packages.
4.  [ ] **Database**: IP Whitelisting enabled.
5.  [ ] **Admin**: Change the hardcoded admin credentials in `.env` to a strong, generated password.
