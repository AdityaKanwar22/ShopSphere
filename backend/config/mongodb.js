import mongoose from "mongoose";
import env from "./env.js"; 

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("DB Connected");
        });

        // ✅ Use validated URI
        await mongoose.connect(env.MONGODB_URI);

    } catch (error) {
        console.log("MongoDB Connection Error:", error.message);
        process.exit(1); 
    }
};

export default connectDB;
