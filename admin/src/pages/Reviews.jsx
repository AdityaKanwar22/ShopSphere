import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/client";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/review/admin/list");
      if (response.data?.success && Array.isArray(response.data.reviews)) {
        setReviews(response.data.reviews);
      } else {
        toast.error(response.data?.message || "Failed to load reviews");
      }
    } catch (e) {
      // interceptor toasts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div>
      <h3 className="mb-4">Product Reviews</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Product ID</th>
                <th className="p-2 border">User ID</th>
                <th className="p-2 border">Rating</th>
                <th className="p-2 border">Comment</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="p-2 border font-mono text-xs">{r.productId}</td>
                  <td className="p-2 border font-mono">{r.userId}</td>
                  <td className="p-2 border">{r.rating} ★</td>
                  <td className="p-2 border max-w-xs truncate">{r.comment || "-"}</td>
                  <td className="p-2 border text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <p className="p-4 text-gray-500">No reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
