import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, RefreshCw, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const CollectorDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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

    useEffect(() => {
        fetchRequests();
        fetchBins();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`${API_ENDPOINTS.WASTE.BASE}/${id}`, { status: newStatus });
            setRequests(requests.map(req => req._id === id ? { ...req, status: newStatus } : req));
            fetchBins();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const handleBinStatusUpdate = async (binId, newStatus) => {
        try {
            await api.put(`${API_ENDPOINTS.WASTE.BIN_STATUS}/${binId}/status`, { status: newStatus });
            setBins(bins.map(bin => bin._id === binId ? { ...bin, status: newStatus } : bin));
        } catch (err) {
            console.error('Error updating bin status:', err);
            alert('Failed to update bin status');
        }
    };

    const binIcon = (status) => new L.Icon({
        iconUrl: status === 'full'
            ? 'https://img.icons8.com/material-rounded/96/fa314a/trash.png'
            : status === 'partially_full'
                ? 'https://img.icons8.com/material-rounded/96/facc15/trash.png'
                : 'https://img.icons8.com/material-rounded/96/000000/trash.png',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
    });

    const filteredRequests = requests.filter(req => filter === 'all' ? true : req.status === filter);

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="px-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Collector Dashboard</h1>
                <p className="text-sm md:text-base text-slate-500 mt-1">Manage waste collection and track bin status.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
                <div className="bg-white rounded-[1.5rem] p-4 shadow-sm glass h-[350px] md:h-[500px] relative overflow-hidden border border-border">
                    <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {bins.map(bin => (
                            <Marker key={bin._id} position={[bin.latitude, bin.longitude]} icon={binIcon(bin.status)}>
                                <Popup>
                                    <div className="p-1">
                                        <h4 className="font-bold text-forest-dark">{bin.name}</h4>
                                        <p className="text-xs text-text-muted mb-2">Status: <span className="font-semibold uppercase">{bin.status}</span></p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleBinStatusUpdate(bin._id, 'empty')}
                                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold"
                                            >
                                                Mark Empty
                                            </button>
                                            <button
                                                onClick={() => handleBinStatusUpdate(bin._id, 'full')}
                                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold"
                                            >
                                                Mark Full
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass border border-border flex flex-col h-[400px] md:h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Pickup Requests</h3>
                        <button onClick={fetchRequests} className="text-text-muted hover:text-primary-teal transition-colors">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                        {['all', 'pending', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-primary-teal text-white' : 'bg-off-white text-text-muted hover:bg-gray-100'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-3">
                        {loading ? (
                            <div className="text-center py-10 text-text-muted">Loading...</div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-10 text-text-muted">No requests found.</div>
                        ) : (
                            filteredRequests.map(req => (
                                <div key={req._id} className="p-3 rounded-xl border border-border bg-off-white/30 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm">{req.user?.username || 'User'}</p>
                                            <p className="text-[10px] text-text-muted">{new Date(req.date).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
                                            <div className={`h-full ${req.binLevel > 75 ? 'bg-red-500' : 'bg-primary-teal'}`} style={{ width: `${req.binLevel}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold">{req.binLevel}%</span>
                                    </div>
                                    {req.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(req._id, 'completed')}
                                            className="w-full py-1.5 bg-primary-teal text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Mark Collected
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectorDashboard;
