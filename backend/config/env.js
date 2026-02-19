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
});

export default env;
