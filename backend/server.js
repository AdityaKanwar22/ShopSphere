import express from "express";
import cors from "cors";

import env from "./config/env.js"; // ✅ Validated environment variables

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

import { sanitizeData } from "./middlewares/validation.js";

const app = express();
const port = env.PORT; // ✅ Use validated PORT

// ==============================
// 🔌 CONNECT DATABASE & CLOUDINARY
// ==============================

connectDB();
connectCloudinary();


// ==============================
// 🔒 SECURE CORS CONFIGURATION
// ==============================

const allowedOrigins = [
    "http://localhost:5173", // Frontend Local
    "http://localhost:5174", // Admin Local
    // Add production domains later:
    // "https://your-frontend.vercel.app",
    // "https://your-admin.vercel.app",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


// ==============================
// 🛡 GLOBAL SECURITY MIDDLEWARE
// ==============================

app.use(express.json());   // Parse JSON body
app.use(sanitizeData);     // Prevent NoSQL injection


// ==============================
// 🚀 API ROUTES
// ==============================

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});


// ==============================
// 🟢 START SERVER
// ==============================

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
});
