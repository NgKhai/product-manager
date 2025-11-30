# Secure REST API with Node.js & JWT Authentication

A production-ready REST API built with Node.js, Express, and MongoDB featuring enterprise-grade authentication and security measures. Optimized for deployment on Vercel.

## 🔐 Security Features

- **JWT Authentication** - Access and refresh token system
- **Bcrypt Password Hashing** - Industry-standard password protection (10 rounds)
- **HTTP-Only Cookies** - Prevents XSS attacks on refresh tokens
- **Rate Limiting** - Protects against brute force and DDoS attacks
- **Helmet.js** - Sets secure HTTP headers
- **CORS Protection** - Configurable origin whitelist
- **Input Validation** - Using express-validator
- **Input Sanitization** - Prevents NoSQL injection attacks
- **Password Requirements** - Enforces strong password policies

## 🚀 Features

- User registration and login
- JWT token-based authentication with refresh tokens
- Protected routes with role-based access control
- User profile management (CRUD operations)
- Soft delete (account deactivation)
- MongoDB integration with Mongoose
- Comprehensive error handling
- API documentation built-in

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd rest-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and configure:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_ACCESS_SECRET` - Strong random secret for access tokens
   - `JWT_REFRESH_SECRET` - Strong random secret for refresh tokens
   - Other configuration as needed

   **Generate secure JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get current user
```http
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Refresh access token
```http
POST /api/auth/refresh
Cookie: refreshToken=YOUR_REFRESH_TOKEN

or

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Logout from all devices
```http
POST /api/auth/logout-all
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### User Routes (Protected)

#### Get all users (Admin only)
```http
GET /api/users?page=1&limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Get user by ID
```http
GET /api/users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Update user profile
```http
PUT /api/users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Deactivate user account
```http
DELETE /api/users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🧪 Testing with curl

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"TestPass123\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123\"}"
```

### Get current user (replace YOUR_TOKEN)
```bash
curl -X GET http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🌐 Deploying to Vercel

### Prerequisites
- Vercel account ([sign up here](https://vercel.com))
- Vercel CLI installed: `npm i -g vercel`

### Deployment Steps

1. **Install Vercel CLI (if not already installed):**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set up environment variables in Vercel:**
   
   Go to your Vercel dashboard → Project Settings → Environment Variables, and add:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ALLOWED_ORIGINS` (your frontend URL)
   - Other variables from `.env.example`

5. **Redeploy after setting environment variables:**
   ```bash
   vercel --prod
   ```

### MongoDB Setup for Production

We recommend using **MongoDB Atlas** (free tier available):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add your IP address to the whitelist (or use `0.0.0.0/0` for Vercel)
4. Create a database user
5. Get your connection string and add it to Vercel environment variables

## 📁 Project Structure

```
rest-api/
├── api/
│   └── index.js          # Vercel serverless function entry point
├── middleware/
│   ├── auth.js           # Authentication & authorization middleware
│   ├── rateLimiter.js    # Rate limiting configurations
│   └── validator.js      # Input validation & sanitization
├── models/
│   └── User.js           # User model with Mongoose schema
├── routes/
│   ├── auth.js           # Authentication routes
│   └── users.js          # User management routes
├── utils/
│   └── jwt.js            # JWT token utilities
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore file
├── index.js              # Main application file
├── package.json          # Project dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production** - Set `secure: true` for cookies
2. **Keep JWT secrets secure** - Never commit them to version control
3. **Use environment variables** - For all sensitive configuration
4. **Regular updates** - Keep dependencies up to date
5. **Implement proper logging** - Monitor for suspicious activities
6. **Use strong passwords** - Enforce password policies
7. **Rate limiting** - Already implemented for all routes
8. **Input validation** - All inputs are validated and sanitized

## 🔑 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## 🎯 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication routes**: 5 requests per 15 minutes per IP
- **Account creation**: 3 accounts per hour per IP

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Vercel**
