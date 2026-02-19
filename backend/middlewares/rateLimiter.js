import rateLimit from "express-rate-limit";

// 🌐 Global limiter (all API requests)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests from this IP. Try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 🔐 Strict limiter (login attempts)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many login attempts. Try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
