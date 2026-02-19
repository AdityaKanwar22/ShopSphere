import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


// =======================================================
// 🔑 Create JWT Token
// =======================================================

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
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
        const isMatch = await bcrypt.compare(password, user.password);

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

        // 🔐 Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 👤 Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
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


export { loginUser, registerUser, adminLogin, logoutUser };
