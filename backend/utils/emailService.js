import nodemailer from "nodemailer";

const getTransporter = () => {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587");
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true";

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
};

const getFrom = () =>
    process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || "noreply@shopsphere.com";

/**
 * Send email. Returns { success: true } or { success: false, error }.
 * If transporter is not configured (missing EMAIL_*), returns success: false.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();
    if (!transporter) {
        console.warn("Email not configured: set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env");
        return { success: false, error: "Email not configured" };
    }

    try {
        await transporter.sendMail({
            from: getFrom(),
            to,
            subject,
            html: html || text,
            text: text || (html ? html.replace(/<[^>]*>/g, "").trim() : undefined),
        });
        return { success: true };
    } catch (err) {
        console.error("sendEmail error:", err);
        return { success: false, error: err.message };
    }
};

/** Password reset email */
export const sendPasswordResetEmail = async (to, resetUrl) => {
    return sendEmail({
        to,
        subject: "Reset Your Password",
        html: `
            <p>You requested a password reset for your ShopSphere account.</p>
            <p>Click the link below to reset your password (valid for 15 minutes):</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });
};

/** Newsletter subscription confirmation */
export const sendSubscriptionConfirmation = async (to) => {
    return sendEmail({
        to,
        subject: "Welcome to ShopSphere Newsletter",
        html: `
            <p>Thank you for subscribing!</p>
            <p>You will receive updates about new products and offers.</p>
        `,
    });
};

/** Order status: Shipped */
export const sendOrderShippedEmail = async (to, orderId, userName) => {
    const name = userName || "Customer";
    return sendEmail({
        to,
        subject: "Your Order Has Shipped",
        html: `
            <p>Hi ${name},</p>
            <p>Your order #${orderId} has been shipped.</p>
            <p>You can track it in your account.</p>
        `,
    });
};

/** Order status: Delivered */
export const sendOrderDeliveredEmail = async (to, orderId, userName) => {
    const name = userName || "Customer";
    return sendEmail({
        to,
        subject: "Your Order Has Been Delivered",
        html: `
            <p>Hi ${name},</p>
            <p>Your order #${orderId} has been delivered.</p>
            <p>Thank you for shopping with ShopSphere!</p>
        `,
    });
};
