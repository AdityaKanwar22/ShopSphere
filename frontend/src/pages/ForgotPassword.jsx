import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.post("/api/user/forgot-password", { email: email.trim() });
      if (res.data.success) {
        setSent(true);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch {
      // interceptor handles toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {sent ? (
        <div className="text-center space-y-3">
          <p className="text-gray-600">
            If an account exists with that email, you will receive a password reset link. Check your inbox and spam folder.
          </p>
          <Link to="/login" className="text-sm underline">Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-800"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-light px-8 py-2 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <Link to="/login" className="text-sm text-center underline">Back to Login</Link>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
