# 🔐 08. Secure Environment Variable Handling (Implementation Guide)

This guide provides the exact code and configuration to securely manage environment variables in your MERN stack project. Follow these steps manually.

---

## 🛡 1. Backend Security (Node.js + Express)

### 🎯 Goal
-   Load environment variables safely.
-   **Crash the app immediately** if critical variables (like `MONGO_URI` or `JWT_SECRET`) are missing.
-   Prevent accidental leaks to GitHub.

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install dotenv envalid
```
*(Note: `envalid` is a small library that validates environment variables and ensures type safety.)*

### 📂 Step 2: Configure `.gitignore`
Create or update the file `backend/.gitignore`. Add these lines to prevent committing secrets:
```gitignore
node_modules
.env
.env.local
.env.production
.DS_Store
npm-debug.log
```

### 📂 Step 3: Create `.env.example`
Create a file named `backend/.env.example`. This file **should** be committed to Git. It serves as a template for other developers.
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopsphere

# Security Keys (Replace with strong random strings in real .env)
JWT_SECRET=super_secret_key_123
STRIPE_SECRET_KEY=sk_test_...

# Third Party Services
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 📂 Step 4: Create Validation Logic
Instead of using `process.env` directly everywhere, we will create a centralized configuration file that validates variables.

Create a new file: `backend/config/env.js`

```javascript
import dotenv from 'dotenv';
import { cleanEnv, str, port, email, url } from 'envalid';

// Load .env file
dotenv.config();

// Validate environment variables
const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
    PORT: port({ default: 4000 }),
    MONGODB_URI: url(),
    JWT_SECRET: str(),
    STRIPE_SECRET_KEY: str(),
    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_SECRET_KEY: str(),
    ADMIN_EMAIL: email(),
    ADMIN_PASSWORD: str(),
});

export default env;
```

### 📂 Step 5: Update `server.js`
Update `backend/server.js` to use the validated `env` object. This ensures the app fails fast if configuration is wrong.

```javascript
import express from 'express';
// ... other imports
import env from './config/env.js'; // Import validated env
import connectDB from './config/mongodb.js';

// App Config
const app = express();
const port = env.PORT; // Use validated variable

// Use env.MONGODB_URI inside connectDB (you may need to update connectDB to accept the URI or import env there too)
connectDB();
// ...
```

---

## 🛡 2. Frontend Security (React + Vite)

### 🎯 Goal
-   Prevent leaking backend secrets (like `STRIPE_SECRET_KEY`) to the browser.
-   Correctly expose public variables (like `VITE_BACKEND_URL`).

### 📂 Step 1: Configure `.gitignore`
Create or update `frontend/.gitignore`:
```gitignore
node_modules
.env
.env.local
.env.production
dist
.DS_Store
```

### 📂 Step 2: Create `.env.example`
Create `frontend/.env.example` (safe to commit):
```env
# URL of your backend API
VITE_BACKEND_URL=http://localhost:4000

# Stripe Publishable Key (Safe to expose)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 📂 Step 3: Usage in React Components
In Vite, only variables prefixed with `VITE_` are exposed to the browser.

**❌ BAD (Will be undefined):**
```javascript
console.log(import.meta.env.DB_PASSWORD); // Undefined, safe.
```

**✅ GOOD (Correct usage):**
```javascript
// In src/context/ShopContext.jsx
const backendUrl = import.meta.env.VITE_BACKEND_URL;
```

### ⚠️ Critical Warning
**NEVER** put `STRIPE_SECRET_KEY`, `JWT_SECRET`, or `ADMIN_PASSWORD` in your frontend `.env` file. If you do, anyone can inspect your website code and steal them.

---

## 🚀 3. Production Best Practices

### 1. Set Variables in Dashboard
When deploying to **Render**, **Vercel**, or **Heroku**:
-   Go to the **Settings** -> **Environment Variables** section.
-   Copy-paste the values from your local `.env`.
-   **Do NOT** upload your `.env` file to the server manually.

### 2. Verify Validation
If you deployed without setting a variable (e.g., forgot `JWT_SECRET`), the `backend/config/env.js` script will cause the deployment to **fail immediately** with a clear error message. This is better than the app crashing randomly later when a user tries to log in.

### 3. Rotate Secrets
If you suspect a leak (e.g., you accidentally committed `.env`):
1.  **Revoke** the keys immediately (in Stripe/Cloudinary/MongoDB dashboard).
2.  **Generate** new keys.
3.  **Update** your local `.env` and production environment variables.
4.  **Rewrite** Git history (advanced) to remove the committed file.
