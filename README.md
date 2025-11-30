# Product Manager - Full Stack MERN Application

A simple, production-ready Product Management System built with the MERN stack (MongoDB, Express, React, Node.js). This project demonstrates a simple full-stack workflow including authentication, role-based access control, CRUD operations, and cloud deployment.

## 🚀 Live Demo

- **Frontend**: [https://productmanager-eta.vercel.app](https://productmanager-eta.vercel.app)
- **Backend API**: [https://product-rest-api-drab.vercel.app](https://product-rest-api-drab.vercel.app)

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure access and refresh token rotation.
- **Role-Based Access Control (RBAC)**: Admin vs. User permissions.
- **Security Best Practices**: Helmet headers, Rate Limiting, Input Sanitization, CORS protection.
- **Password Hashing**: Bcrypt for secure password storage.

### 📦 Product Management
- **Create Product**: Rich text description, image URL preview, and categorization.
- **Read Products**: Grid view with search, filtering, and pagination support.
- **Update Product**: Edit details with pre-filled forms (Admin/Owner only).
- **Delete Product**: Secure deletion with confirmation dialogs (Admin/Owner only).
- **Stock Tracking**: Real-time inventory management.

### 🎨 Frontend UI/UX
- **Modern Design**: Clean, flat aesthetic with consistent color palette.
- **Responsive**: Mobile-first layout using CSS Grid and Flexbox.
- **Interactive**: Loading states, toast notifications, and smooth transitions.
- **Dark/Light Mode**: Theme switching capability.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Deployment**: Vercel Serverless Functions

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

## 📂 Project Structure

```bash
rest-api/
├── backend/              # Express API
│   ├── api/             # Vercel entry point
│   ├── middleware/      # Auth, CORS, RateLimit
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # API Endpoints
│   └── index.js         # App entry point
│
└── frontend/            # React App
    ├── src/
    │   ├── api/         # Axios setup
    │   ├── components/  # Reusable UI
    │   ├── context/     # Auth & Theme Context
    │   └── pages/       # Route Views
    └── vercel.json      # SPA routing config
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account

### 1. Clone the Repository
```bash
git clone https://github.com/NgKhai/product-manager.git
cd rest-api
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=your_connection_string" > .env
echo "JWT_ACCESS_SECRET=your_secret" >> .env
echo "JWT_REFRESH_SECRET=your_refresh_secret" >> .env
echo "ALLOWED_ORIGINS=http://localhost:5173" >> .env

npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

npm run dev
```

## 🌍 Deployment (Vercel)

This project is a Monorepo, so it requires two separate deployments on Vercel.

### Backend Deployment
1. Create a new Vercel project.
2. Set **Root Directory** to `backend`.
3. Add Environment Variables: `MONGODB_URI`, `JWT_SECRETS`, etc.
4. **Important**: Set `ALLOWED_ORIGINS` to your frontend URL (e.g., `https://your-frontend.vercel.app`).

### Frontend Deployment
1. Create a new Vercel project.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable: `VITE_API_BASE_URL` (your backend URL).

## 📚 API Documentation

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user | Public |
| **POST** | `/api/auth/login` | Login user | Public |
| **GET** | `/api/products` | Get all products | Public |
| **GET** | `/api/products/:id` | Get single product | Public |
| **POST** | `/api/products` | Create product | 🔒 User |
| **PUT** | `/api/products/:id` | Update product | 🔒 Owner/Admin |
| **DELETE** | `/api/products/:id` | Delete product | 🔒 Owner/Admin |

## 📄 License

MIT License.
