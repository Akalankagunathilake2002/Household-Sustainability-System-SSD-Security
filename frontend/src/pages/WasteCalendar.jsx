import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Trash2, Plus, Clock, Filter, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';

const WasteCalendar = () => {
    const { user } = useAuth();
    const canModify = user?.role === ROLES.ADMIN || user?.role === ROLES.COLLECTOR;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        type: 'General',
        area: ''
    });

    const types = ['General', 'Recyclable', 'Organic', 'Hazardous', 'E-Waste', 'Other'];

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_ENDPOINTS.WASTE.CALENDAR);
            setEvents(res.data);
        } catch (err) {
            console.error('Error fetching calendar events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleOpenModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                description: event.description || '',
                date: new Date(event.date).toISOString().split('T')[0],
                type: event.type,
                area: event.area
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                type: 'General',
                area: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await api.put(`${API_ENDPOINTS.WASTE.CALENDAR}/${editingEvent._id}`, formData);
            } else {
                await api.post(API_ENDPOINTS.WASTE.CALENDAR, formData);
            }
            fetchEvents();
            setShowModal(false);
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`${API_ENDPOINTS.WASTE.CALENDAR}/${id}`);
            fetchEvents();
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        // Prev month padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-border bg-off-white/20"></div>);
        }

        // Current month days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = new Date(year, month, d).toISOString().split('T')[0];
            const dayEvents = events.filter(e => new Date(e.date).toISOString().split('T')[0] === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div key={d} className={`h-32 border-b border-r border-border p-2 overflow-y-auto transition-colors hover:bg-off-white/30 ${isToday ? 'bg-primary-teal/5' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${isToday ? 'bg-primary-teal text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-text-muted'}`}>{d}</span>
                    </div>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div
                                key={event._id}
                                onClick={() => handleOpenModal(event)}
                                className={`text-[10px] p-1 rounded border cursor-pointer truncate ${event.type === 'Organic' ? 'bg-green-100 border-green-200 text-green-700' :
                                    event.type === 'Recyclable' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                                        event.type === 'Hazardous' ? 'bg-red-100 border-red-200 text-red-700' :
                                            event.type === 'E-Waste' ? 'bg-purple-100 border-purple-200 text-purple-700' :
                                                'bg-gray-100 border-gray-200 text-gray-700'
                                    }`}
                                title={`${event.title} - ${event.area}`}
                            >
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Collection Calendar</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Waste collection schedules in your area.</p>
                </div>
                {canModify && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary-teal text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Add Schedule
                    </button>
                )}
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                <div className="p-5 flex justify-between items-center bg-forest-dark text-white">
                    <h2 className="text-lg md:text-xl font-bold text-white">
                        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors text-white">Today</button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Grid View (Desktop) */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-7 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center py-3 border-b border-slate-100">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7">
                        {renderCalendar()}
                    </div>
                </div>

                {/* Agenda View (Mobile) */}
                <div className="md:hidden divide-y divide-slate-50">
                    {events.filter(e => {
                        const d = new Date(e.date);
                        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                    }).length > 0 ? (
                        events
                            .filter(e => {
                                const d = new Date(e.date);
                                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                            })
                            .sort((a,b) => new Date(a.date) - new Date(b.date))
                            .map(event => (
                                <div 
                                    key={event._id} 
                                    onClick={() => handleOpenModal(event)}
                                    className="p-4 flex items-start gap-4 active:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                            {new Date(event.date).toLocaleString('default', { weekday: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold text-slate-700">
                                            {new Date(event.date).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{event.title}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                            <MapPin size={12} className="text-slate-400" />
                                            <span className="truncate">{event.area}</span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        event.type === 'Organic' ? 'bg-green-100 text-green-700' :
                                        event.type === 'Recyclable' ? 'bg-blue-100 text-blue-700' :
                                        event.type === 'Hazardous' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {event.type}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="py-12 text-center px-6">
                            <CalendarIcon size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-sm text-slate-400 font-medium">No waste collection events scheduled for this month.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white rounded-t-3xl sm:rounded-[2rem] w-full max-w-lg p-6 md:p-10 shadow-2xl border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                                    {editingEvent ? (canModify ? 'Edit Schedule' : 'Event Details') : 'Add New Schedule'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 text-3xl">&times;</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1.5 text-slate-700 ml-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!canModify}
                                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all disabled:opacity-70"
                                        placeholder="e.g., Plastic Collection"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5 text-slate-700 ml-1">Collection Date</label>
                                        <input
                                            type="date"
                                            required
                                            disabled={!canModify}
                                            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all disabled:opacity-70"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5 text-slate-700 ml-1">Collection Type</label>
                                        <select
                                            disabled={!canModify}
                                            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all disabled:opacity-70"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5 text-slate-700 ml-1">Target Area</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!canModify}
                                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all disabled:opacity-70"
                                        placeholder="e.g., Sector 7"
                                        value={formData.area}
                                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5 text-slate-700 ml-1">Notes (Optional)</label>
                                    <textarea
                                        disabled={!canModify}
                                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all h-24 resize-none disabled:opacity-70"
                                        placeholder="Special instructions for residents..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                {canModify && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary-teal text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md shadow-emerald-100"
                                        >
                                            {editingEvent ? 'Update Schedule' : 'Create Schedule'}
                                        </button>
                                        {editingEvent && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(editingEvent._id)}
                                                className="bg-red-50 text-red-600 px-6 py-4 rounded-xl hover:bg-red-100 transition-all font-bold"
                                            >
                                                <Trash2 size={20} className="mx-auto" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WasteCalendar;
