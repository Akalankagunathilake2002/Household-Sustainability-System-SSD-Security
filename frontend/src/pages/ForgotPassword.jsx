import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { KeyRound, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            navigate('/reset-password', { state: { userId: res.data.userId, email } });
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-88px)] bg-off-white px-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white/20 relative overflow-hidden">
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-yellow-soft-bg rounded-2xl flex items-center justify-center mx-auto mb-4 text-warm-yellow">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-forest-dark mb-2">Forgot Password?</h1>
                    <p className="text-text-muted">Enter your email to receive a reset code.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3.5 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-teal to-forest-dark hover:opacity-90'
                            }`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Code'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
