import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "../utils/emailService.js";

const ORDER_STATUSES = [
    "Order Placed",
    "Processing",
    "Packing",
    "Shipped",
    "Out For Delivery",
    "Delivered",
    "Cancelled",
];

const normalizeStatus = (status) => {
    if (!status) return "Order Placed";
    if (status === "Packing") return "Processing";
    return status;
};

// global variables
const currency = "inr";
const deliveryCharge = 100;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing orders using COD Method
const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        // here we will get userId items amount and address from req.body
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: true,
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
        });
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// verify stripe (link this controller function to orderRoute)
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {};

// All Orders data for Admin Panel (with human-readable user ID for display)
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 }).lean();
        const userIds = [...new Set(orders.map((o) => o.userId).filter(Boolean))];
        const users = await userModel.find({ _id: { $in: userIds } }).select("_id userId").lean();
        const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.userId || u._id.toString()]));

        const normalized = orders.map((o) => ({
            ...o,
            status: normalizeStatus(o.status),
            userDisplayId: userMap[o.userId] || o.userId,
        }));
        res.json({ success: true, orders: normalized });
    } catch (error) {
        console.log(error);
        res.json({ success: true, message: error.message });
    }
};

// User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).sort({ date: -1 }).lean();
        const normalized = orders.map((o) => ({
            ...o,
            status: normalizeStatus(o.status),
        }));
        res.json({ success: true, orders: normalized });
    } catch (error) {
        console.log(error);
        res.json({ success: true, message: error.message });
    }
};

// Update order status from Admin Panel; send email when Shipped or Delivered
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!ORDER_STATUSES.includes(status)) {
            return res.json({
                success: false,
                message: `Invalid status. Allowed: ${ORDER_STATUSES.join(", ")}`,
            });
        }

        const canonicalStatus = normalizeStatus(status);

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status: canonicalStatus, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!updatedOrder) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (canonicalStatus === "Shipped" || canonicalStatus === "Delivered") {
            const user = await userModel.findById(updatedOrder.userId).select("email name").lean();
            if (user?.email) {
                const orderShortId = updatedOrder._id.toString().slice(-6).toUpperCase();
                if (canonicalStatus === "Shipped") {
                    await sendOrderShippedEmail(user.email, orderShortId, user.name);
                } else {
                    await sendOrderDeliveredEmail(user.email, orderShortId, user.name);
                }
            }
        }

        res.json({
            success: true,
            message: "Status Updated",
            order: { ...updatedOrder, status: canonicalStatus },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: true, message: error.message });
    }
};

export {
    verifyStripe,
    placeOrderCOD,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
};