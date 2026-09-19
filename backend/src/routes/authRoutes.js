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

module.exports = router;
