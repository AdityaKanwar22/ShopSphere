import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/user/reset-password/${token}`, { password });
      if (res.data.success) {
        setDone(true);
        toast.success(res.data.message);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(res.data.message || "Failed to reset password.");
      }
    } catch {
      // interceptor handles toast
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <p className="text-gray-600">Invalid reset link.</p>
        <Link to="/forgot-password" className="underline">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <p className="text-gray-600">Password reset successfully. Redirecting to login...</p>
        <Link to="/login" className="underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-3 py-2 border border-gray-800"
          required
          minLength={8}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full px-3 py-2 border border-gray-800"
          required
          minLength={8}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white font-light px-8 py-2 disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Set new password"}
        </button>
        <Link to="/login" className="text-sm text-center underline">Back to Login</Link>
      </form>
    </div>
  );
};

export default ResetPassword;
