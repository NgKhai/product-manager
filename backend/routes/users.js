const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validator');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only allow users to view their own profile or admins to view any profile
        if (req.userId.toString() !== req.params.id && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', authenticate, validateProfileUpdate, async (req, res) => {
    try {
        // Only allow users to update their own profile or admins to update any profile
        if (req.userId.toString() !== req.params.id && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { name, email } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({
                email,
                _id: { $ne: req.params.id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }

            updateData.email = email;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete - deactivate)
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Only allow users to delete their own account or admins to delete any account
        if (req.userId.toString() !== req.params.id && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Soft delete - set isActive to false instead of actually deleting
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Account deactivated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

module.exports = router;
