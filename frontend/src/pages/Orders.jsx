import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import apiClient from "../api/client";

const ORDER_STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

const getStepIndex = (status) => {
  if (status === "Cancelled") return -1;
  const idx = ORDER_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const OrderTracker = ({ status }) => {
  const currentIdx = getStepIndex(status);

  if (status === "Cancelled") {
    return (
      <div className="mt-2 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="font-medium text-red-600">Cancelled</span>
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        return (
          <div
            key={step}
            className={`flex items-center gap-2 p-2 border rounded ${
              done ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                done ? "bg-green-600" : "bg-gray-300"
              }`}
            />
            <span className={done ? "text-green-700 font-medium" : "text-gray-500"}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Orders = () => {
  const { currency, isAuthenticated } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!isAuthenticated) {
        return null;
      }
      const response = await apiClient.post("/api/order/userorders", {});
      if (response.data.success) {
        setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      }
    } catch (error) {
      // apiClient interceptor already shows toast if needed
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [isAuthenticated]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div>
        {orders.map((order, index) => (
          <div
            key={index}
            className="py-6 border-t border-b text-gray-700 flex flex-col gap-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="text-sm">
                <p className="font-medium">
                  Order ID: <span className="text-gray-500">{order._id}</span>
                </p>
                <p className="mt-1">
                  Date:{" "}
                  <span className="text-gray-400">
                    {new Date(order.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className="text-gray-400">{order.paymentMethod}</span>
                </p>
                <p className="mt-1">
                  Total:{" "}
                  <span className="text-gray-400">
                    {currency}
                    {order.amount}
                  </span>
                </p>
                <p className="mt-1">
                  Status: <span className="font-medium">{order.status}</span>
                </p>
              </div>

              <button
                onClick={loadOrderData}
                className="border px-4 py-2 text-sm font-medium rounded-sm w-fit"
              >
                Refresh Status
              </button>
            </div>

            <OrderTracker status={order.status} />

            <div className="grid gap-3">
              {Array.isArray(order.items) &&
                order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 text-sm">
                    {item?.image?.[0] ? (
                      <img
                        className="w-16 sm:w-20"
                        src={item.image[0]}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 border rounded" />
                    )}
                    <div>
                      <p className="sm:text-base font-medium">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                        <p>
                          {currency}
                          {item.price}
                        </p>
                        <p>Quantity: {item.quantity}</p>
                        {item.size ? <p>Size: {item.size}</p> : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;