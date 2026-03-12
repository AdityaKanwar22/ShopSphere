# 🛒✨ ShopSphere  
### 🚀 Secure Full-Stack E-Commerce Platform (MERN)

<p align="center">
  <b>Modern • Secure • Scalable • Production-Ready</b>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Admin-React-orange?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Security-Production--Ready-red?style=for-the-badge" />
</p>

---

# 🌟 About The Project

**ShopSphere** is a **secure full-stack e-commerce platform** built using the **MERN Stack (MongoDB, Express, React, Node.js)**.

It provides a **complete online shopping experience** along with a **dedicated admin dashboard** for managing products, orders, and store operations.

The project focuses on:

- 🔐 Security Best Practices  
- ⚡ Scalable Backend Architecture  
- 🧱 Clean Code Structure  
- 🛡 Production-Level Protection  

---

# 🧱 Tech Stack

## 🎨 Frontend (User Store)

- ⚛️ React (Vite)
- 🔀 React Router DOM
- 🎨 Tailwind CSS
- 📡 Axios
- 🔔 React Toastify

---

## 🛠 Admin Panel

- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 📡 Axios
- 📦 Order Management Interface

---

## ⚙️ Backend

- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB (Mongoose)
- 🔐 JWT Authentication
- ☁️ Cloudinary (Image Hosting)
- 💳 Stripe (Payment Integration)

---

# ✨ Core Features

## 👤 User Features

🔐 Secure User Authentication  
🛍 Browse Products  
🔎 Product Search & Filtering  
🛒 Add Products to Cart  
📦 Place Orders  
💳 Online Payments (Stripe)  
📜 Order History  
📍 Order Tracking  
👤 User Profile Page  
📋 My Orders accessible from navbar dropdown  

---

## 🛠 Admin Features

🔐 Admin Login  
➕ Add Products  
📤 Upload Product Images (Cloudinary)  
📋 View Products  
📦 Manage Orders  
🔄 Update Order Status (Processing / Shipped / Delivered)

---

# 🧭 User Navigation System

Users can access important features from the **profile dropdown menu in the navbar**.

```
Profile Icon
   │
   ├── Profile
   ├── My Orders
   └── Logout
```

---

# 📦 Order Tracking System

Users can **track their order status** in real time.

Example order lifecycle:

```
Order Placed
     ↓
Processing
     ↓
Shipped
     ↓
Delivered
```

Admin updates order status →  
User can see updated status in **My Orders page**.

---

# 🛡 Security Features

This project implements **multiple production-grade security layers**.

---

## 🔐 Authentication & Password Security

- Password hashing using **Argon2** (with temporary backward-compatible support for legacy **bcrypt** hashes)
- Secure **JWT authentication**
- Protected admin login
- Environment-based secrets

---

## 🧪 Input Validation & Sanitization

Libraries used:

```
express-validator
express-mongo-sanitize
```

Protection includes:

- Email validation
- Strong password policy
- Input sanitization
- XSS prevention
- NoSQL injection protection

Example blocked attack:

```
{ "email": { "$gt": "" } }
```

---

## 🌐 Secure CORS Configuration

API access restricted to trusted domains.

Example:

```
http://localhost:5173
http://localhost:5174
```

Prevents unauthorized API access.

---

## 🛑 Rate Limiting Protection

Implemented using:

```
express-rate-limit
```

Protection against:

- Brute-force attacks
- API abuse
- DDoS attempts

Example limits:

```
100 requests / 15 minutes
5 login attempts / 15 minutes
```

---

## 🪖 HTTP Security Headers

Implemented using:

```
helmet
```

Protection includes:

- Clickjacking prevention
- MIME sniffing protection
- Content injection protection
- Secure headers configuration

Example headers:

```
Content-Security-Policy
X-Frame-Options
Strict-Transport-Security
X-Content-Type-Options
```

---

## 🍪 Secure Cookie Authentication

Tokens stored using **HttpOnly cookies**.

Benefits:

- Prevents XSS token theft
- SameSite protection
- Secure cookies in production

---

## 🔐 CSRF Protection

Implemented using:

```
csurf
```

Workflow:

```
Frontend requests CSRF token
↓
Backend sends token
↓
Frontend sends token with protected requests
```

---

## 🍃 MongoDB Database Hardening

Security improvements include:

- Schema validation
- Enum constraints
- Sanitized queries
- Password excluded from responses

Example:

```
password field is never returned in API responses
```

---

## 📊 Logging & Monitoring

Logging implemented using:

```
morgan
winston
```

Features:

- HTTP request logging
- Error logging
- Production monitoring

---

## ⚠️ Secure Error Handling

Custom error middleware prevents leaking sensitive information.

Example response:

```
{
  "success": false,
  "message": "Internal Server Error"
}
```

Stack traces are hidden in **production**.

---

# 🧭 System Architecture

```
                ┌───────────────┐
                │   Frontend    │
                │   React App   │
                └───────┬───────┘
                        │
                        │ REST API
                        ▼
                ┌───────────────┐
                │   Backend     │
                │ Express Server│
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │   MongoDB     │
                │   Database    │
                └───────────────┘
```

Admin panel communicates with the **same backend API**.

---

# 📁 Project Structure

```
ShopSphere/
│
├── admin/        → Admin dashboard
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── assets/
│
├── .gitignore
└── README.md
```

---

# ⚙️ Environment Setup

## Backend `.env`

Create inside `backend/`

```
PORT=4000
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## Frontend `.env`

Create inside `frontend/`

```
VITE_BACKEND_URL=http://localhost:4000
```

---

# 🛠 Installation & Setup

## 1️⃣ Clone Repository

```
git clone https://github.com/AdityaKanwar22/ShopSphere.git
cd ShopSphere
```

---

## 2️⃣ Backend Setup

```
cd backend
npm install
npm start
```

---

## 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 4️⃣ Admin Setup

```
cd admin
npm install
npm run dev
```

---

# 🚀 Future Improvements

✨ Product Reviews  
✨ Wishlist System  
✨ Email Notifications  
✨ Role-Based Access Control  
✨ Admin Analytics Dashboard  
✨ Performance Optimization  

---

# 👨‍💻 Author

### 💙 Aditya Kanwar

GitHub:  
https://github.com/AdityaKanwar22

---

<p align="center">
⭐ If you like this project, consider giving it a star!
</p>