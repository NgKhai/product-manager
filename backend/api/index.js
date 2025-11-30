const mongoose = require('mongoose');
const app = require('../index');

// Connect to MongoDB
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        cachedDb = conn;
        console.log('MongoDB connected for serverless function');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Serverless function handler for Vercel
module.exports = async (req, res) => {
    try {
        // Ensure database is connected
        await connectDB();

        // Handle the request with Express app
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
