import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, Filter, RefreshCw, Trash2, MapPin, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const AdminWaste = () => {
    const [requests, setRequests] = useState([]);
    const [bins, setBins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests'); // requests, bins
    const [filter, setFilter] = useState('all');

    // New Bin Form State
    const [newBin, setNewBin] = useState({ name: '', user: '', latitude: 6.9271, longitude: 79.8612 });
    const [isAddingBin, setIsAddingBin] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_ENDPOINTS.WASTE.ALL);
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBins = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.WASTE.BINS);
            setBins(res.data);
        } catch (err) {
            console.error('Error fetching bins:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.ADMIN.USERS);
            setUsers(res.data);
            if (res.data.length > 0 && !newBin.user) {
                setNewBin(prev => ({ ...prev, user: res.data[0]._id }));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchBins();
        fetchUsers();
    }, []);

    const handleCreateBin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(API_ENDPOINTS.WASTE.BINS, newBin);
            setBins([...bins, res.data]);
            setIsAddingBin(false);
            setNewBin({ name: '', user: users[0]?._id, latitude: 6.9271, longitude: 79.8612 });
            alert('Bin assigned successfully');
            fetchBins(); // Refresh to get populated user
        } catch (err) {
            console.error('Error creating bin:', err);
            alert('Failed to assign bin');
        }
    };

    const handleDeleteBin = async (id) => {
        if (window.confirm('Are you sure you want to remove this bin?')) {
            try {
                await api.delete(`${API_ENDPOINTS.WASTE.BINS}/${id}`);
                setBins(bins.filter(b => b._id !== id));
            } catch (err) {
                console.error('Error deleting bin:', err);
                alert('Failed to remove bin');
            }
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (isAddingBin) {
                    setNewBin(prev => ({
                        ...prev,
                        latitude: e.latlng.lat,
                        longitude: e.latlng.lng
                    }));
                }
            },
        });
        return null;
    };

    // Custom marker icon: Black Trash Bin
    const binIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/material-rounded/96/000000/trash.png',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
    });

    // Custom marker icon: Red Trash Bin (Pending)
    const pendingBinIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/material-rounded/96/fa314a/trash.png',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`${API_ENDPOINTS.WASTE.BY_ID}/${id}`, { status: newStatus });
            // Optimistic update
            setRequests(requests.map(req =>
                req._id === id ? { ...req, status: newStatus } : req
            ));
            fetchBins(); // Refresh map icons
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
            fetchRequests(); // Revert on failure
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Waste Management</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Manage requests and bin assignments.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto px-1">
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-primary-teal text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('bins')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bins' ? 'bg-primary-teal text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Bins
                        </button>
                    </div>
                </div>
            </header>

            {activeTab === 'requests' ? (
                <>
                    <div className="flex flex-wrap justify-end gap-3 mb-2">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-border order-2 md:order-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-off-white text-text-main shadow-sm' : 'text-text-muted hover:bg-gray-50'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'pending' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-text-muted hover:bg-gray-50'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'completed' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-text-muted hover:bg-gray-50'}`}
                            >
                                Completed
                            </button>
                        </div>
                        <button onClick={fetchRequests} className="order-1 md:order-2 p-2 bg-white border border-border rounded-xl hover:bg-off-white transition-colors shadow-sm text-text-muted">
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-4 md:p-6 shadow-sm glass pb-24 md:pb-6">
                        {loading ? (
                            <div className="text-center py-20 text-text-muted">Loading requests...</div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                                <table className="w-full border-collapse min-w-[800px]">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">User</th>
                                            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Requested Time</th>
                                            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Bin Level</th>
                                            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Status</th>
                                            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((req) => (
                                            <tr key={req._id} className="hover:bg-off-white/50 transition-colors">
                                                <td className="p-4 border-b border-border">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                            {req.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <span className="text-sm font-medium">{req.user?.username || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-b border-border text-sm text-text-muted">
                                                    {new Date(req.date).toLocaleString()}
                                                </td>
                                                <td className="p-4 border-b border-border">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${req.binLevel > 75 ? 'bg-red-500' : req.binLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                style={{ width: `${req.binLevel}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-medium">{req.binLevel}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-b border-border">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${req.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {req.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 border-b border-border">
                                                    {req.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(req._id, 'completed')}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-teal text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Mark Done
                                                        </button>
                                                    )}
                                                    {req.status === 'completed' && (
                                                        <button
                                                            disabled
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium cursor-not-allowed"
                                                        >
                                                            Completed
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 pb-24 md:pb-0">
                    <div className="bg-white rounded-[1.5rem] p-2 md:p-4 shadow-sm glass h-[400px] md:h-[600px] relative overflow-hidden">
                        <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClickHandler />

                            {bins.map(bin => (
                                <Marker
                                    key={bin._id}
                                    position={[bin.latitude, bin.longitude]}
                                    icon={bin.hasPendingRequest ? pendingBinIcon : binIcon}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <h4 className="font-bold text-forest-dark">{bin.name}</h4>
                                            <p className="text-xs text-text-muted mb-1">Assigned to: {bin.user?.username}</p>
                                            {bin.hasPendingRequest && (
                                                <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold mb-2 animate-pulse">
                                                    <Clock size={10} /> PICKUP REQUESTED
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDeleteBin(bin._id)}
                                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                <Trash2 size={12} /> Remove Bin
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {isAddingBin && (
                                <Marker position={[newBin.latitude, newBin.longitude]} icon={binIcon}>
                                    <Popup>New Bin Location</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                        {!isAddingBin && (
                            <button
                                onClick={() => setIsAddingBin(true)}
                                className="absolute bottom-8 right-8 z-[1000] flex items-center gap-2 px-6 py-3 bg-primary-teal text-white rounded-xl font-bold shadow-xl hover:bg-teal-700 transition-all scale-110"
                            >
                                <Plus size={20} /> Add New Bin
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        {isAddingBin && (
                            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border-2 border-primary-teal/20 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary-teal">
                                    <MapPin size={20} /> Assign New Bin
                                </h3>
                                <p className="text-xs text-text-muted mb-6">Click on the map to set location, then fill details below.</p>

                                <form onSubmit={handleCreateBin} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Bin Name / ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBin.name}
                                            onChange={e => setNewBin({ ...newBin, name: e.target.value })}
                                            placeholder="e.g. Household Bin 01"
                                            className="w-full px-4 py-3 bg-off-white border border-border rounded-xl focus:outline-none focus:border-primary-teal transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Assign to User</label>
                                        <select
                                            required
                                            value={newBin.user}
                                            onChange={e => setNewBin({ ...newBin, user: e.target.value })}
                                            className="w-full px-4 py-3 bg-off-white border border-border rounded-xl focus:outline-none focus:border-primary-teal transition-all appearance-none"
                                        >
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Lat</label>
                                            <input type="text" readOnly value={newBin.latitude.toFixed(4)} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-xs" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Lng</label>
                                            <input type="text" readOnly value={newBin.longitude.toFixed(4)} className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingBin(false)}
                                            className="flex-1 py-3 border border-border rounded-xl font-bold text-text-muted hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-primary-teal text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg"
                                        >
                                            Assign Bin
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-lg font-bold mb-4">Current Assignments</h3>
                            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {bins.length === 0 ? (
                                    <div className="py-10 text-center text-text-muted text-sm">No bins assigned yet.</div>
                                ) : (
                                    bins.map(bin => (
                                        <div key={bin._id} className="p-3 rounded-xl border border-border bg-off-white/30 hover:bg-white hover:shadow-sm transition-all flex justify-between items-center group">
                                            <div>
                                                <p className="font-bold text-sm text-forest-dark">{bin.name}</p>
                                                <p className="text-xs text-text-muted">User: {bin.user?.username}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteBin(bin._id)}
                                                className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWaste;
