import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.json({ success: false, message: "Product ID required" });
        }
        const reviews = await reviewModel
            .find({ productId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addReview = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { productId, rating, comment } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        if (!productId || rating == null) {
            return res.json({ success: false, message: "Product ID and rating required" });
        }
        const r = Number(rating);
        if (r < 1 || r > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const existing = await reviewModel.findOne({ userId, productId });
        let review;
        if (existing) {
            existing.rating = r;
            existing.comment = (comment || "").trim();
            await existing.save();
            review = existing;
        } else {
            review = await reviewModel.create({
                userId,
                productId: productId.toString(),
                rating: r,
                comment: (comment || "").trim(),
            });
        }

        const all = await reviewModel.find({ productId: productId.toString() }).lean();
        const total = all.length;
        const sum = all.reduce((s, x) => s + x.rating, 0);
        const averageRating = total ? Math.round((sum / total) * 10) / 10 : 0;
        await productModel.findByIdAndUpdate(productId, {
            averageRating,
            totalReviews: total,
        });

        res.json({ success: true, review, averageRating, totalReviews: total });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: "You have already reviewed this product" });
        }
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getAllReviewsForAdmin = async (req, res) => {
    try {
        const reviews = await reviewModel.find({}).sort({ createdAt: -1 }).lean();
        res.json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getProductReviews, addReview, getAllReviewsForAdmin };
