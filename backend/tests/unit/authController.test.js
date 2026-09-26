const authController = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const RegistrationOTP = require('../../src/models/RegistrationOTP');
const Settings = require('../../src/models/Settings');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../src/models/User');
jest.mock('../../src/models/RegistrationOTP');
jest.mock('../../src/models/Settings');
jest.mock('../../src/services/emailService');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../src/utils/logger');

describe('Auth Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('initiateRegister', () => {
        test('should return 400 if email is missing', async () => {
            await authController.initiateRegister(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: "Email is required" }));
        });

        test('should bypass OTP if setting is disabled', async () => {
            req.body.email = 'test@example.com';
            Settings.findOne.mockResolvedValue({ isRegistrationOtpEnabled: false });
            jwt.sign.mockReturnValue('mockToken');

            await authController.initiateRegister(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ skipOtp: true, registerToken: 'mockToken' }));
        });
        test('should generate secure OTP and store otpHash when OTP is enabled', async () => {
            req.body.email = 'test@example.com';
            Settings.findOne.mockResolvedValue({ isRegistrationOtpEnabled: true });
            RegistrationOTP.findOneAndUpdate.mockResolvedValue({});

            await authController.initiateRegister(req, res);

            expect(RegistrationOTP.findOneAndUpdate).toHaveBeenCalledWith(
                { email: 'test@example.com' },
                expect.objectContaining({
                    email: 'test@example.com',
                    otpHash: expect.any(String),
                    attempts: 0
                }),
                expect.any(Object)
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                msg: "OTP sent"
            }));
        });
    });

    describe('verifyRegisterOTP', () => {
        test('should return 400 if email or otp missing', async () => {
            req.body = { email: 'test@example.com' };
            await authController.verifyRegisterOTP(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Email and OTP are required' }));
        });

        test('should return 400 if record not found', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            RegistrationOTP.findOne.mockResolvedValue(null);

            await authController.verifyRegisterOTP(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Invalid or expired OTP' }));
        });

        test('should lock out and delete record if maximum attempts reached', async () => {
            req.body = { email: 'test@example.com', otp: '999999' };
            const mockRecord = {
                email: 'test@example.com',
                otpHash: 'dummyhash',
                attempts: 4,
                save: jest.fn()
            };
            RegistrationOTP.findOne.mockResolvedValue(mockRecord);
            RegistrationOTP.deleteOne.mockResolvedValue({});

            await authController.verifyRegisterOTP(req, res);

            expect(mockRecord.attempts).toBe(5);
            expect(RegistrationOTP.deleteOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                msg: 'Maximum verification attempts exceeded. Please request a new OTP.'
            }));
        });
    });

    describe('login', () => {
        test('should return 400 for invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Invalid Credentials' }));
        });

        test('should return 400 if user not verified', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            User.findOne.mockResolvedValue({
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false
            });
            bcrypt.compare.mockResolvedValue(true);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Please verify your email first' }));
        });
    });
});

