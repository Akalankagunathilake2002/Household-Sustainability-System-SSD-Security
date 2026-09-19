import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle, ShieldCheck, Phone } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Steps: 1 = Email, 2 = OTP, 3 = Details
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [registerToken, setRegisterToken] = useState('');
    const [details, setDetails] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        mobileNumber: ''
    });

    const [settings, setSettings] = useState({ isRoleSelectionEnabled: false });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.SETTINGS);
                setSettings(res.data);
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        fetchSettings();
    }, []);

    // Step 1: Initiate Registration
    const handleInitiate = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.AUTH.REGISTER_INITIATE, { email });
            if (res.data.skipOtp) {
                setRegisterToken(res.data.registerToken);
                setStep(3);
            } else {
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.AUTH.REGISTER_VERIFY, { email, otp });
            setRegisterToken(res.data.registerToken);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Complete Registration
    const handleComplete = async (e) => {
        e.preventDefault();
        setError('');

        if (details.password !== details.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post(API_ENDPOINTS.AUTH.REGISTER_COMPLETE, {
                registerToken,
                username: details.username,
                password: details.password,
                role: details.role,
                mobileNumber: details.mobileNumber
            });

            // Auto Login
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? "Create Account" : step === 2 ? "Verify Email" : "Complete Profile"}
            subtitle={step === 1 ? "Start by entering your email" : step === 2 ? "Enter the code sent to your email" : "Set up your account details"}
            linkText={step === 1 ? "Already have an account?" : ""}
            linkPath={step === 1 ? "/login" : ""}
            linkActionText={step === 1 ? "Sign in" : ""}
        >
            {/* Progress Indicator */}
            <div className="flex justify-center mb-8 gap-2">
                <div className={`h-2 w-1/3 rounded-full transition-all ${step >= 1 ? 'bg-primary-teal' : 'bg-gray-200'}`}></div>
                {/* Condition: if we are at step 3 and we skipped step 2, we might want to hide it or just show it as filled */}
                <div className={`h-2 w-1/3 rounded-full transition-all ${step >= 2 ? 'bg-primary-teal' : 'bg-gray-200'}`}></div>
                <div className={`h-2 w-1/3 rounded-full transition-all ${step >= 3 ? 'bg-primary-teal' : 'bg-gray-200'}`}></div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
                <form onSubmit={handleInitiate}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2 text-forest-dark">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-white text-text-main text-base transition-all focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-forest-dark text-white font-semibold rounded-xl text-base transition-all hover:bg-deep-eco hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Sending Code...' : 'Continue'}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
                <form onSubmit={handleVerifyOTP}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2 text-forest-dark">One-Time Password</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-white text-text-main text-base transition-all focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10 tracking-widest font-mono text-lg"
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-2 text-right cursor-pointer hover:text-primary-teal" onClick={() => setStep(1)}>Wrong email?</p>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-forest-dark text-white font-semibold rounded-xl text-base transition-all hover:bg-deep-eco hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                        {!isLoading && <CheckCircle size={20} />}
                    </button>
                </form>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <form onSubmit={handleComplete}>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1.5 text-forest-dark">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={details.username}
                                onChange={(e) => setDetails({ ...details, username: e.target.value })}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1.5 text-forest-dark">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="password"
                                placeholder="Create password"
                                value={details.password}
                                onChange={(e) => setDetails({ ...details, password: e.target.value })}
                                required
                                minLength={6}
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1.5 text-forest-dark">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={details.confirmPassword}
                                onChange={(e) => setDetails({ ...details, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1.5 text-forest-dark">Mobile Number (Optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                type="text"
                                placeholder="e.g. +1234567890"
                                value={details.mobileNumber}
                                onChange={(e) => setDetails({ ...details, mobileNumber: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    {(settings.isRoleSelectionEnabled || user?.role === 'admin') && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-1.5 text-forest-dark">Role</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-text-muted" size={20} />
                                <select
                                    value={details.role}
                                    onChange={(e) => setDetails({ ...details, role: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10 appearance-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="waste_collector">Waste Collector</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-forest-dark text-white font-semibold rounded-xl text-base transition-all hover:bg-deep-eco hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default Register;
