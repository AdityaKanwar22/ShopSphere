import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        productId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
    },
    { timestamps: true }
);

reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const reviewModel =
    mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
