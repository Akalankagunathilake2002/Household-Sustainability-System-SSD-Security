const express = require('express');

const router = express.Router();

const {
    initiateRegister,
    verifyRegisterOTP,
    completeRegister,
    login,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const {
    googleLogin,
    googleCallback,
    exchangeOAuthCode
} = require('../controllers/oauthController');


// ============================================
// Existing Authentication Routes
// ============================================

// @route   POST api/auth/register/initiate
// @desc    Step 1: Send OTP
// @access  Public
router.post('/register/initiate', initiateRegister);


// @route   POST api/auth/register/verify
// @desc    Step 2: Verify OTP
// @access  Public
router.post('/register/verify', verifyRegisterOTP);


// @route   POST api/auth/register/complete
// @desc    Step 3: Create Account
// @access  Public
router.post('/register/complete', completeRegister);


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);


// @route   POST api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', forgotPassword);


// @route   POST api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', resetPassword);


// ============================================
// Google OAuth 2.0 / OpenID Connect
// ============================================

// @route   GET api/auth/google
// @desc    Start Google OAuth authentication
// @access  Public
router.get('/google', googleLogin);


// @route   GET api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/google/callback', googleCallback);


// @route   POST api/auth/google/exchange
// @desc    Exchange one-time OAuth code for application token
// @access  Public
router.post('/google/exchange', exchangeOAuthCode);


module.exports = router;