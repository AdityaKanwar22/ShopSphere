import dotenv from "dotenv";
import { cleanEnv, str, port, email, url } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "test", "production"],
        default: "development",
    }),

    PORT: port({ default: 4000 }),

    MONGODB_URI: url(),

    JWT_SECRET: str(),

    STRIPE_SECRET_KEY: str(),

    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_SECRET_KEY: str(),

    ADMIN_EMAIL: email(),
    ADMIN_PASSWORD: str(),

    // Email (nodemailer SMTP) — used for password reset, newsletter, order notifications
    FRONTEND_URL: str({ default: "http://localhost:5173" }),
    EMAIL_HOST: str({ default: "" }),
    EMAIL_PORT: str({ default: "587" }),
    EMAIL_USER: str({ default: "" }),
    EMAIL_PASS: str({ default: "" }),
    MAIL_FROM: str({ default: "" }),
});

export default env;
