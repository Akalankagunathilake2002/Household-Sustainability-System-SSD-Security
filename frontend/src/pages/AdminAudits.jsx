import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FileText, Download } from 'lucide-react';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';

const AdminAudits = () => {
    const { user } = useAuth();
    const [audits, setAudits] = useState([]);
    const [loadingAudits, setLoadingAudits] = useState(true);

    const fetchAllAudits = async () => {
        setLoadingAudits(true);
        try {
            const res = await api.get(API_ENDPOINTS.AUDIT.ALL);
            setAudits(res.data);
        } catch (err) {
            console.error('Error fetching all audits:', err);
        } finally {
            setLoadingAudits(false);
        }
    };

    useEffect(() => {
        fetchAllAudits();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Audit Logs</h1>
                    <p className="text-sm md:text-base text-text-muted">Review all sustainability audits submitted by users.</p>
                </div>
                <button onClick={fetchAllAudits} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl font-medium text-sm text-text-main hover:bg-off-white transition-colors shadow-sm w-full md:w-auto justify-center">
                    <FileText size={16} />
                    Refresh List
                </button>
            </header>

            <section>
                <div className="bg-white rounded-[1.5rem] p-4 md:p-6 shadow-sm glass pb-24 md:pb-6">
                    {loadingAudits ? (
                        <div className="text-center py-10">Loading audits...</div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                            <table className="w-full border-collapse min-w-[900px]">
 pockets
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">User</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Date</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Sustainability %</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Env Score</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audits.map((audit) => (
                                        <tr key={audit._id}>
                                            <td className="p-4 border-b border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                        {audit.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="text-sm font-medium">{audit.user?.username || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-border text-sm text-text-muted">
                                                {new Date(audit.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 border-b border-border">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${audit.overallSustainabilityPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                                    audit.overallSustainabilityPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {audit.overallSustainabilityPercentage ? `${audit.overallSustainabilityPercentage}%` : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b border-border">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${audit.environmentalScore >= 80 ? 'bg-green-100 text-green-800' :
                                                    audit.environmentalScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {audit.environmentalScore ?? 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b border-border text-sm text-text-muted">
                                                <span className="text-xs">
                                                    Env: {Object.values(audit.environmental).filter(Boolean).length} |
                                                    Soc: {Object.values(audit.social).filter(Boolean).length} |
                                                    Eco: {Object.values(audit.economic).filter(Boolean).length}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminAudits;
