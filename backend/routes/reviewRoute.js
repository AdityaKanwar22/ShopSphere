import express from "express";
import authUser from "../middlewares/auth.js";
import adminAuth from "../middlewares/adminAuth.js";
import { getProductReviews, addReview, getAllReviewsForAdmin } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/product/:productId", getProductReviews);
reviewRouter.post("/", authUser, addReview);
reviewRouter.get("/admin/list", adminAuth, getAllReviewsForAdmin);

export default reviewRouter;
