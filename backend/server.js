import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";   // 🍪 Read cookies
import csrf from "csurf";                   // 🛡 CSRF protection
import morgan from "morgan";                // 📊 Request logging

import env from "./config/env.js";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import subscribeRouter from "./routes/subscribeRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

import { sanitizeData } from "./middlewares/validation.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();
const port = env.PORT;


// ======================================================
// 🔌 CONNECT DATABASE & CLOUDINARY
// ======================================================

connectDB();
connectCloudinary();


// ======================================================
// 🛡 TRUST PROXY (Important when deploying)
// ======================================================

app.set("trust proxy", 1);


// ======================================================
// 🪖 HELMET — Adds security HTTP headers
// ======================================================

app.use(helmet());


// ======================================================
// 📊 REQUEST LOGGING (Morgan)
// ======================================================

app.use(morgan("combined"));
// Logs every request (IP, method, URL, status)


// ======================================================
// 🛑 GLOBAL RATE LIMITER
// ======================================================

app.use(globalLimiter);
// Prevents DDoS & brute force attacks


// ======================================================
// 🔒 SECURE CORS CONFIGURATION
// ======================================================

const allowedOrigins = [
    "http://localhost:5173", // Frontend
    "http://localhost:5174", // Admin
];

const corsOptions = {
    origin: (origin, callback) => {

        // Allow requests with no origin (Postman, mobile apps)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // REQUIRED for cookies
};

app.use(cors(corsOptions));


// ======================================================
// 🍪 COOKIE + BODY PARSING
// ======================================================

app.use(cookieParser());   // MUST be before CSRF
app.use(express.json());   // Parse JSON body


// ======================================================
// 🛡 NoSQL Injection Protection
// ======================================================

app.use(sanitizeData);
// Removes malicious MongoDB operators ($gt, $ne, etc.)


// ======================================================
// 🔐 CSRF PROTECTION SETUP
// ======================================================

// Create CSRF middleware (uses cookies)
const csrfProtection = csrf({ cookie: true });

/*
This route sends a CSRF token to the frontend.

Frontend must include this token in headers
for POST / PUT / DELETE requests.
*/
app.get("/api/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


// ======================================================
// 🚀 API ROUTES
// ======================================================

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/review", reviewRouter);


// Simple test route
app.get("/", (req, res) => {
    res.send("API Working");
});


// ======================================================
// ⚠️ ERROR HANDLING (MUST BE LAST)
// ======================================================

app.use(notFound);
app.use(errorHandler);


// ======================================================
// 🟢 START SERVER
// ======================================================

app.listen(port, () => {
    console.log(`🚀 Server is running on PORT: ${port}`);
});
