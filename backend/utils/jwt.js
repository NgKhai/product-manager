const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
const generateAccessToken = (userId, role = 'user') => {
    return jwt.sign(
        {
            userId,
            role,
            type: 'access'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            issuer: 'secure-rest-api',
            audience: 'api-users'
        }
    );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            issuer: 'secure-rest-api',
            audience: 'api-users'
        }
    );
};

// Generate both tokens
const generateTokens = (userId, role = 'user') => {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId);

    return {
        accessToken,
        refreshToken
    };
};

// Verify access token
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
            issuer: 'secure-rest-api',
            audience: 'api-users'
        });

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid access token');
        }
        throw error;
    }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: 'secure-rest-api',
            audience: 'api-users'
        });

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken
};
