import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import apiClient from "../api/client";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { currency, isAuthenticated, toggleWishlist } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get("/api/wishlist");
      if (res.data?.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  if (!isAuthenticated) {
    return (
      <div className="border-t pt-16">
        <Title text1="MY" text2="WISHLIST" />
        <p className="mt-4 text-gray-600">Please log in to view your wishlist.</p>
        <Link to="/login" className="inline-block mt-3 text-black underline">Log in</Link>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="WISHLIST" />
      </div>
      {loading ? (
        <p className="mt-4 text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="mt-4 text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item._id} className="border rounded overflow-hidden group">
              <Link to={`/product/${item._id}`} className="block">
                <img
                  src={item.image?.[0]}
                  alt={item.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {currency}
                    {item.price}
                  </p>
                </div>
              </Link>
              <div className="p-3 pt-0 flex gap-2">
                <Link
                  to={`/product/${item._id}`}
                  className="flex-1 text-center border border-gray-800 py-2 text-sm"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(item._id)}
                  className="px-3 py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50"
                  title="Remove from wishlist"
                >
                  ❤️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
