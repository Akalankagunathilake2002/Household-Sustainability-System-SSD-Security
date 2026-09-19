import React from 'react';
import Sidebar from '../components/Sidebar';
import {
    Recycle,
    Trophy,
    ChevronUp,
    TrendingDown,
    Plus,
    Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';

const UserDashboard = () => {
    const { user } = useAuth();
    const [bin, setBin] = useState(null);

    useEffect(() => {
        const fetchBin = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.WASTE.MY_BIN);
                setBin(res.data);
            } catch (err) {
                console.error('Error fetching bin:', err);
            }
        };
        fetchBin();
    }, []);


    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Carbon Footprint (kg CO2)',
            data: [650, 590, 800, 810, 560, 550],
            fill: true,
            borderColor: '#0ea5a4',
            backgroundColor: 'rgba(14, 165, 164, 0.1)',
            tension: 0.4
        }]
    };

    const barData = {
        labels: ['Waste', 'Transport'],
        datasets: [{
            label: 'Current Month Usage',
            data: [12, 5],
            backgroundColor: [
                '#0f2e24',
                '#14b8a6'
            ],
            borderRadius: 8
        }]
    };

    const stats = [
        { label: 'Sustainability Score', value: `${user?.sustainabilityScore || 0}%`, icon: <Trophy color="#10b981" />, trend: 'Overall', color: 'teal' },
        { label: 'Waste Recycled', value: '85%', icon: <Recycle color="#0ea5a4" />, trend: '+5%', color: 'teal' }
    ];

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-4">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome, {user?.username}</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Sustainability goals for today.</p>
                </div>
                <div className="w-full md:w-auto px-1">
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                        <Calendar size={18} className="text-primary-teal" />
                        Last 30 Days
                    </button>
                </div>
            </header>

            <section className="flex flex-col gap-6 md:gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 flex items-center gap-5 bg-white rounded-[1.25rem] shadow-sm glass"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color === 'yellow' ? 'bg-soft-yellow-bg' : stat.color === 'teal' ? 'bg-teal-soft-bg' : 'bg-[#e0e7ff]'}`}>{stat.icon}</div>
                            <div className="flex-1">
                                <span className="text-sm text-text-muted block mb-1">{stat.label}</span>
                                <strong className="text-2xl text-forest-dark">{stat.value}</strong>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg bg-pale-green text-[#166534]">
                                <ChevronUp size={16} />
                                {stat.trend}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-1">Consumption Trends</h3>
                            <p className="text-sm text-text-muted">Monthly impact tracking</p>
                        </div>
                        <div className="h-[300px]">
                            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <WeatherWidget />
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass flex-1">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-semibold">Resource Breakdown</h3>
                                    {bin && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-soft-bg text-primary-teal text-[11px] font-bold rounded-full border border-primary-teal/20">
                                            <Recycle size={12} /> {bin.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-muted">Usage by category</p>
                            </div>
                            <div className="h-[200px]">
                                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy size={24} className="text-warm-yellow" />
                            <h3 className="text-lg font-semibold">Daily Sustainability Tip</h3>
                        </div>
                        <div>
                            <p className="text-lg italic text-text-main mb-6 leading-relaxed">"Switching to cold water for laundry can save up to 90% of a washing machine's energy use per load."</p>
                            <button className="text-primary-teal font-semibold underline bg-transparent">Learn More</button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                        <h3 className="text-lg font-semibold mb-6">Recent Achievements</h3>
                        <div className="flex flex-col gap-5 mt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-teal"></div>
                                <div className="flex-1">
                                    <strong className="block text-[15px]">Zero Waste Week</strong>
                                    <span className="text-[13px] text-text-muted">Completed 7 days of zero waste living</span>
                                </div>
                                <span className="text-xs text-text-muted">2d ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
};

export default UserDashboard;
