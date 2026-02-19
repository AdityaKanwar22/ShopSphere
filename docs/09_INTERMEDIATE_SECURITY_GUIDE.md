# 🔐 09. Intermediate Security Implementation (Rate Limiting, Helmet, Error Handling)

This guide provides the exact code snippets to implement intermediate security features in your MERN backend. Follow these steps manually.

---

## 🛑 1. Rate Limiting (Prevent Brute Force & DDoS)

### 🎯 Goal
-   Limit general API requests to prevent DDoS attacks.
-   Strictly limit login attempts to prevent password guessing (Brute Force).

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install express-rate-limit
```

### 📂 Step 2: Create Rate Limiter Configuration
Create a new file: `backend/middlewares/rateLimiter.js`

```javascript
import rateLimit from 'express-rate-limit';

// Global Rate Limiter: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict Login Limiter: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
```

### ✏️ Step 3: Apply Global Limiter in `server.js`
Update `backend/server.js` to use the global limiter.

```javascript
import express from 'express';
// ... other imports
import { globalLimiter } from './middlewares/rateLimiter.js'; // Import

const app = express();

// Trust Proxy (Required if deploying to Heroku, Render, Vercel, etc.)
app.set('trust proxy', 1);

// Apply Global Rate Limiter to all requests
app.use(globalLimiter);

// ... existing middlewares (express.json, cors)
```

### ✏️ Step 4: Apply Strict Limiter to Login Route
Update `backend/routes/userRoute.js` to use the login limiter.

```javascript
import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import { loginLimiter } from '../middlewares/rateLimiter.js'; // Import

const userRouter = express.Router();

// Apply stricter limit ONLY to login route
userRouter.post('/login', loginLimiter, loginUser);
userRouter.post('/admin', loginLimiter, adminLogin); // Protect admin login too
userRouter.post('/register', registerUser); // Register can use global limit

export default userRouter;
```

---

## 🛡 2. HTTP Headers Security (Helmet)

### 🎯 Goal
-   Secure your Express app by setting various HTTP headers.
-   Prevent attacks like Clickjacking, Sniffing, and XSS.

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install helmet
```

### ✏️ Step 2: Configure Helmet in `server.js`
Update `backend/server.js`. Place `helmet()` early in the middleware stack.

```javascript
import helmet from 'helmet'; // Import

// ... app config
const app = express();

app.use(helmet()); // Add Helmet immediately
app.use(express.json());
app.use(cors()); // Helmet is compatible with CORS

// ... routes
```

### 🧠 What Does This Do?
-   **Removes `X-Powered-By`**: Hides that you are using Express.
-   **Sets `X-Frame-Options: DENY`**: Prevents clickjacking (embedding your site in an iframe).
-   **Sets `X-Content-Type-Options: nosniff`**: Prevents MIME-sniffing attacks.
-   **Sets `Strict-Transport-Security`**: Enforces HTTPS (if on HTTPS).

---

## 🟡 3. Secure Error Handling Middleware

### 🎯 Goal
-   Replace default Express HTML error pages with JSON.
-   **Hide stack traces** in production to prevent information leakage.
-   Provide consistent error responses.

### 📂 Step 1: Create Error Handler
Create a new file: `backend/middlewares/errorMiddleware.js`

```javascript
// Not Found Handler (404)
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// General Error Handler
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
```

### ✏️ Step 2: Apply in `server.js`
Update `backend/server.js`. These middlewares MUST go **after** your routes.

```javascript
// ... existing imports
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'; // Import

// ... app.use(routes)
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Error Handling Middlewares (MUST be last)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
   // ...
});
```

### 🧠 Why This is Secure?
-   **Production Safety**: In production, attackers won't see your file paths or library versions in the stack trace.
-   **Consistency**: Frontend always receives `{ success: false, message: "..." }` instead of HTML error pages, making debugging easier and the app more professional.
