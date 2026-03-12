import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/client";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/user/admin/users");
      if (response.data?.success && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data?.message || "Failed to load users");
      }
    } catch (e) {
      // interceptor toasts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h3 className="mb-4">Users</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">User ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-2 border font-mono font-medium">
                    {u.userId || u._id}
                  </td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
