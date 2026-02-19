import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

import { sanitizeData } from "./middlewares/validation.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();


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


app.use(express.json());   // Parse JSON body
app.use(sanitizeData);     // Prevent NoSQL injection


app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});


app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
});
