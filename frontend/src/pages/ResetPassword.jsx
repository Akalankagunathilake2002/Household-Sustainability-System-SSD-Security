import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userId = location.state?.userId;

    if (!userId) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { userId, otp, newPassword });
            alert('Password reset successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-88px)] bg-off-white px-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white/20 relative overflow-hidden">
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-teal-soft-bg rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-teal">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-forest-dark mb-2">Reset Password</h1>
                    <p className="text-text-muted">Enter the code and your new password.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full px-4 py-3.5 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-all"
                            maxLength="6"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-all"
                            required
                            minLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-teal to-forest-dark hover:opacity-90'
                            }`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                        {!loading && <CheckCircle size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
