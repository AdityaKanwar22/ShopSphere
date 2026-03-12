import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import apiClient from "../api/client";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/api/user/profile");
        if (res.data?.success) setUser(res.data.user);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const registeredDate = user?.createdAt ? new Date(user.createdAt) : null;
  const memberSinceYear = registeredDate ? registeredDate.getFullYear() : "";
  const memberSinceFull = registeredDate
    ? registeredDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>
      <div className="mt-6 text-gray-700">
        {loading ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : !user ? (
          <p className="text-sm text-gray-500">Unable to load profile.</p>
        ) : (
          <div className="max-w-xl bg-white border rounded p-5">
            <p className="text-lg font-medium mb-3">User Profile</p>
            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-medium">{user.name}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                <span className="font-medium">{user.email}</span>
              </p>
              <p>
                <span className="text-gray-500">User ID:</span>{" "}
                <span className="font-medium">{user.userId || user._id}</span>
              </p>
              <p>
                <span className="text-gray-500">Member Since:</span>{" "}
                <span className="font-medium">{memberSinceFull}</span>
                {memberSinceYear ? (
                  <span className="text-gray-400"> ({memberSinceYear})</span>
                ) : null}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

