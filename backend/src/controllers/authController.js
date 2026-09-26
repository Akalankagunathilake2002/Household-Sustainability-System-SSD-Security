const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/emailService');

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const RegistrationOTP = require('../models/RegistrationOTP');
const Settings = require('../models/Settings');
const Roles = require('../utils/roles');

const logger = require("../utils/logger");

// ============================================
// Step 1: Initiate Registration
// ============================================

exports.initiateRegister = async (req, res) => {
    try {
        logger.info("Initiate register called");

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                msg: "Email is required"
            });
        }

        // Check Settings
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
            await settings.save();
        }

        // If OTP is disabled
        if (!settings.isRegistrationOtpEnabled) {
            logger.info(
                "OTP is disabled. Generating registerToken directly."
            );

            const registerToken = jwt.sign(
                { email },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            return res.json({
                success: true,
                msg: "OTP bypassed",
                email,
                registerToken,
                skipOtp: true
            });
        }

        const otp = generateOTP();

        // Security: Prevent sensitive data from being written to application logs.
        // Authentication credentials, OTPs, tokens, and sensitive request data must not be logged.
        logger.info("Registration OTP generated and sent");

        await RegistrationOTP.findOneAndUpdate(
            { email },
            { email, otp },
            {
                upsert: true,
                new: true
            }
        );

        sendEmail(
            email,
            "Verify your email",
            `Your OTP is ${otp}`
        );

        return res.json({
            success: true,
            msg: "OTP sent",
            email
        });

    } catch (err) {
        logger.error("Error in initiateRegister", err);

        // Security: Prevent internal error details from being exposed to clients.
        return res.status(500).json({
            success: false,
            message: "Failed to initiate registration"
        });
    }
};


// ============================================
// Step 2: Verify Registration OTP
// ============================================

exports.verifyRegisterOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Security: Prevent sensitive data from being written to application logs.
        // Do not log OTP values or email addresses.
        const record = await RegistrationOTP.findOne({ email });

        if (!record) {
            return res.status(400).json({
                msg: 'Invalid or expired OTP'
            });
        }

        if (record.otp !== otp) {
            return res.status(400).json({
                msg: 'Invalid or expired OTP'
            });
        }

        // Generate temporary registration token
        const registerToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            msg: 'OTP verified',
            registerToken
        });

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        // Detailed exception information must remain server-side; return only a safe generic message.
        logger.error("Error in verifyRegisterOTP", { error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// ============================================
// Step 3: Complete Registration
// ============================================

exports.completeRegister = async (req, res) => {
    try {
        const {
            registerToken,
            username,
            password,
            role,
            mobileNumber
        } = req.body;

        if (!registerToken) {
            return res.status(401).json({
                msg: 'No registration token provided'
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                registerToken,
                process.env.JWT_SECRET
            );
        } catch (err) {
            return res.status(401).json({
                msg: 'Invalid or expired registration session'
            });
        }

        const { email } = decoded;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                msg: 'User already exists'
            });
        }

        // ============================================
        // SECURITY FIX #1:
        // Prevent privilege escalation during registration
        // ============================================

        const settings = await Settings.findOne();

        const selfAssignableRoles = [
            Roles.USER,
            Roles.WASTE_COLLECTOR
        ];

        const assignedRole =
            settings &&
            settings.isRoleSelectionEnabled &&
            selfAssignableRoles.includes(role)
                ? role
                : Roles.USER;

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        user = new User({
            username,
            email,
            password: hashedPassword,
            role: assignedRole,
            mobileNumber,
            isVerified: true
        });

        await user.save();

        // Cleanup OTP
        await RegistrationOTP.deleteOne({ email });

        // Auto-login
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {

                if (err) {
                    throw err;
                }

                res.status(201).json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);

        res.status(500).send('Server error');
    }
};


// ============================================
// Verify OTP
// ============================================

exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                msg: 'User already verified'
            });
        }

        if (
            user.otp !== otp ||
            user.otpExpires < Date.now()
        ) {
            return res.status(400).json({
                msg: 'Invalid or expired OTP'
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {

                if (err) {
                    throw err;
                }

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);

        res.status(500).send('Server error');
    }
};


// ============================================
// Login
// ============================================

exports.login = async (req, res) => {

    // Security: Prevent sensitive data from being written to application logs.
    // Do not log login email addresses.

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                msg: 'Please provide email and password'
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid Credentials'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Invalid Credentials'
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                msg: 'Please verify your email first',
                userId: user._id
            });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Security: Prevent sensitive data from being written to application logs.
        // Do not log JWT payloads, tokens, or credential data.
        if (!process.env.JWT_SECRET) {
            logger.error("JWT_SECRET is not configured");
            throw new Error("JWT_SECRET is not defined");
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {

                if (err) {
                    // Security: Prevent internal error details from being exposed to clients.
                    logger.error("JWT sign error during login", { error: err.message });
                    return res.status(500).json({
                        msg: "Token generation failed"
                    });
                }

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        // Detailed exception information must remain server-side; return only a safe generic message.
        logger.error("Unhandled error in login", { error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// ============================================
// Forgot Password
// ============================================

exports.forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpires =
            Date.now() + 10 * 60 * 1000;

        await user.save();

        sendEmail(
            email,
            'Reset Password',
            `Your password reset OTP is ${otp}`
        );

        res.json({
            msg: 'OTP sent',
            userId: user._id
        });

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        logger.error("Error in forgotPassword", { error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// ============================================
// Reset Password
// ============================================

exports.resetPassword = async (req, res) => {
    try {

        const {
            userId,
            otp,
            newPassword
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        if (
            user.otp !== otp ||
            user.otpExpires < Date.now()
        ) {
            return res.status(400).json({
                msg: 'Invalid or expired OTP'
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            newPassword,
            salt
        );

        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.json({
            msg: 'Password reset successful'
        });

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        logger.error("Error in resetPassword", { error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// ============================================
// Get Current User
// ============================================

exports.getMe = async (req, res) => {
    try {

        const user = await User.findById(
            req.user.id
        ).select('-password');

        res.json(user);

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        logger.error("Error in getMe", { userId: req.user?.id, error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// ============================================
// Update Profile
// ============================================

exports.updateProfile = async (req, res) => {
    try {

        const {
            username,
            mobileNumber
        } = req.body;

        const userFields = {};

        if (username) {
            userFields.username = username;
        }

        if (mobileNumber !== undefined) {
            userFields.mobileNumber = mobileNumber;
        }

        let user = await User.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);

    } catch (err) {
        // Security: Prevent internal error details from being exposed to clients.
        logger.error("Error in updateProfile", { userId: req.user?.id, error: err.message });
        res.status(500).json({ msg: 'Internal server error' });
    }
};