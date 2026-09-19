import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { User, Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        mobileNumber: user?.mobileNumber || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                mobileNumber: user.mobileNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.put(API_ENDPOINTS.AUTH.USER_PROFILE, formData);
            updateUser(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="px-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Profile</h1>
                <p className="text-sm md:text-base text-slate-500 mt-1">Manage your account and personal settings.</p>
            </header>

            <div className="max-w-2xl bg-white p-8 rounded-[1.5rem] shadow-sm glass">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-forest-dark pl-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 border border-border rounded-xl bg-gray-50 text-text-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-text-muted pl-1">Your email address cannot be changed.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-forest-dark pl-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                name="username"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-forest-dark pl-1">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-text-muted" size={20} />
                            <input
                                name="mobileNumber"
                                type="text"
                                placeholder="e.g. +1234567890"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-forest-dark text-white font-semibold rounded-xl transition-all hover:bg-deep-eco hover:shadow-lg disabled:opacity-70"
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
