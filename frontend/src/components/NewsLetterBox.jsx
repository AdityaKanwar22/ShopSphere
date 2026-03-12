import React, { useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/client";

const NewsLetterBox = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            const res = await apiClient.post("/api/subscribe", { email: email.trim() });
            if (res.data.success) {
                toast.success(res.data.message);
                setEmail("");
            } else {
                toast.error(res.data.message || "Subscription failed.");
            }
        } catch {
            // interceptor handles toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
            <p className="text-2xl font-medium text-gray-800">
                Subscribe now & get 20% off
            </p>
            <p className="text-gray-400 mt-3">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
            </p>
            <form
                onSubmit={onSubmitHandler}
                className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
            >
                <input
                    className="w-full sm:flex-1 outline-none"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white text-xs px-10 py-4 disabled:opacity-60"
                >
                    {loading ? "..." : "SUBSCRIBE"}
                </button>
            </form>
        </div>
    );
};

export default NewsLetterBox;
