const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const RegistrationOTP = require('../models/RegistrationOTP');
const Settings = require('../models/Settings');

// Step 1: Initiate Registration (Send OTP)
// exports.initiateRegister = async (req, res) => {
//     try {
//         const { email } = req.body;

//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }

//         const otp = generateOTP();

//         // Upsert OTP
//         await RegistrationOTP.findOneAndUpdate(
//             { email },
//             { email, otp },
//             { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         await sendEmail(email, 'Verify your email', `Your registration OTP is ${otp}. It expires in 10 minutes.`);

//         res.json({ msg: 'OTP sent to email', email });

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// };


const logger = require("../utils/logger");

exports.initiateRegister = async (req, res) => {
    try {
        logger.info("Initiate register called");
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        // Check Settings
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }

        if (!settings.isRegistrationOtpEnabled) {
            logger.info("OTP is disabled. Generating registerToken directly.");
            const registerToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
            return res.json({ success: true, msg: "OTP bypassed", email, registerToken, skipOtp: true });
        }

        const otp = generateOTP();
        logger.info(`Generated OTP: ${otp}`);

        await RegistrationOTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        );

        sendEmail(email, "Verify your email", `Your OTP is ${otp}`);

        return res.json({ success: true, msg: "OTP sent", email });

    } catch (err) {
        logger.error("Error in initiateRegister", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Step 2: Verify OTP
exports.verifyRegisterOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(`Verifying OTP for ${email}: ${otp}`);
        const record = await RegistrationOTP.findOne({ email });

        if (!record) {
            console.log(`No OTP record found for ${email}`);
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        if (record.otp !== otp) {
            console.log(`OTP mismatch for ${email}. Expected: ${record.otp}, Received: ${otp}`);
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // Generate a temporary token for the next step (valid for 15 mins)
        const registerToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ msg: 'OTP verified', registerToken });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Step 3: Complete Registration
exports.completeRegister = async (req, res) => {
    try {
        const { registerToken, username, password, role, mobileNumber } = req.body;

        if (!registerToken) {
            return res.status(401).json({ msg: 'No registration token provided' });
        }

        let decoded;
        try {
            decoded = jwt.verify(registerToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ msg: 'Invalid or expired registration session' });
        }

        const { email } = decoded;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            mobileNumber,
            isVerified: true // Email verified via OTP in Step 2
        });

        await user.save();
        await RegistrationOTP.deleteOne({ email }); // Cleanup

        // Auto-login
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    console.log("Login attempt received for email:", req.body.email);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("Missing credentials");
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log("User found, comparing password...");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch for:", email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log("Password matched, checking verification...");

        if (!user.isVerified) {
            console.log("User not verified:", email);
            return res.status(400).json({ msg: 'Please verify your email first', userId: user._id });
        }
        console.log("User verified, generating token...");

        const payload = { user: { id: user.id, role: user.role } };
        console.log("Payload created:", payload);

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables!");
            throw new Error("JWT_SECRET is not defined");
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) {
                console.error("JWT Sign Error:", err);
                return res.status(500).json({ msg: "Token generation failed" });
            }
            console.log("Token generated successfully");
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        });

    } catch (err) {
        console.error("UNHANDLED LOGIN EXCEPTION:", err);
        res.status(500).send('Server error');
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        sendEmail(email, 'Reset Password', `Your password reset OTP is ${otp}`);

        res.json({ msg: 'OTP sent to email', userId: user._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: 'Password reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, mobileNumber } = req.body;
        const userFields = {};
        if (username) userFields.username = username;
        if (mobileNumber !== undefined) userFields.mobileNumber = mobileNumber;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
