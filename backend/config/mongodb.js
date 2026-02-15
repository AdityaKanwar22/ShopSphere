import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("DB Connected");
        });

        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
        console.log("MongoDB Connection Error:", error.message);
    }
};

export default connectDB;
