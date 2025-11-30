const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validateProductCreation, validateProductUpdate } = require('../middleware/productValidator');

// @route   GET /api/products
// @desc    Get all products with filtering, pagination, and search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query filters
        const filters = {};

        // Category filter
        if (req.query.category) {
            filters.category = req.query.category;
        }

        // Active status filter (only show active products for non-admin users)
        if (req.userRole !== 'admin') {
            filters.isActive = true;
        } else if (req.query.isActive !== undefined) {
            filters.isActive = req.query.isActive === 'true';
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filters.price = {};
            if (req.query.minPrice) filters.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filters.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Stock filter
        if (req.query.inStock === 'true') {
            filters.stock = { $gt: 0 };
        }

        // Search by name or description
        if (req.query.search) {
            filters.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sorting
        let sortBy = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sortBy[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sortBy = { createdAt: -1 }; // Default: newest first
        }

        const products = await Product.find(filters)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filters);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Only show inactive products to admins
        if (!product.isActive && req.userRole !== 'admin') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (authenticated users)
router.post('/', authenticate, validateProductCreation, async (req, res) => {
    try {
        const { name, description, price, category, stock, sku, imageUrl, tags } = req.body;

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        // Create new product
        const product = new Product({
            name,
            description,
            price,
            category,
            stock: stock || 0,
            sku: sku.toUpperCase(),
            imageUrl,
            tags,
            createdBy: req.userId
        });

        await product.save();

        // Populate creator info
        await product.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (owner or admin)
router.put('/:id', authenticate, validateProductUpdate, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check permissions: only creator or admin can update
        if (product.createdBy.toString() !== req.userId.toString() && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own products.'
            });
        }

        const { name, description, price, category, stock, sku, imageUrl, tags, isActive } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (category) updateData.category = category;
        if (stock !== undefined) updateData.stock = stock;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (tags) updateData.tags = tags;

        // Only admin can update isActive status
        if (isActive !== undefined && req.userRole === 'admin') {
            updateData.isActive = isActive;
        }

        // Check if SKU is being updated and if it's unique
        if (sku && sku.toUpperCase() !== product.sku) {
            const existingProduct = await Product.findOne({
                sku: sku.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already in use by another product'
                });
            }

            updateData.sku = sku.toUpperCase();
        }

        updateData.updatedBy = req.userId;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                product: updatedProduct
            }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete)
// @access  Private (owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check permissions: only creator or admin can delete
        if (product.createdBy.toString() !== req.userId.toString() && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own products.'
            });
        }

        // Soft delete - set isActive to false
        product.isActive = false;
        product.updatedBy = req.userId;
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

// @route   DELETE /api/products/:id/permanent
// @desc    Permanently delete a product (hard delete - admin only)
// @access  Private/Admin
router.delete('/:id/permanent', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product permanently deleted'
        });
    } catch (error) {
        console.error('Permanent delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to permanently delete product'
        });
    }
});

// @route   GET /api/products/categories/list
// @desc    Get all product categories
// @access  Public
router.get('/categories/list', (req, res) => {
    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Beauty', 'Other'];
    res.json({
        success: true,
        data: {
            categories
        }
    });
});

module.exports = router;
