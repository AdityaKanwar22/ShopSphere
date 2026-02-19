# 🛠 11. Troubleshooting Guide (Products Not Showing & Login Issues)

This guide provides a root-cause analysis and step-by-step fixes for the specific issues you are facing.

---

## 🔎 Issue 1: Products Not Showing on Frontend

**Symptoms:** Admin panel shows products, but Frontend is empty.

### 🔍 Root Cause 1: API Response Structure Mismatch
The backend might be sending `{ products: [...] }` but the frontend expects `[...]` directly, or vice-versa.

-   **Inspect File:** `frontend/src/context/ShopContext.jsx`
-   **Check Function:** `getProductsData`

**Incorrect Code (Example):**
```javascript
setProducts(response.data); // If backend sends { success: true, products: [...] }
```

**✅ Corrected Code:**
```javascript
const getProductsData = async () => {
    try {
        const response = await axios.get(backendUrl + "/api/product/list");
        if (response.data.success) { // Check success flag
            setProducts(response.data.products); // Access the array inside the object
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
};
```

### 🔍 Root Cause 2: Database Empty or "Hidden" Fields
Products might exist but have `bestseller: true` while you are filtering for something else, or image URLs are broken.

-   **Inspect:** MongoDB Atlas (Collections tab).
-   **Check:** Do the products have a valid `image` array? If `image` is empty `[]`, the frontend might crash or hide them.

**Fix:** Ensure `image` field is an array of strings.
```json
"image": ["https://res.cloudinary.com/...", "https://..."]
```

### 🔍 Root Cause 3: API URL Mismatch
The frontend might be hitting the wrong endpoint.

-   **Inspect:** Browser Console -> Network Tab.
-   **Check:** Look for the request to `/api/product/list`. Is it `200 OK`?
    -   If `404 Not Found`: Check `VITE_BACKEND_URL` in `.env`. It should NOT have a trailing slash (e.g., `http://localhost:4000`).
    -   If `500 Error`: Check backend terminal for crash logs.

---

## 🔎 Issue 2: User Login Not Working

**Symptoms:** Admin login works, but User login fails or does nothing.

### 🔍 Root Cause 1: Password Hashing Mismatch
If you manually created a user in MongoDB Compass/Atlas, the password is **plain text**. The login logic uses `bcrypt.compare()`, which expects a **hashed** password.

-   **Verification:** Check the `password` field in MongoDB.
    -   ❌ Plain text: `password123`
    -   ✅ Hashed: `$2a$10$Xk9...`
-   **Fix:** You **MUST** register users via the `/api/user/register` endpoint (Frontend Sign Up page) so the password gets hashed properly.

### 🔍 Root Cause 2: Frontend API Call Structure
The frontend might be sending data in the wrong format.

-   **Inspect File:** `frontend/src/pages/Login.jsx`
-   **Check:** `onSubmitHandler` function.

**Correct Request Logic:**
```javascript
const response = await axios.post(backendUrl + '/api/user/login', {
    email,    // Ensure variable names match backend expectations
    password
});
```

### 🔍 Root Cause 3: Token Storage Issue
If the login "succeeds" (API returns 200) but the user isn't logged in, the token isn't being saved.

-   **Inspect File:** `frontend/src/context/ShopContext.jsx` (if managing token there) or `Login.jsx`.

**Correct Token Handling:**
```javascript
if (response.data.success) {
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token); // Persist login
    navigate('/'); // Redirect to home
} else {
    toast.error(response.data.message);
}
```

---

## 🧠 System-Wide Checks

### 1. CORS Configuration
If Admin works but Frontend doesn't, CORS might be blocking the Frontend's origin.

-   **Inspect:** `backend/server.js`
-   **Fix:** Ensure both origins are allowed.
    ```javascript
    app.use(cors({
        origin: ["http://localhost:5173", "http://localhost:5174"], // Frontend & Admin
        credentials: true
    }));
    ```

### 2. Environment Variables
-   Ensure `frontend/.env` has `VITE_BACKEND_URL=http://localhost:4000`
-   Ensure `backend/.env` has the correct `MONGODB_URI`.

### 🧪 How to Verify
1.  **Frontend Products**: Open Chrome DevTools -> Network. Refresh. Click the `list` request. Look at the `Preview` tab. Do you see the JSON object?
2.  **User Login**: Try registering a **new** user. Log out. Log in with that new user. If this works, the issue was "Root Cause 1" (manual DB entry).
