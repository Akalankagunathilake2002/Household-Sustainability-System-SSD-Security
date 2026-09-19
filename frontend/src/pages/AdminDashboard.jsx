import React from 'react';
import {
    Users,
    MapPin,
    TrendingUp,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Settings as SettingsIcon,
    Shield
} from 'lucide-react';

import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend);

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ username: '', email: '', role: '' });
    const [settings, setSettings] = useState({ isRegistrationOtpEnabled: true, isRoleSelectionEnabled: false });
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [activeRole, setActiveRole] = useState('all');

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await api.get(API_ENDPOINTS.ADMIN.USERS);
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await api.get(API_ENDPOINTS.SETTINGS);
            setSettings(res.data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleToggleOtp = async () => {
        try {
            const newStatus = !settings.isRegistrationOtpEnabled;
            const res = await api.put(API_ENDPOINTS.SETTINGS, { isRegistrationOtpEnabled: newStatus });
            setSettings(res.data);
            alert(`Registration OTP ${newStatus ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            console.error('Error updating settings:', err);
            alert('Failed to update settings');
        }
    };

    const handleToggleRoleSelection = async () => {
        try {
            const newStatus = !settings.isRoleSelectionEnabled;
            const res = await api.put(API_ENDPOINTS.SETTINGS, { isRoleSelectionEnabled: newStatus });
            setSettings(res.data);
            alert(`Role selection ${newStatus ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            console.error('Error updating settings:', err);
            alert('Failed to update settings');
        }
    };



    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('Failed to delete user');
            }
        }
    };

    const startEditUser = (user) => {
        setEditingUser(user);
        setEditFormData({ username: user.username, email: user.email, role: user.role });
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditFormData({ username: '', email: '', role: '' });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${editingUser._id}`, editFormData);
            setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...res.data.user } : u));
            setEditingUser(null);
            alert('User updated successfully');
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSettings();
    }, []);

    const pieData = {
        labels: ['Active', 'Pending', 'Suspended'],
        datasets: [{
            data: [350, 45, 12],
            backgroundColor: ['#0ea5a4', '#facc15', '#ff5f56'],
            borderWidth: 0
        }]
    };

    const barData = {
        labels: ['North', 'South', 'East', 'West', 'Central'],
        datasets: [{
            label: 'Sustainability Index by Region',
            data: [78, 82, 65, 89, 72],
            backgroundColor: '#12372a',
            borderRadius: 6
        }]
    };



    if (loadingUsers) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-off-white">
                <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-4">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Control Center</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">System-wide monitoring and oversight.</p>
                </div>
                <div className="w-full md:w-auto px-1">
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                        <Download size={18} className="text-primary-teal" />
                        Export Reports
                    </button>
                </div>
            </header>

            <section className="flex flex-col gap-6 md:gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 flex items-center gap-5 bg-white rounded-[1.25rem] shadow-sm glass"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-teal-soft-bg"><Users className="text-primary-teal" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-text-muted block mb-1">Total Users</span>
                            <strong className="text-2xl text-forest-dark">{users.length}</strong>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg bg-pale-green text-green-800">+5%</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 flex items-center gap-5 bg-white rounded-[1.25rem] shadow-sm glass"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-soft-yellow-bg"><TrendingUp className="text-warm-yellow" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-text-muted block mb-1">Total CO2 Reduced</span>
                            <strong className="text-2xl text-forest-dark">42.8 Tons</strong>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg bg-pale-green text-green-800">+18%</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 flex items-center gap-5 bg-white rounded-[1.25rem] shadow-sm glass"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#fee2e2]"><AlertTriangle className="text-[#ef4444]" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-text-muted block mb-1">System Alerts</span>
                            <strong className="text-2xl text-forest-dark">3 Active</strong>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                        <h3 className="text-lg font-semibold mb-6">Community Growth</h3>
                        <div className="h-[300px]">
                            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                        <h3 className="text-lg font-semibold mb-6">User Status</h3>
                        <div className="h-[300px]">
                            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold">User Management</h3>
                            <p className="text-xs text-text-muted mt-1">Manage system access and permissions</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 bg-off-white p-1 rounded-xl border border-border w-full lg:w-auto">
                            {['all', 'user', 'admin', 'waste_collector'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setActiveRole(role)}
                                    className={`flex-1 lg:flex-none px-3 md:px-4 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all ${activeRole === role
                                        ? 'bg-white text-primary-teal shadow-sm border border-border/50'
                                        : 'text-text-muted hover:text-text-main'
                                        }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchUsers} className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-off-white border border-border rounded-xl font-bold text-sm text-text-main hover:bg-gray-100 transition-colors">Refresh List</button>
                    </div>
                    {loadingUsers ? (
                        <div className="text-center py-10">Loading users...</div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6 pb-2">
                            <table className="w-full border-collapse min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">User</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Role</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Email</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users
                                        .filter(u => activeRole === 'all' || u.role === activeRole)
                                        .map((u) => (
                                            <tr key={u._id}>
                                                <td className="p-4 border-b border-border">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-teal-soft-bg text-primary-teal rounded-full flex items-center justify-center font-bold">{u.username.charAt(0).toUpperCase()}</div>
                                                        <strong className="block text-sm text-text-main">{u.username}</strong>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-b border-border">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{u.role}</span>
                                                </td>
                                                <td className="p-4 border-b border-border text-sm text-text-muted">
                                                    {u.email}
                                                </td>
                                                <td className="p-4 border-b border-border">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startEditUser(u)} className="text-blue-500 hover:text-blue-700 font-medium text-sm">Edit</button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <SettingsIcon size={20} className="text-primary-teal" />
                        System Settings
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-off-white rounded-xl border border-border">
                            <div>
                                <strong className="block text-sm text-text-main font-bold">Email OTP for Registration</strong>
                                <p className="text-xs text-text-muted mt-1">If disabled, users can complete registration immediately after entering their email.</p>
                            </div>
                            <button
                                onClick={handleToggleOtp}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent ring-offset-2 ${settings.isRegistrationOtpEnabled ? 'bg-primary-teal' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isRegistrationOtpEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-off-white rounded-xl border border-border">
                            <div>
                                <strong className="block text-sm text-text-main font-bold">Enable Role Selection</strong>
                                <p className="text-xs text-text-muted mt-1">If enabled, users can select their role (User/Admin) during registration. Otherwise, default is 'user'.</p>
                            </div>
                            <button
                                onClick={handleToggleRoleSelection}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent ring-offset-2 ${settings.isRoleSelectionEnabled ? 'bg-primary-teal' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isRoleSelectionEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

            </section>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        className="bg-white p-6 rounded-t-3xl sm:rounded-[2rem] w-full max-w-md shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Edit User Profile</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Username</label>
                                <input
                                    type="text"
                                    value={editFormData.username}
                                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Access Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Administrator</option>
                                    <option value="waste_collector">Waste Collector</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                                <button 
                                    type="button" 
                                    onClick={cancelEdit} 
                                    className="order-2 sm:order-1 px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="order-1 sm:order-2 px-8 py-3 bg-primary-teal text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-emerald-100"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
