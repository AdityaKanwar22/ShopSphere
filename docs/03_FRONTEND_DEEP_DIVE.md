# 🎨 03. Frontend Deep Dive (React)

## 🚀 1. The Entry Point: `main.jsx` & `App.jsx`

### `frontend/src/main.jsx`
This is where React takes over the DOM.

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> {/* Enables routing throughout the app */}
    <ShopContextProvider> {/* Wraps app in global state */}
      <App /> {/* The main component */}
    </ShopContextProvider>
  </BrowserRouter>,
)
```

### `frontend/src/App.jsx`
Sets up the routes (pages).

```javascript
import { Routes, Route } from "react-router-dom";
// ... Imports for all pages (Home, Cart, Login, etc.)

const App = () => {
    return (
        <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]"> {/* Responsive padding */}
            <ToastContainer /> {/* For showing notifications */}
            <Navbar /> {/* Header is always visible */}
            <SearchBar /> {/* Search bar is always visible but conditionally rendered inside */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                {/* ... other routes */}
                <Route path="/product/:productId" element={<Product />} /> {/* Dynamic Route */}
            </Routes>
            <Footer /> {/* Footer is always visible */}
        </div>
    );
};
```

---

## 🧠 2. Global State: `ShopContext.jsx`

This file manages the state for the entire application. Instead of "prop drilling", we provide these values to any component that asks for them.

### Key State Variables
-   `products`: Array of all products. Fetched from backend on mount.
-   `cartItems`: Object `{ itemId: { size: quantity } }`. Tracks what user added.
-   `token`: The JWT auth token. If present, user is logged in.

### `addToCart` Function Logic
```javascript
const addToCart = async (itemId, size) => {
    if (!size) { // Validation: Size is mandatory
        toast.error("Select Product Size");
        return;
    }
    // 1. Clone state (never mutate state directly!)
    let cartData = structuredClone(cartItems);

    // 2. Update local state logic
    if (cartData[itemId]) {
        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        } else {
            cartData[itemId][size] = 1;
        }
    } else {
        cartData[itemId] = {};
        cartData[itemId][size] = 1;
    }
    setCartItems(cartData); // Optimistic UI Update (instant feedback)

    // 3. Sync with Backend
    if (token) {
        try {
            await axios.post(
                backendUrl + "/api/cart/add",
                { itemId, size },
                { headers: { token } }
            );
        } catch (error) {
           // Error handling
        }
    }
};
```

---

## 📄 3. Key Pages

### `frontend/src/pages/Product.jsx`
Displays a single product's details.

**How it works:**
1.  **Get ID**: Uses `useParams()` to get `productId` from URL.
2.  **Find Data**: Uses `useContext(ShopContext)` to get `products` array and `.find()` the matching product.
3.  **Render**: Shows image gallery, title, price, size selector.
4.  **Action**: "Add to Cart" button calls `addToCart` from context.

### `frontend/src/pages/Cart.jsx`
Displays the user's cart.

**How it works:**
1.  **Filter**: Iterates through `cartItems` object.
2.  **Match**: Finds corresponding product details (image, name) from `products` array.
3.  **Calculate**: Uses `getCartAmount` helper.
4.  **Render**: Maps through the items to create a list.

---

## 🧩 4. Components

### `frontend/src/components/Navbar.jsx`
The navigation bar.

**Logic:**
-   Checks `token` from context.
-   If `token` exists -> Show "Profile" icon and "Logout".
-   If `token` is empty -> Show "Login" button.

### `frontend/src/components/RelatedProducts.jsx`
Shows products in the same category.

**Logic:**
-   Accepts `category` and `subCategory` as props.
-   Filters the global `products` list.
-   Renders the top 5 matches.

---

## 🧠 5. Mini Task: Test Your Frontend Knowledge
1.  **State vs Props**: In `Product.jsx`, `productData` is state (local) or props? (Hint: It's derived from Context).
2.  **Routing**: How does the app know to load `Product.jsx` when you visit `/product/123`? (Look at `App.jsx`).
3.  **Context**: Why do we wrap `<App />` with `<ShopContextProvider>` in `main.jsx`?

*Answers:*
1.  *It's local state initialized from Context data.*
2.  *The `<Route path="/product/:productId" element={<Product />} />` matches the URL pattern.*
3.  *So that ANY component inside `<App />` can access the context values (products, cart, etc.).*
