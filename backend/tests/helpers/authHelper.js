const jwt = require('jsonwebtoken');

/**
 * Generates a mock JWT token for testing.
 * @param {Object} userPayload - The user data to include in the token.
 * @returns {string} - The generated JWT token.
 */
function generateTestToken(userPayload = { id: '507f1f77bcf86cd799439011', role: 'user' }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined. Set it in the test environment (e.g. backend/.env) before running tests.');
    }
    const payload = { user: userPayload };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

module.exports = { generateTestToken };
