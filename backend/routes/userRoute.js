import express from "express";

// Controllers → actual logic for login/register/admin
import {
    adminLogin,
    loginUser,
    getUserProfile,
    registerUser,
} from "../controllers/userController.js";

// Validation middleware → checks if input is valid before controller runs
import {
    registerValidation,
    loginValidation,
} from "../middlewares/validation.js";

// 🔐 Rate limiter → protects login routes from brute-force attacks
import { loginLimiter } from "../middlewares/rateLimiter.js";
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();


// =======================================================
// 🧑‍💻 USER REGISTRATION ROUTE
// =======================================================

/*
Flow for register request:

Client → Validation → Controller → Response

Why validation?
To make sure user sends:
✔ valid email
✔ strong password
✔ proper name

Register route uses ONLY global rate limiter
(no strict limiter needed here)
*/

userRouter.post(
    "/register",
    registerValidation, // Step 1: Validate input data
    registerUser        // Step 2: If valid → create new user
);


// =======================================================
// 🔐 USER LOGIN ROUTE (HIGH-SECURITY)
// =======================================================

/*
Login route is sensitive because attackers can:

❌ Guess passwords repeatedly (brute force)
❌ Try credential stuffing
❌ Attempt account takeover

So we apply TWO protections:

1️⃣ loginLimiter → limits attempts (e.g., 5 tries / 15 min)
2️⃣ loginValidation → ensures email/password format is correct

Order matters:
Limiter → Validation → Controller
*/

userRouter.post(
    "/login",
    loginLimiter,     // 🚨 Step 1: Stop too many attempts from same IP
    loginValidation,  // 🧪 Step 2: Check email & password format
    loginUser         // 🔑 Step 3: Authenticate user
);


// =======================================================
// 👑 ADMIN LOGIN ROUTE (VERY SENSITIVE)
// =======================================================

/*
Admin account is the most powerful account.

If compromised → attacker controls entire system.

So we protect it with the SAME strict limiter
as the user login route.
*/

userRouter.post(
    "/admin",
    loginLimiter, // 🚨 Prevent brute-force admin login attacks
    adminLogin    // Controller handles admin authentication
);

// =======================================================
// 👤 PROFILE (AUTH REQUIRED)
// =======================================================
userRouter.get("/profile", authUser, getUserProfile);


// Export router so server.js can use it
export default userRouter;
