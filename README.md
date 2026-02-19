# 🛒✨ ShopSphere  
### 🚀 Secure Full-Stack E-Commerce Platform (MERN)

<p align="center">
  <b>Modern • Secure • Scalable • Production-Ready</b>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Security-Production--Ready-red?style=for-the-badge" />
</p>

---

## 🌟 About The Project

**ShopSphere** is a secure full-stack e-commerce application built using the MERN stack.  
It provides a complete online shopping experience along with an admin dashboard for product and order management.

The project emphasizes **security, scalability, and clean architecture**, making it production-ready.

---

# 🧱 Tech Stack

## 🎨 Frontend
- ⚛️ React (Vite)
- 🔀 React Router DOM
- 🎨 Tailwind CSS
- 📡 Axios
- 🔔 React Toastify

## 🛠 Admin Panel
- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 📡 Axios

## ⚙️ Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB (Mongoose)
- 🔐 JWT Authentication
- ☁️ Cloudinary (Image Hosting)
- 💳 Stripe (Payment Integration)

---

# ✨ Features

## 👤 User Features

🔐 Secure User Authentication (JWT)  
🛍 Browse & Search Products  
🛒 Cart Management  
📦 Place Orders  
💳 Online Payments (Stripe)  
📜 Order History  

---

## 🛠 Admin Features

🔐 Admin Login  
➕ Add Products  
📤 Upload Images (Cloudinary)  
📋 View Products  
📦 Manage Orders  

---

# 🛡 Security Features (NEW)

This project implements multiple production-grade security practices:

### 🔐 Authentication & Password Security
- Password hashing using **bcrypt**
- JWT-based authentication
- Admin credential protection via environment variables

---

### 🧪 Input Validation & Sanitization
- Request validation using **express-validator**
- Email format enforcement
- Strong password policy
- Input sanitization to prevent malicious data
- XSS prevention using `.escape()`

---

### 🧨 NoSQL Injection Protection
- Global sanitization using **express-mongo-sanitize**
- Removes dangerous MongoDB operators (`$ne`, `$gt`, etc.)
- Protects against authentication bypass attacks

---

### 🌐 Secure CORS Configuration
- Domain whitelist (no wildcard `*`)
- Only trusted frontend/admin domains can access API
- Blocks unauthorized cross-origin requests

---

### 🔑 Secure Environment Variable Handling
- Secrets stored in `.env` (never committed)
- Validated using **envalid**
- Application fails fast if critical variables are missing
- `.env.example` provided for safe configuration

---

### 🧱 Additional Security Practices
- Sensitive keys kept server-side only
- Frontend exposes only public variables (`VITE_` prefix)
- Production-ready configuration structure

---

# 📁 Project Structure

```
ShopSphere/
│
├── admin/        → Admin dashboard
├── backend/      → Secure Express API
├── frontend/     → User storefront
├── .gitignore
└── README.md
```

---

# ⚙️ Environment Setup

## Backend `.env`

Create inside `backend/`:

```env
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

Create inside `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

# 🛠 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/AdityaKanwar22/ShopSphere.git
cd ShopSphere
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 4️⃣ Admin Setup

```bash
cd admin
npm install
npm run dev
```

---

# 🚀 Future Improvements

✨ Product Reviews  
✨ Wishlist  
✨ Order Tracking  
✨ Role-Based Access Control  
✨ Performance Optimization  

---

# 👨‍💻 Author

### 💙 Aditya Kanwar  
GitHub: https://github.com/AdityaKanwar22  

---

<p align="center">
  ⭐ If you like this project, consider giving it a star!
</p>
