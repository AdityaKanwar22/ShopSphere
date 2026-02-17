# 🛠 07. Security Implementation Guide (Actionable Code)

This guide provides the exact code snippets to secure your ShopSphere backend. Follow these steps manually to implement high-risk security fixes.

---

## 🛡 1. Input Validation & Sanitization

### 🎯 Goal
-   Validate all incoming data (email format, password length).
-   Sanitize inputs to prevent XSS (Cross-Site Scripting).
-   Prevent NoSQL Injection (MongoDB operator injection).

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install express-validator express-mongo-sanitize
```

### 📂 Step 2: Create Validation Middleware
Create a new file: `backend/middlewares/validation.js`

```javascript
import { body, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';

// Middleware to prevent NoSQL Injection (removes $ and .)
export const sanitizeData = mongoSanitize();

// Validation Rules for User Registration
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .escape(), // Converts HTML chars like < > to &lt; &gt; (Prevents XSS)

    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(), // Sanitizes email (e.g., lowercase)

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

    // Middleware to check for validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ success: false, message: errors.array()[0].msg });
        }
        next();
    }
];

// Validation Rules for User Login
export const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ success: false, message: errors.array()[0].msg });
        }
        next();
    }
];
```

### 📂 Step 3: Update Routes
Open `backend/routes/userRoute.js` and apply the middleware.

```javascript
import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import { registerValidation, loginValidation } from '../middlewares/validation.js'; // Import here

const userRouter = express.Router();

// Apply validation middleware BEFORE the controller
userRouter.post('/register', registerValidation, registerUser);
userRouter.post('/login', loginValidation, loginUser);
userRouter.post('/admin', adminLogin);

export default userRouter;
```

### 📂 Step 4: Apply Global Sanitization
Open `backend/server.js` and add `sanitizeData` globally.

```javascript
// ... existing imports
import { sanitizeData } from './middlewares/validation.js'; // Import

const app = express();
// ... db connection

// Middlewares
app.use(express.json());
app.use(sanitizeData); // Apply globally to prevent NoSQL injection in ALL routes
// ... existing cors and routes
```

### 🧠 Why This Works?
1.  **`express-mongo-sanitize`**: Automatically removes keys starting with `$` (like `$ne`, `$gt`) from `req.body`, `req.query`, and `req.params`. This prevents attackers from injecting MongoDB operators.
2.  **`express-validator`**: Ensures that `email` is actually an email and `password` meets complexity requirements *before* your controller logic runs.
3.  **`.escape()`**: Converts characters like `<script>` into safe text `&lt;script&gt;`, preventing XSS attacks if you display this name on the frontend.

---

## 🔒 2. Secure CORS Configuration

### 🎯 Goal
-   Restrict API access to only your trusted frontend domains.
-   Prevent unauthorized websites from making requests to your backend.

### 📦 Step 1: Install Dependencies
(You likely already have `cors`, but ensure it's installed).
```bash
npm install cors
```

### 📂 Step 2: Update Server Configuration
Open `backend/server.js` and replace the generic `app.use(cors())` with this specific configuration.

```javascript
import cors from 'cors';

// ...

const allowedOrigins = [
    'http://localhost:5173', // Frontend Local
    'http://localhost:5174', // Admin Local
    'https://your-frontend-domain.vercel.app', // Production Frontend
    'https://your-admin-domain.vercel.app'     // Production Admin
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies/authorization headers
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ... routes
```

### 🧠 Why This is Secure?
1.  **Whitelist Approach**: Only the domains explicitly listed in `allowedOrigins` can fetch data. A random malicious website trying to use your API via AJAX will be blocked by the browser.
2.  **Credentials**: `credentials: true` is required if you ever decide to use httpOnly cookies for better token security.
3.  **No Wildcards**: Removing `*` ensures that you have full control over who accesses your resources.
