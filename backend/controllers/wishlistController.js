import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const getWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        const user = await userModel.findById(userId).select("wishlist").lean();
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const ids = user.wishlist || [];
        if (ids.length === 0) {
            return res.json({ success: true, products: [] });
        }
        const products = await productModel.find({ _id: { $in: ids } }).lean();
        const orderMap = {};
        ids.forEach((id, i) => { orderMap[id.toString()] = i; });
        products.sort((a, b) => orderMap[a._id.toString()] - orderMap[b._id.toString()]);
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { productId } = req.body;
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        if (!productId) {
            return res.json({ success: false, message: "Product ID required" });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const wishlist = user.wishlist || [];
        const idStr = productId.toString();
        if (wishlist.some((id) => id.toString() === idStr)) {
            return res.json({ success: true, message: "Already in wishlist" });
        }
        user.wishlist = [...wishlist, idStr];
        await user.save();
        res.json({ success: true, message: "Added to wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { productId } = req.body;
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        if (!productId) {
            return res.json({ success: false, message: "Product ID required" });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const idStr = productId.toString();
        user.wishlist = (user.wishlist || []).filter((id) => id.toString() !== idStr);
        await user.save();
        res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getWishlist, addToWishlist, removeFromWishlist };
