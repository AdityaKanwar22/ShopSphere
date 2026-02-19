import express from "express";
import {
    adminLogin,
    loginUser,
    registerUser,
} from "../controllers/userController.js";

import {
    registerValidation,
    loginValidation,
} from "../middlewares/validation.js";

const userRouter = express.Router();

// Register Route with Validation
userRouter.post("/register", registerValidation, registerUser);

// Login Route with Validation
userRouter.post("/login", loginValidation, loginUser);

// Admin Login (optional: you can also add validation here later)
userRouter.post("/admin", adminLogin);

export default userRouter;
