const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { authLimiter, createAccountLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', createAccountLimiter, validateRegistration, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password // Will be hashed by pre-save middleware
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        // Save refresh token to user document
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });
        await user.save();

        // Set HTTP-only cookie for refresh token (more secure)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and check credentials
        const user = await User.findByCredentials(email, password);

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        // Save refresh token to user document
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });

        // Keep only last 5 refresh tokens per user
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }

        await user.save();

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        if (error.message === 'Invalid credentials') {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public (but requires refresh token)
router.post('/refresh', async (req, res) => {
    try {
        // Get refresh token from cookie or body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and check if refresh token is valid
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if refresh token exists in user's tokens
        const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id, user.role);

        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        user.refreshTokens.push({
            token: tokens.refreshToken,
            createdAt: new Date()
        });
        await user.save();

        // Set new refresh token cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Token refresh failed'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (refreshToken) {
            // Remove refresh token from user document
            const user = await User.findById(req.userId);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
                await user.save();
            }
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed. Please try again.'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices (invalidate all refresh tokens)
// @access  Private
router.post('/logout-all', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (user) {
            user.refreshTokens = [];
            await user.save();
        }

        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout from all devices'
        });
    }
});

module.exports = router;
