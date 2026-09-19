import React, { useState, useEffect } from 'react';
import SmartBin from '../components/SmartBin';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { Truck, AlertTriangle, CheckCircle, Clock, Recycle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserWaste = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [bin, setBin] = useState(null);
    const [binLevel, setBinLevel] = useState(0);
    const [loading, setLoading] = useState(false);

    const binIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/material-rounded/96/000000/trash.png',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
    });

    const pendingBinIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/material-rounded/96/fa314a/trash.png',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
    });

    // Simulate bin level changes randomly for demonstration
    useEffect(() => {
        const interval = setInterval(() => {
            setBinLevel(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                const newLevel = Math.max(0, Math.min(100, prev + change));
                return newLevel;
            });
        }, 3000);

        // Initial random level
        setBinLevel(Math.floor(Math.random() * 60) + 20);

        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.WASTE.BASE);
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const fetchBin = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.WASTE.MY_BIN);
            setBin(res.data);
        } catch (err) {
            console.error('Error fetching bin:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchBin();
    }, []);

    const handleRequestPickup = async () => {
        setLoading(true);
        try {
            await api.post(API_ENDPOINTS.WASTE.BASE, { binLevel });
            fetchRequests();
            fetchBin(); // Refresh map icon to red
            alert('Pickup requested successfully!');
        } catch (err) {
            console.error('Error requesting pickup:', err);
            alert('Failed to request pickup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="px-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Smart Waste Management</h1>
                <p className="text-sm md:text-base text-slate-500 mt-1">Monitor bin levels and coordinate pickups.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-20 md:pb-0">
                {/* Smart Bin Section */}
                <div className="bg-white rounded-[1.5rem] p-5 md:p-8 shadow-sm glass flex flex-col items-center justify-center text-center">
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
                        <h2 className="text-lg md:text-xl font-semibold">Live Bin Status</h2>
                        {bin && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-soft-bg text-primary-teal text-[11px] font-bold rounded-full border border-primary-teal/20">
                                <Recycle size={12} /> {bin.name}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full border-b border-border pb-8 mb-8">
                        <div className="flex flex-col items-center justify-center">
                            <SmartBin level={binLevel} />
                        </div>
                        <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-border shadow-inner">
                            {bin ? (
                                <MapContainer center={[bin.latitude, bin.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[bin.latitude, bin.longitude]} icon={bin.hasPendingRequest ? pendingBinIcon : binIcon}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold">{bin.name}</p>
                                                {bin.hasPendingRequest && <p className="text-[10px] text-red-500 font-bold animate-pulse">PICKUP PENDING</p>}
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="h-full w-full bg-off-white flex flex-col items-center justify-center text-text-muted p-4">
                                    <MapPin size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm">No bin location assigned by admin.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 w-full max-w-xs">
                        <div className="flex justify-between text-sm text-text-muted mb-2">
                            <span>Current Level</span>
                            <span className="font-bold">{binLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                            <div className="bg-primary-teal h-2.5 rounded-full" style={{ width: `${binLevel}%` }}></div>
                        </div>

                        <button
                            onClick={handleRequestPickup}
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${binLevel > 70
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse'
                                : 'bg-primary-teal hover:bg-teal-700 shadow-primary-teal/20'
                                }`}
                        >
                            <Truck size={20} />
                            {loading ? 'Requesting...' : 'Request Cleanup'}
                        </button>
                        {binLevel > 80 && (
                            <p className="text-red-500 text-sm mt-3 flex items-center justify-center gap-1">
                                <AlertTriangle size={14} /> Bin is almost full! Request pickup soon.
                            </p>
                        )}
                    </div>
                </div>

                {/* Request History Section */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass flex flex-col">
                    <h3 className="text-xl font-semibold mb-6">Pickup History</h3>

                    {requests.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10">
                            <Truck size={48} className="mb-4 opacity-20" />
                            <p>No pickup requests yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                {requests.map((req) => (
                                    <div key={req._id} className="p-4 rounded-xl border border-border bg-off-white/30 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {req.status === 'completed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-text-main">Waste Pickup</p>
                                                <p className="text-xs text-text-muted">{new Date(req.date).toLocaleDateString()} at {new Date(req.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${req.status === 'completed' ? 'bg-green-100/50 text-green-700' : 'bg-yellow-100/50 text-yellow-700'
                                                }`}>
                                                {req.status}
                                            </span>
                                            <p className="text-xs text-text-muted mt-1">Level: {req.binLevel}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserWaste;
