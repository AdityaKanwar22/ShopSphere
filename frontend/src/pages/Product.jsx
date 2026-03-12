import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import apiClient from "../api/client";
import { toast } from "react-toastify";

const StarRating = ({ value, max = 5 }) => {
    const v = Math.min(max, Math.max(0, Number(value) || 0));
    const full = Math.floor(v);
    const half = v - full >= 0.5 ? 1 : 0;
    const empty = max - full - half;
    return (
        <span className="flex items-center gap-0.5">
            {[...Array(full)].map((_, i) => (
                <img key={`f-${i}`} src={assets.star_icon} className="w-3.5" alt="" />
            ))}
            {half ? <img src={assets.star_icon} className="w-3.5 opacity-80" alt="" /> : null}
            {[...Array(empty)].map((_, i) => (
                <img key={`e-${i}`} src={assets.star_dull_icon} className="w-3.5" alt="" />
            ))}
        </span>
    );
};

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart, toggleWishlist, isInWishlist, isAuthenticated } = useContext(ShopContext);
    const [productData, setProductData] = useState(false);
    const [image, setImage] = useState("");
    const [size, setSize] = useState("");
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("description");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const fetchProductData = () => {
        products.forEach((item) => {
            if (item._id === productId) {
                setProductData(item);
                setImage(item.image?.[0] || "");
            }
        });
    };

    const fetchReviews = async () => {
        if (!productId) return;
        try {
            const res = await apiClient.get(`/api/review/product/${productId}`);
            if (res.data?.success && Array.isArray(res.data.reviews)) setReviews(res.data.reviews);
        } catch {
            setReviews([]);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [productId, products]);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please log in to submit a review");
            return;
        }
        setReviewSubmitting(true);
        try {
            const res = await apiClient.post("/api/review", {
                productId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            if (res.data?.success) {
                toast.success("Review submitted");
                setReviewComment("");
                fetchReviews();
                if (productData && (res.data.averageRating != null || res.data.totalReviews != null)) {
                    setProductData((prev) => ({
                        ...prev,
                        averageRating: res.data.averageRating ?? prev.averageRating,
                        totalReviews: res.data.totalReviews ?? prev.totalReviews,
                    }));
                }
            } else {
                toast.error(res.data?.message || "Failed to submit review");
            }
        } catch {
            // interceptor
        } finally {
            setReviewSubmitting(false);
        }
    };

    const avg = productData?.averageRating ?? 0;
    const totalRev = productData?.totalReviews ?? 0;

    return productData ? (
        <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
            {/* Product Data */}
            <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
                {/* Product Images */}
                <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row relative">
                    <button
                        type="button"
                        onClick={() => toggleWishlist(productData._id)}
                        className="absolute top-0 right-0 z-10 w-10 h-10 flex items-center justify-center border bg-white/90 hover:bg-white"
                        aria-label="Add to wishlist"
                    >
                        <span className={`text-xl ${isInWishlist(productData._id) ? "text-red-500" : "text-gray-400"}`}>
                            ❤️
                        </span>
                    </button>
                    <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
                        {productData.image.map((item, index) => (
                            <img
                                onClick={() => setImage(item)}
                                src={item}
                                key={index}
                                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                                alt=""
                            />
                        ))}
                    </div>
                    <div className="w-full sm:w-[80%]">
                        <img className="w-full h-auto" src={image} alt={productData.name} />
                    </div>
                </div>
                {/* Product Info */}
                <div className="flex-1">
                    <h1 className="font-medium text-2xl mt-2">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-1 mt-2">
                        <StarRating value={avg} />
                        <p className="pl-2 text-gray-600">({totalRev})</p>
                    </div>
                    <p className="mt-5 text-3xl font-medium">
                        {currency}
                        {productData.price}
                    </p>
                    <p className="mt-5 text-gray-500 md:w-4/5">
                        {productData.description}
                    </p>
                    <div className="flex flex-col gap-4 my-8">
                        <p>Select Size</p>
                        <div className="flex gap-2">
                            {productData.sizes.map((item, index) => (
                                <button
                                    onClick={() => setSize(item)}
                                    className={`border py-2 px-4 bg-gray-100 ${
                                        item === size ? "border-orange-400" : ""
                                    }`}
                                    key={index}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => addToCart(productData._id, size)}
                            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
                        >
                            ADD TO CART
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleWishlist(productData._id)}
                            className="border border-gray-800 px-6 py-3 text-sm flex items-center gap-2"
                        >
                            <span className={isInWishlist(productData._id) ? "text-red-500" : "text-gray-500"}>❤️</span>
                            {isInWishlist(productData._id) ? "In Wishlist" : "Add to Wishlist"}
                        </button>
                    </div>
                    <hr className="mt-8 sm:w-4/5" />
                    <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
                        <p>100% Original product.</p>
                        <p>Cash on delivery is available on this product.</p>
                        <p>Easy return and exchange policy within 7 days.</p>
                    </div>
                </div>
            </div>
            {/* Description & Review Section */}
            <div className="mt-20">
                <div className="flex border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab("description")}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-[2px] ${activeTab === "description" ? "border-black" : "border-transparent"}`}
                    >
                        Description
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("reviews")}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-[2px] ${activeTab === "reviews" ? "border-black" : "border-transparent"}`}
                    >
                        Reviews ({reviews.length})
                    </button>
                </div>
                <div className="border border-t-0 px-6 py-6 text-sm text-gray-600">
                    {activeTab === "description" && (
                        <div className="flex flex-col gap-4">
                            <p>{productData.description}</p>
                            <p>
                                An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet.
                            </p>
                        </div>
                    )}
                    {activeTab === "reviews" && (
                        <div className="flex flex-col gap-6">
                            {isAuthenticated && (
                                <form onSubmit={submitReview} className="flex flex-col gap-3 max-w-md">
                                    <p className="font-medium text-gray-800">Write a review</p>
                                    <div className="flex items-center gap-2">
                                        <label>Rating:</label>
                                        <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="border px-2 py-1">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Your review (optional)"
                                        className="border px-3 py-2 min-h-[80px]"
                                        rows={3}
                                    />
                                    <button type="submit" disabled={reviewSubmitting} className="bg-black text-white px-4 py-2 w-fit disabled:opacity-60">
                                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            )}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                ) : (
                                    reviews.map((r) => (
                                        <div key={r._id} className="border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <StarRating value={r.rating} />
                                                <span className="text-gray-400 text-xs">
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                                                </span>
                                            </div>
                                            {r.comment ? <p className="mt-1">{r.comment}</p> : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Display Related Products */}
            <RelatedProducts
                category={productData.category}
                subCategory={productData.subCategory}
            />
        </div>
    ) : (
        <div className="opacity-0"></div>
    );
};

export default Product;
