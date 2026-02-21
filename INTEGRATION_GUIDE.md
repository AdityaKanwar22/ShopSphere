# MERN Stack Integration Guide (Secure Auth & API)

This guide provides step-by-step instructions to integrate your updated secure backend with your React frontend. Follow these steps carefully to ensure authentication, cookies, and security features work correctly.

---

## 🔐 1️⃣ Authentication Integration

### **Backend: Update Authentication Middleware**

Since your backend now uses HttpOnly cookies, we must update the middleware to read the token from `req.cookies` instead of headers.

**File:** `backend/middlewares/auth.js`

```javascript
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    // 1. Read token from HttpOnly cookie (Preferred) OR header (Fallback)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.json({ success: false, message: "Not Authorized" });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authUser;
```

**File:** `backend/middlewares/adminAuth.js`

```javascript
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.json({
                success: false,
                message: "Not Authorized - token",
            });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (
            token_decode !==
            process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
        ) {
            return res.json({
                success: false,
                message: "Not Authorized",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth;
```

---

### **Backend: Add Session Verification Endpoint**

The frontend needs a way to check if the user is logged in (since it cannot read HttpOnly cookies).

**File:** `backend/routes/userRoute.js`

**Add this import:**
```javascript
import authUser from "../middlewares/auth.js";
```

**Add this route before `export default userRouter;`**:
```javascript
import { logoutUser } from "../controllers/userController.js"; // Import logout controller

// Check if user is authenticated (for frontend state)
userRouter.get("/check-auth", authUser, (req, res) => {
    res.json({ success: true, message: "Authenticated" });
});

// Logout route (Clears cookie)
userRouter.post("/logout", logoutUser);
```

---

### **Frontend: Update Context for Auth State**

We need to check authentication status on app load.

**File:** `frontend/src/context/ShopContext.jsx`

**Update inside `ShopContextProvider`:**

```javascript
    const [token, setToken] = useState(false); // Changed to boolean for auth state

    // Check if user is logged in on mount
    const checkAuth = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/check-auth");
            if (data.success) {
                setToken(true);
            } else {
                setToken(false);
            }
        } catch (error) {
            console.log("Not authenticated");
            setToken(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post(backendUrl + "/api/user/logout");
            setToken(false);
            setCartItems({});
            navigate("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        checkAuth();
        getProductsData();
        getUserCart();
    }, []);

    const value = {
        // ... existing values
        token, setToken,
        logout, // Add logout to context
        checkAuth // Optional: expose if needed
    };
```

---

### **Frontend: Update Login Logic**

The login response no longer contains the token. We just need to handle success.

**File:** `frontend/src/pages/Login.jsx`

**Update `onSubmitHandler`:**

```javascript
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let response;
            if (currentState === "Sign Up") {
                response = await axios.post(
                    backendUrl + "/api/user/register",
                    { name, email, password }
                );
            } else {
                response = await axios.post(
                    backendUrl + "/api/user/login",
                    { email, password }
                );
            }

            if (response.data.success) {
                setToken(true); // Set auth state to true
                toast.success(response.data.message);
                navigate("/");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
```

---

### **Frontend: Update Navbar Logout**

Use the `logout` function from context.

**File:** `frontend/src/components/Navbar.jsx`

```javascript
const {
    // ...
    logout // Import from context
} = useContext(ShopContext);

// Use this in your JSX onClick:
// <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
```

---

## 🌐 2️⃣ CORS & Cross-Origin Configuration

**Backend (`backend/server.js`)**:
Ensure your `cors` configuration allows credentials.
```javascript
const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Must match frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // REQUIRED for cookies
};
```

**Frontend (`frontend/src/context/ShopContext.jsx`)**:
Ensure axios sends credentials with every request.
```javascript
axios.defaults.withCredentials = true;
```

---

## 📦 3️⃣ API Integration for Data (Products)

Fetching protected data is simple because cookies are sent automatically.

**Example Usage:**
```javascript
const getProductsData = async () => {
    try {
        const response = await axios.get(backendUrl + "/api/product/list");
        if (response.data.success) {
            setProducts(response.data.products);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            setToken(false);
            navigate('/login');
        } else {
            toast.error("Failed to load products");
        }
    }
};
```

---

## 🛡 4️⃣ Security Feature Compatibility

### **CSRF Protection**
The backend expects a CSRF token in headers for state-changing requests (POST/PUT/DELETE).
Your `ShopContext.jsx` already fetches this token and sets it in `axios.defaults.headers.common["X-CSRF-Token"]`. Ensure this runs **before** making other requests.

### **Rate Limiting**
If you receive a `429 Too Many Requests` error, the backend `globalLimiter` or `loginLimiter` has blocked the IP.
Handle this in frontend:
```javascript
if (error.response && error.response.status === 429) {
    toast.error("Too many attempts. Please try again later.");
}
```

---

## ⚙️ 5️⃣ Environment Configuration

**Frontend (`frontend/.env`)**:
```env
VITE_BACKEND_URL=http://localhost:4000
```

**Backend (`backend/.env`)**:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
# Set NODE_ENV=production when deploying to enable secure cookies
```
**Important:** If testing locally on `localhost` (http), keep `NODE_ENV=development`. If you set it to `production`, secure cookies will require HTTPS and won't work on `http://localhost`.

---

## 🧪 6️⃣ End-to-End Verification Checklist

1.  **Login**: Enter valid credentials -> Redirect to Home -> "Logged in successfully" toast.
2.  **Persistence**: Refresh the page -> User should stay logged in (Navbar shows profile icon).
3.  **Logout**: Click Logout -> Profile icon disappears -> Redirect to Login -> Cookie cleared.
4.  **Protected Route**: Try to access Cart -> Should load items if logged in.
5.  **Invalid Login**: Enter wrong password -> "Invalid Credentials" toast.
6.  **CORS Check**: Check browser console for CORS errors (should be none).
