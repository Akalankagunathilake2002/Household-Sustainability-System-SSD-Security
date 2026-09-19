import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userId = location.state?.userId;

    if (!userId) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { userId, otp });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-88px)] bg-off-white px-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white/20 relative overflow-hidden">
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-teal-soft-bg rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-teal">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-forest-dark mb-2">Verify Email</h1>
                    <p className="text-text-muted">Enter the 6-digit code sent to your email.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full px-4 py-3.5 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-all text-center text-2xl tracking-widest font-bold text-forest-dark"
                            maxLength="6"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-teal to-forest-dark hover:opacity-90'
                            }`}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                        {!loading && <CheckCircle size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
