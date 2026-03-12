import subscriberModel from "../models/subscriberModel.js";
import validator from "validator";
import { sendSubscriptionConfirmation } from "../utils/emailService.js";

const addSubscriber = async (req, res) => {
    try {
        const email = req.body.email?.trim()?.toLowerCase();

        if (!email) {
            return res.json({ success: false, message: "Email is required." });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email." });
        }

        const exists = await subscriberModel.findOne({ email });
        if (exists) {
            return res.json({ success: true, message: "You are already subscribed." });
        }

        await subscriberModel.create({ email });

        await sendSubscriptionConfirmation(email);

        res.json({ success: true, message: "Thank you for subscribing!" });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: true, message: "You are already subscribed." });
        }
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addSubscriber };
