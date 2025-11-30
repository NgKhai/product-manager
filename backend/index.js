require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validator');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Initialize Express app
const app = express();

// Trust proxy (required for Vercel and rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware - Helmet (sets various HTTP headers)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5000', 'https://productmanager-eta.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if allowedOrigins contains '*' (wildcard)
        const isWildcardAllowed = allowedOrigins.includes('*');

        // If wildcard is allowed, or origin is in the list, allow it
        if (isWildcardAllowed || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Input sanitization middleware
app.use(sanitizeInput);

// Rate limiting middleware (apply to all routes)
app.use('/api/', apiLimiter);

// Health check route (no rate limiting)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Secure REST API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            health: '/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                refresh: 'POST /api/auth/refresh',
                me: 'GET /api/auth/me'
            },
            users: {
                list: 'GET /api/users',
                get: 'GET /api/users/:id',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id'
            },
            products: {
                list: 'GET /api/products',
                get: 'GET /api/products/:id',
                create: 'POST /api/products',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id',
                permanentDelete: 'DELETE /api/products/:id/permanent',
                categories: 'GET /api/products/categories/list'
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }

    // MongoDB cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // CORS error
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;

    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}`);
        });
    });
}

// Export app for Vercel serverless function
module.exports = app;
