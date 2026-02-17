# ⚙️ 02. Backend Deep Dive (Node.js + Express)

## 🖥 1. The Entry Point: `backend/server.js`

This file is the **heart** of your backend. It initializes the Express application, connects to databases, and sets up routing.

### 🔍 Code Explanation (Line-by-Line)

```javascript
import express from "express"; // Import the Express framework
import cors from "cors"; // Import CORS middleware to allow cross-origin requests
import "dotenv/config"; // Load environment variables from .env file
import connectDB from "./config/mongodb.js"; // Import function to connect to MongoDB
import connectCloudinary from "./config/cloudinary.js"; // Import function to connect to Cloudinary
import userRouter from "./routes/userRoute.js"; // Import routes for User operations
import productRouter from "./routes/productRoute.js"; // Import routes for Product operations
import cartRouter from "./routes/cartRoute.js"; // Import routes for Cart operations
import orderRouter from "./routes/orderRoute.js"; // Import routes for Order operations

// App Config
const app = express(); // Create an Express application instance
const port = process.env.PORT || 4000; // Set the port to 4000 or the environment variable PORT
connectDB(); // Connect to MongoDB
connectCloudinary(); // Connect to Cloudinary

// middlewares
app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(cors()); // Middleware to enable CORS (allows frontend to talk to backend)

// api endpoints
app.use("/api/user", userRouter); // Mount user routes at /api/user
app.use("/api/product", productRouter); // Mount product routes at /api/product
app.use("/api/cart", cartRouter); // Mount cart routes at /api/cart
app.use("/api/order", orderRouter); // Mount order routes at /api/order

app.get("/", (req, res) => { // Define a simple route for the root URL
    res.send("API Working"); // Send a response "API Working"
});

app.listen(port, (err) => { // Start the server listening on the specified port
    console.log(err ? err : `Server is running on PORT: ${port}`); // Log a message when server starts
});
```

### 🧠 Key Concepts
-   **Express**: Framework used to build the API. It simplifies routing and middleware handling.
-   **Middleware**: Functions that run *before* the request reaches the final route handler. `express.json()` parses JSON bodies, and `cors()` allows requests from different origins (like your frontend).
-   **Routing**: `app.use('/api/user', userRouter)` tells Express to send any request starting with `/api/user` to the `userRouter`.

---

## 🗄 2. Database Models (Mongoose)

### `backend/models/userModel.js`
Defines the structure of a User document in MongoDB.

```javascript
import mongoose from "mongoose"; // Import Mongoose ODM

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Name is a required string
        email: { type: String, required: true, unique: true }, // Email is required and must be unique
        password: { type: String, required: true }, // Password is required (hashed)
        cartData: { type: Object, default: {} }, // Cart data stored as an object, defaults to empty
    },
    { minimize: false } // Ensures empty objects (like cartData) are saved to DB
);

// Check if model exists (to prevent overwrite error during hot reloads), otherwise create it
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel; // Export the model for use in controllers
```

### 🧠 Why `minimize: false`?
By default, Mongoose does not save empty objects `{}` to the database. Setting `minimize: false` ensures that an empty cart `{}` is actually stored, which simplifies logic when a new user is created.

---

## 🎮 3. Controllers (Business Logic)

### `backend/controllers/userController.js`
Contains the logic for user registration and login.

```javascript
import validator from "validator"; // Library for validating emails
import bcrypt from "bcryptjs"; // Library for hashing passwords
import jwt from "jsonwebtoken"; // Library for creating JSON Web Tokens
import userModel from "../models/userModel.js"; // Import the User model

// Helper function to create a JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password from request body
        const user = await userModel.findOne({ email }); // Find user by email
        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" }); // Return error if user not found
        }

        const isMatch = await bcrypt.compare(password, user.password); // Compare entered password with hashed password
        if (isMatch) {
            const token = createToken(user._id); // Create token if password matches
            res.json({ success: true, token }); // Send token back to client
        } else {
            return res.json({ success: false, message: "Invalid Credentials" }); // Return error if password incorrect
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); // Handle any unexpected errors
    }
};

// Route for user register
const registerUser = async (req, res) => {
    // ... (logic similar to login but creates a new user)
    // 1. Check if user exists
    // 2. Validate email format
    // 3. Validate password strength
    // 4. Hash password
    // 5. Save new user
    // 6. Return token
};

// Route for Admin Login
const adminLogin = async (req, res) => {
    // ... (logic checks hardcoded credentials from .env)
};

export { loginUser, registerUser, adminLogin }; // Export functions
```

### 🧠 Security Practices Here
1.  **Password Hashing**: Never store plain text passwords. `bcrypt.hash()` salts and hashes passwords.
2.  **JWT**: JSON Web Tokens allow stateless authentication. The server doesn't need to remember the user session; the client sends the token with every request.
3.  **Input Validation**: `validator.isEmail()` prevents bad data from entering your system.

---

## 🚦 4. Middlewares (The Gatekeepers)

### `backend/middlewares/auth.js`
Protects routes that require authentication.

```javascript
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.headers; // Get token from request headers

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' }); // Reject if no token
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.body.userId = token_decode.id; // Add userId to request body for the controller to use
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); // Handle invalid token
    }
};

export default authUser;
```

### 🧠 How Middleware Flow Works
User Request -> `server.js` -> `routes/cartRoute.js` -> `auth.js` (Middleware) -> `cartController.js` (Controller) -> Response.

If `auth.js` fails (invalid token), the request is stopped and never reaches the controller.

---

## 🗺 5. Routes (API Endpoints)

### `backend/routes/userRoute.js`
Maps URLs to controller functions.

```javascript
import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';

const userRouter = express.Router(); // Create a router instance

userRouter.post('/register', registerUser); // POST /api/user/register calls registerUser
userRouter.post('/login', loginUser);       // POST /api/user/login calls loginUser
userRouter.post('/admin', adminLogin);      // POST /api/user/admin calls adminLogin

export default userRouter;
```

---

## 🧠 6. Mini Task: Test Your Backend Knowledge
1.  **Modify the Token**: In `userController.js`, currently the token only contains the user `id`. Modify `createToken` to also include the user's `email`.
2.  **Add a Route**: Create a new route `GET /api/user/profile` that returns the user's profile information. You will need to create a new controller function `getProfile` and add it to `userRoute.js`.
3.  **Debug Middleware**: What happens if you forget to call `next()` in the `auth.js` middleware? (Hint: The request will hang).

*Answers:*
1.  `jwt.sign({ id, email }, process.env.JWT_SECRET)`
2.  *Requires creating `getProfile` in controller (using `req.body.userId` set by auth middleware) and adding `userRouter.get('/profile', authUser, getProfile)`.*
3.  *The request will hang indefinitely because Express is waiting for the middleware to pass control.*
