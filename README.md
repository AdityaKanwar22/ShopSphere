# 🛒✨ ShopSphere  
### 🚀 A Modern Full-Stack E-Commerce Platform

<p align="center">
  <b>Built with the MERN Stack | Secure | Scalable | Production-Ready</b>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Payments-Stripe-purple?style=for-the-badge&logo=stripe" />
</p>

---

## 🌟 About The Project

**ShopSphere** is a full-stack e-commerce web application designed to provide a seamless online shopping experience.

It includes:

✔️ Secure Authentication  
✔️ Product Management  
✔️ Cart System  
✔️ Order Processing  
✔️ Online Payments  
✔️ Admin Dashboard  

---

# 🧱 Tech Stack

## 🎨 Frontend (User)
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

---

## ⚙️ Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB (Mongoose)
- 🔐 JWT Authentication
- 📂 Multer (File Upload)
- ☁️ Cloudinary (Image Hosting)
- 💳 Stripe (Payment Integration)

---

# 📁 Project Structure

```
ShopSphere/
│
├── admin/        → Admin dashboard
├── backend/      → Express API server
├── frontend/     → User e-commerce frontend
├── .gitignore
└── README.md
```

---

# ✨ Features

## 👤 User Features

🔐 User Registration & Login (JWT Auth)  
🛍 Browse Products  
🔍 Search & Filter Products  
🛒 Add to Cart  
➕ Update Cart Quantity  
📦 Place Orders  
💳 Secure Online Payments (Stripe)  
📜 Order History  

---

## 🛠 Admin Features

🔐 Admin Authentication  
➕ Add New Products  
📤 Upload Product Images (Cloudinary)  
📋 View All Products  
📦 Manage Orders  

---

# ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
STRIPE_SECRET_KEY=
```

Create a `.env` file inside `frontend` and `admin`:

```env
VITE_BACKEND_URL=
```

> ⚠️ Never commit `.env` files to GitHub.

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

Backend runs at:
```
http://localhost:4000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## 4️⃣ Admin Setup

```bash
cd admin
npm install
npm run dev
```

Admin runs at:
```
http://localhost:5174
```

---

# 🔐 Security Practices

✔ Password hashing using bcrypt  
✔ JWT-based authentication  
✔ Environment variables for secrets  
✔ Secure payment integration  

---

# 🚀 Future Enhancements

✨ Product Reviews & Ratings  
✨ Wishlist Feature  
✨ Order Tracking  
✨ Role-Based Access Control  
✨ Pagination & Performance Optimization  

---

# 👨‍💻 Author

### 💙 Aditya Kanwar
GitHub: https://github.com/AdityaKanwar22  

---

<p align="center">
  ⭐ If you like this project, consider giving it a star!
</p>

