const jwt = require('jsonwebtoken');

/**
 * Generates a mock JWT token for testing.
 * @param {Object} userPayload - The user data to include in the token.
 * @returns {string} - The generated JWT token.
 */
function generateTestToken(userPayload = { id: '507f1f77bcf86cd799439011', role: 'user' }) {
    const secret = process.env.JWT_SECRET || '804e492f0de236bfe433ff8053618ae8e84b29c93f191c8adcdd94bd3ec3b465';
    const payload = { user: userPayload };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

module.exports = { generateTestToken };
