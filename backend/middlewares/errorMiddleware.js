import logger from "../utils/logger.js";


// ======================================================
// 🔎 404 NOT FOUND HANDLER
// ======================================================
// This runs when no route matches the request URL

export const notFound = (req, res, next) => {

    // Create a custom error message
    const error = new Error(`Route not found → ${req.originalUrl}`);

    res.status(404);

    // Pass error to the next middleware (errorHandler)
    next(error);
};



// ======================================================
// ⚠️ GLOBAL ERROR HANDLER
// ======================================================
// This catches ALL errors in the app

export const errorHandler = (err, req, res, next) => {

    // If status wasn't set earlier → treat as server error
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;


    // 📝 LOG ERROR USING WINSTON
    logger.error({
        message: err.message,
        statusCode: statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        stack: err.stack,
    });


    // 📤 SEND CLEAN RESPONSE TO CLIENT
    res.status(statusCode).json({
        success: false,
        message: err.message,

        // Show stack only in development (not production)
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
