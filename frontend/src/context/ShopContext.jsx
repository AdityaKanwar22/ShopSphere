import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// 🍪 IMPORTANT: allow cookies to be sent automatically with requests
axios.defaults.withCredentials = true;

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = "₹";
    const delivery_fee = 100;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const navigate = useNavigate();


    // ======================================================
    // 🛒 ADD PRODUCT TO CART
    // ======================================================

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

        // 🍪 Cookie automatically sent — no token needed
        try {
            const response = await axios.post(
                backendUrl + "/api/cart/add",
                { itemId, size }
            );

            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };


    // ======================================================
    // 🔢 CART COUNT
    // ======================================================

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


    // ======================================================
    // ✏️ UPDATE CART QUANTITY
    // ======================================================

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        try {
            await axios.post(
                backendUrl + "/api/cart/update",
                { itemId, size, quantity }
            );
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };


    // ======================================================
    // 💰 TOTAL CART AMOUNT
    // ======================================================

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const item in cartItems) {
            const itemInfo = products.find(
                (product) => product._id === item
            );

            for (const size in cartItems[item]) {
                if (cartItems[item][size] > 0) {
                    totalAmount +=
                        itemInfo.price * cartItems[item][size];
                }
            }
        }

        return totalAmount;
    };


    // ======================================================
    // 📦 FETCH PRODUCTS
    // ======================================================

    const getProductsData = async () => {
        try {
            const response = await axios.get(
                backendUrl + "/api/product/list"
            );

            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };


    // ======================================================
    // 🛒 FETCH USER CART (Cookie Auth)
    // ======================================================

    const getUserCart = async () => {
        try {
            const response = await axios.post(
                backendUrl + "/api/cart/get"
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
        }
    };


    // ======================================================
    // 🔐 FETCH CSRF TOKEN ON APP LOAD (Advanced Security)
    // ======================================================

    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                const { data } = await axios.get(
                    backendUrl + "/api/csrf-token"
                );

                axios.defaults.headers.common[
                    "X-CSRF-Token"
                ] = data.csrfToken;
            } catch (error) {
                console.log("CSRF token fetch failed");
            }
        };

        getCsrfToken();
    }, []);


    // ======================================================
    // 🚀 INITIAL DATA LOAD
    // ======================================================

    useEffect(() => {
        getProductsData();
        getUserCart(); // Load cart if user logged in
    }, []);


    // ======================================================
    // 🌍 CONTEXT VALUES
    // ======================================================

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
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
