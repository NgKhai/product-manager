const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
    try {
        // Get token from header or cookie
        let token;

        // Check Authorization header (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check cookie
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        try {
            const decoded = verifyAccessToken(token);

            // Find user by ID from token
            const user = await User.findById(decoded.userId).select('-password -refreshTokens');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated.'
                });
            }

            // Attach user to request object
            req.user = user;
            req.userId = user._id;
            req.userRole = user.role;

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Invalid or expired token.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

// Middleware to check if user has admin role
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Middleware to check if user has specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                const user = await User.findById(decoded.userId).select('-password -refreshTokens');

                if (user && user.isActive) {
                    req.user = user;
                    req.userId = user._id;
                    req.userRole = user.role;
                }
            } catch (error) {
                // Token invalid, but we continue without user
                console.log('Optional auth: Invalid token');
            }
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};

module.exports = {
    authenticate,
    authorizeAdmin,
    authorizeRoles,
    optionalAuth
};
