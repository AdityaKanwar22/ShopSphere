# 🔐 10. Advanced Security Implementation (JWT, Cookies, DB Hardening, Logging)

This guide provides the exact code snippets to implement production-grade security features. Follow these steps manually.

---

## 🍪 1. JWT Token Security (HttpOnly Cookies + CSRF)

### 🎯 Goal
-   Move tokens from `localStorage` (accessible by XSS) to `HttpOnly Cookies` (inaccessible to JS).
-   Prevent CSRF attacks since cookies are sent automatically.

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install cookie-parser csurf
```

### ✏️ Step 2: Configure Cookie Parser & CSRF in `server.js`
Update `backend/server.js`.

```javascript
import cookieParser from 'cookie-parser'; // Import
import csrf from 'csurf'; // Import

// ... app config
const app = express();

// Middleware
app.use(cookieParser()); // Must be before csrf
app.use(express.json());

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Route to get CSRF token for Frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all mutation routes (POST, PUT, DELETE)
// You might need to apply this selectively or globally depending on your structure
// app.use(csrfProtection);
```

### ✏️ Step 3: Update `userController.js` to Send Cookies
Modify `loginUser` and `registerUser` in `backend/controllers/userController.js`.

```javascript
const loginUser = async (req, res) => {
    // ... validation logic
    if (isMatch) {
        const token = createToken(user._id);

        // Send HttpOnly Cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevent XSS
            secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
            sameSite: 'strict', // CSRF protection
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ success: true, message: "Logged in successfully" });
    }
    // ...
};

// Add Logout Function
const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: "Logged out" });
};
```

### ✏️ Step 4: Frontend Configuration (React)
Update your Axios/Fetch requests in `frontend/src/context/ShopContext.jsx` to send credentials.

```javascript
// Enable sending cookies with requests
axios.defaults.withCredentials = true;

// Fetch CSRF Token on App Load
useEffect(() => {
    const getCsrfToken = async () => {
        const { data } = await axios.get(backendUrl + '/api/csrf-token');
        axios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
    };
    getCsrfToken();
}, []);
```

---

## 🛡 2. MongoDB Database Hardening

### 🎯 Goal
-   Prevent sensitive data (passwords) from being returned in API responses.
-   Enforce strict schema validation.

### ✏️ Step 1: Secure User Model (`models/userModel.js`)

```javascript
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        match: [/^[a-zA-Z0-9 ]+$/, 'Name can only contain letters and numbers'] // Regex validation
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin'], // Enum constraint
        default: 'user'
    }
}, { minimize: false });
```

### ✏️ Step 2: Prevent Password Leak in Controllers
In `backend/controllers/userController.js` (or any controller returning user data):

```javascript
const getUserProfile = async (req, res) => {
    try {
        // .select('-password') excludes the password field from the result
        const user = await userModel.findById(req.body.userId).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        // ...
    }
};
```

---

## 📊 3. Logging & Monitoring

### 🎯 Goal
-   Log all incoming requests for debugging.
-   Monitor errors in production.

### 📦 Step 1: Install Dependencies
Run this command in your `backend/` terminal:
```bash
npm install morgan winston
```

### ✏️ Step 2: Configure Logging in `server.js`

```javascript
import morgan from 'morgan'; // Import

// ... app config
const app = express();

// Log requests to console
// 'combined' format is standard Apache log format (IP, Date, Method, URL, Status, User Agent)
app.use(morgan('combined'));

// ... routes
```

### ✏️ Step 3: Global Error Monitoring (Winston)
Create `backend/utils/logger.js`:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

Use `logger.error(err)` inside your `errorMiddleware.js` to save errors to a file.

### 🔒 Production Considerations
1.  **Sentry**: For real-world production, replace `winston` file logging with **Sentry**. It gives you a dashboard for errors.
    ```javascript
    // server.js
    Sentry.init({ dsn: "your_dsn_here" });
    app.use(Sentry.Handlers.requestHandler());
    // ... routes
    app.use(Sentry.Handlers.errorHandler());
    ```
