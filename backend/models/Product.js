const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: {
            values: ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Beauty', 'Other'],
            message: '{VALUE} is not a valid category'
        }
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    sku: {
        type: String,
        unique: true,
        required: [true, 'SKU is required'],
        trim: true,
        uppercase: true
    },
    imageUrl: {
        type: String,
        trim: true,
        match: [
            /^https?:\/\/.+/,
            'Please provide a valid URL for the image'
        ]
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster lookups
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ createdBy: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock < 10) return 'Low Stock';
    return 'In Stock';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
