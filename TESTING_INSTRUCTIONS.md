# ShopSphere — Testing Instructions

## Prerequisites

- Backend: `cd backend && npm install && npm run server`
- Frontend: `cd frontend && npm run dev`
- Admin: `cd admin && npm run dev`
- MongoDB running

---

## Email configuration (required for working emails)

Add to `backend/.env` for **password reset**, **newsletter confirmation**, and **order status emails**:

```env
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MAIL_FROM=noreply@shopsphere.com
```

For Gmail: use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.

---

## Feature 1: Forgot Password (with working email)

1. **Login page** → Click **"Forgot Password?"** → goes to `/forgot-password`.
2. **Forgot Password** → Enter email → Submit → check inbox for reset link.
3. **Reset link** → Open `http://localhost:5173/reset-password/<token>` from email.
4. **Reset Password** → Enter new password + confirm → Submit → redirect to login.
5. **Login** with same email and new password.

---

## Feature 2: Email subscription (About page)

1. Open **About** (`/about`).
2. Enter email → **SUBSCRIBE** → success toast; check inbox for "Welcome to ShopSphere Newsletter".

---

## Feature 3: Human-readable User ID

- **Profile** → shows e.g. **USER001**, **USER002**.
- **Admin → Users** → table shows User ID, Name, Email, Joined.

---

## Feature 4: Order status tracking

**Statuses:** Order Placed → Processing → Shipped → Out For Delivery → Delivered (or Cancelled).

1. **Frontend → My Orders** → each order shows a **status timeline** (steps with current status).
2. **Admin → Orders** → change status via dropdown (Order Placed, Processing, Shipped, Out For Delivery, Delivered, Cancelled).

---

## Feature 5: Order status email notifications

When **admin** updates an order to:

- **Shipped** → customer receives email: "Your Order Has Shipped".
- **Delivered** → customer receives email: "Your Order Has Been Delivered".

Ensure `EMAIL_*` is set in backend `.env` and the order’s user has a valid email.

---

## Feature 6: Wishlist

1. **Product page** → **❤️ Add to Wishlist** (or "In Wishlist" if already added).
2. **Profile menu** → **Wishlist** → `/wishlist` lists saved products; **Remove** to delete.
3. **APIs:** `GET /api/wishlist`, `POST /api/wishlist/add`, `POST /api/wishlist/remove` (auth required).

---

## Feature 7: Product reviews

1. **Product page** → **Reviews** tab → see rating (stars), total count, and list of reviews.
2. **Logged-in users** → can submit rating (1–5) and optional comment; **Submit Review**.
3. **Backend:** `GET /api/review/product/:productId`, `POST /api/review` (auth, body: `productId`, `rating`, `comment`).
4. Product list and product page show **averageRating** and **totalReviews**.

---

## Feature 8: Admin dashboard

- **Admin → Users** → view User ID, Name, Email, Joined.
- **Admin → Orders** → view orders, User ID, update status (dropdown with all statuses).
- **Admin → Reviews** → view Product ID, User ID, Rating, Comment, Date.

---

## Regression checks (do not break)

- **Auth:** Login, Register, Logout, protected routes (cart, wishlist, place order, profile, orders).
- **Cart:** Add to cart, update quantity, cart count, cart total.
- **Orders:** Place order (COD/Stripe), view orders (frontend timeline), list/update status (admin), status emails.
- **Admin:** Login, Add product, List products, Orders, Users, Reviews.
- **Products:** List, product page, search, reviews, wishlist.

---

## Quick API reference

| Method | Endpoint | Auth | Body | Notes |
|--------|----------|------|------|--------|
| POST | `/api/user/forgot-password` | No | `{ "email": "..." }` | Sends reset link |
| POST | `/api/user/reset-password/:token` | No | `{ "password": "..." }` | New password (min 8, 1 number, 1 upper) |
| POST | `/api/subscribe` | No | `{ "email": "..." }` | Newsletter subscription + confirmation email |
| GET | `/api/wishlist` | User | - | List wishlist products |
| POST | `/api/wishlist/add` | User | `{ "productId": "..." }` | Add to wishlist |
| POST | `/api/wishlist/remove` | User | `{ "productId": "..." }` | Remove from wishlist |
| GET | `/api/review/product/:productId` | No | - | Reviews for product |
| POST | `/api/review` | User | `{ "productId", "rating", "comment?" }` | Add/update review |
| GET | `/api/user/admin/users` | Admin | - | List users (User ID, name, email) |
| GET | `/api/review/admin/list` | Admin | - | List all reviews |
