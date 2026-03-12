import crypto from "crypto";
import validator from "validator";
import argon2 from "argon2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";


// =======================================================
// 🔑 Create JWT Token
// =======================================================

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d", // Token valid for 1 day
    });
};


// =======================================================
// 🆔 Generate next human-readable userId (USER001, USER002, ...)
// =======================================================
const getNextUserId = async () => {
    const last = await userModel.findOne({ userId: /^USER\d+$/ }).sort({ userId: -1 }).select("userId").lean();
    const nextNum = last ? parseInt(last.userId.replace(/^USER/, ""), 10) + 1 : 1;
    return "USER" + String(nextNum).padStart(3, "0");
};


// =======================================================
// 🔐 USER LOGIN
// =======================================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔎 Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User doesn't exist",
            });
        }

        // 🔑 Compare entered password with hashed password
        let isMatch = false;

        try {
            const storedHash = user.password || "";

            // Temporary backwards compatibility:
            // - If hash starts with bcrypt prefix ($2...), verify with bcryptjs
            // - Otherwise, assume Argon2 and verify with argon2
            if (
                storedHash.startsWith("$2a$") ||
                storedHash.startsWith("$2b$") ||
                storedHash.startsWith("$2y$") ||
                storedHash.startsWith("$2$") ||
                storedHash.startsWith("$2x$")
            ) {
                isMatch = await bcrypt.compare(password, storedHash);

                // On successful login with legacy bcrypt hash, upgrade to Argon2
                if (isMatch) {
                    try {
                        const newHash = await argon2.hash(password);
                        user.password = newHash;
                        await user.save();
                    } catch (upgradeError) {
                        console.log("Error upgrading password hash to Argon2:", upgradeError.message);
                    }
                }
            } else {
                isMatch = await argon2.verify(storedHash, password, {
                    type: argon2.argon2id,
                });
            }
        } catch (hashError) {
            console.log("Error verifying password:", hashError.message);
            isMatch = false;
        }

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        // 🎟 Create JWT token
        const token = createToken(user._id);


        // 🍪 Send token as HttpOnly Cookie (SECURE WAY)
        res.cookie("token", token, {
            httpOnly: true, // 🚫 JS cannot access → prevents XSS stealing token
            secure: process.env.NODE_ENV === "production", // 🔒 HTTPS only in production
            sameSite: "strict", // 🛡 Protects against CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // ⏰ Cookie valid for 1 day
        });


        // ✅ Send success message (NO token exposed)
        res.json({
            success: true,
            message: "Logged in successfully",
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// =======================================================
// 🧑‍💻 USER REGISTER
// =======================================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔎 Check if user already exists
        const exists = await userModel.findOne({ email });

        if (exists) {
            return res.json({
                success: false,
                message: "User Already Exists",
            });
        }

        // 📧 Validate email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email",
            });
        }

        // 🔒 Enforce strong password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please enter a strong password",
            });
        }

        // 🔐 Hash password before saving using Argon2id with strong parameters
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });

        // 🆔 Generate human-readable userId (USER001, USER002, ...)
        const newUserId = await getNextUserId();

        // 👤 Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            userId: newUserId,
        });

        const user = await newUser.save();

        // 🎟 Create JWT token
        const token = createToken(user._id);


        // 🍪 Send token as secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });


        res.json({
            success: true,
            message: "Registered successfully",
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// =======================================================
// 👑 ADMIN LOGIN
// =======================================================

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ) {

            const token = jwt.sign(
                email + password,
                process.env.JWT_SECRET
            );

            // 🍪 Send admin token as cookie too
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Admin logged in",
            });

        } else {
            res.json({
                success: false,
                message: "Invalid Credentials",
            });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// =======================================================
// 🚪 LOGOUT USER
// =======================================================

const logoutUser = (req, res) => {

    // 🧹 Clear the cookie from browser
    res.clearCookie("token");

    res.json({
        success: true,
        message: "Logged out successfully",
    });
};

// =======================================================
// 👤 GET LOGGED-IN USER PROFILE
// =======================================================
const getUserProfile = async (req, res) => {
    try {
        const id = req.userId || req.body?.userId;
        if (!id) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        let user = await userModel.findById(id).select("-password -resetPasswordToken -resetPasswordExpire").lean();
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Lazy backfill: assign human-readable userId to existing users who don't have one
        if (!user.userId) {
            const doc = await userModel.findById(id);
            doc.userId = await getNextUserId();
            await doc.save();
            user = await userModel.findById(id).select("-password -resetPasswordToken -resetPasswordExpire").lean();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// =======================================================
// 📧 FORGOT PASSWORD — send reset link via email
// =======================================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email: email?.trim()?.toLowerCase() });
        if (!user) {
            // Don't reveal whether email exists (security)
            return res.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const emailResult = await sendPasswordResetEmail(user.email, resetUrl);
        if (!emailResult.success) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.json({
                success: false,
                message: "Failed to send reset email. Please try again later.",
            });
        }

        res.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// =======================================================
// 🔐 RESET PASSWORD — validate token and set new password
// =======================================================
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.json({ success: false, message: "Invalid or expired reset link." });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() },
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired reset link." });
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters." });
        }

        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// =======================================================
// 👥 ADMIN: List all users (with userId)
// =======================================================
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select("name email userId createdAt").sort({ createdAt: -1 }).lean();
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, adminLogin, logoutUser, getUserProfile, forgotPassword, resetPassword, getAllUsers };
