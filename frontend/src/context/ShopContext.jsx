// frontend/src/context/ShopContext.jsx
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import apiClient, { setCsrfToken, backendUrl } from "../api/client";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 100;

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const navigate = useNavigate();

  // ============ CART HELPERS ============

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size]
        ? cartData[itemId][size]++
        : (cartData[itemId][size] = 1);
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    try {
      const response = await apiClient.post("/api/cart/add", {
        itemId,
        size,
      });

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch {
      // interceptor already toasts
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          totalCount += cartItems[item][size];
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    try {
      await apiClient.post("/api/cart/update", {
        itemId,
        size,
        quantity,
      });
    } catch {
      // interceptor already toasts
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      const itemInfo = products.find((product) => product._id === item);
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0 && itemInfo) {
          totalAmount += itemInfo.price * cartItems[item][size];
        }
      }
    }

    return totalAmount;
  };

  // ==================== DATA FETCHING (products, cart) ====================

  const getProductsData = async () => {
    try {
      const response = await apiClient.get("/api/product/list");
      const { products: productList, success } = response.data;

      if (success === false) {
        toast.error(
          response.data.message || "Failed to load products"
        );
        return;
      }

      if (Array.isArray(productList)) {
        setProducts(productList);
      } else {
        toast.error("Invalid product data from server");
      }
    } catch {
      // interceptor handles toast
    }
  };

  const getUserCart = async () => {
    try {
      const response = await apiClient.post("/api/cart/get");
      if (response.data.success) {
        setCartItems(response.data.cartData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setIsAuthenticated(false);
        setCartItems({});
      }
    }
  };

  // ==================== AUTH ACTIONS ====================

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      const res = await apiClient.post("/api/user/login", {
        email,
        password,
      });
      if (res.data.success) {
        setIsAuthenticated(true);
        await getUserCart();
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setAuthLoading(true);
      const res = await apiClient.post("/api/user/register", {
        name,
        email,
        password,
      });
      if (res.data.success) {
        setIsAuthenticated(true);
        await getUserCart();
        toast.success("Account created");
        navigate("/");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      // optional: await apiClient.post("/api/user/logout", {});
      setIsAuthenticated(false);
      setCartItems({});
      navigate("/login");
    } finally {
      setAuthLoading(false);
    }
  };

  // ==================== CSRF + INITIAL LOAD ====================

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await apiClient.get("/api/csrf-token");
        setCsrfToken(data.csrfToken);

        await Promise.all([getProductsData(), getUserCart()]);
      } catch {
        // already handled
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    isAuthenticated,
    authLoading,
    login,
    register,
    logout,
    initializing,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;