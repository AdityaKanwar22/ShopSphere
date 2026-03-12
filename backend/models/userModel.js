import mongoose from "mongoose";


// =======================================================
// 🛡 SECURE USER SCHEMA
// =======================================================

const userSchema = new mongoose.Schema(
    {
        // 👤 USER NAME
        name: {
            type: String,
            required: true,
            trim: true, // ✂️ removes extra spaces
            minlength: 2,
            maxlength: 50,

            // 🔒 Allow only letters, numbers & spaces
            match: [
                /^[a-zA-Z0-9 ]+$/,
                "Name can only contain letters and numbers",
            ],
        },


        // 📧 EMAIL
        email: {
            type: String,
            required: true,
            unique: true,   // 🚫 No duplicate emails
            lowercase: true, // Convert to lowercase automatically
            trim: true,
        },


        // 🔐 PASSWORD (already hashed before saving)
        password: {
            type: String,
            required: true,
            minlength: 8,
        },


        // 🛒 USER CART DATA
        cartData: {
            type: Object,
            default: {},
        },


        // 👑 USER ROLE (for admin system)
        role: {
            type: String,
            enum: ["user", "admin"], // Only these values allowed
            default: "user",
        },

        // 🆔 HUMAN-READABLE USER ID (e.g. USER001, USER002)
        userId: {
            type: String,
            unique: true,
            sparse: true, // allows null/undefined for existing users before backfill
        },

        // 🔐 PASSWORD RESET (forgot password flow)
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },

        // ❤️ WISHLIST (product IDs)
        wishlist: {
            type: [String],
            default: [],
        },
    },
    {
        minimize: false,   // Keep empty objects (needed for cart)
        timestamps: true,  // 🕒 Adds createdAt & updatedAt automatically
    }
);


// =======================================================
// 🚀 EXPORT MODEL
// =======================================================

const userModel =
    mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
