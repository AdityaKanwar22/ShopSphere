import mongoose from "mongoose";
const ORDER_STATUSES = [
    "Order Placed",
    "Processing",
    // legacy (kept for backward compatibility)
    "Packing",
    "Shipped",
    // legacy (kept for backward compatibility)
    "Out For Delivery",
    "Delivered",
    "Cancelled",
];
const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
        type: String,
        required: true,
        enum: ORDER_STATUSES,
        default: "Order Placed",
    },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

orderSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const orderModel =
    mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
