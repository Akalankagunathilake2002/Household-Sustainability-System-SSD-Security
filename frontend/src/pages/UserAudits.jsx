import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import AuditForm from '../components/AuditForm';
import ScoreLoadingOverlay from '../components/ScoreLoadingOverlay';
import AuditSuccessModal from '../components/AuditSuccessModal';
import { useAuth } from '../context/AuthContext';

const UserAudits = () => {
    const { user } = useAuth();
    const [audits, setAudits] = useState([]);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [editingAudit, setEditingAudit] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastScores, setLastScores] = useState({ score: 0, envScore: 0 });

    const fetchAudits = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.AUDIT.BASE);
            setAudits(res.data);
        } catch (err) {
            console.error('Error fetching audits:', err);
        }
    };

    useEffect(() => {
        fetchAudits();
    }, []);

    const handleSaveAudit = async (formData) => {
        try {
            let res;
            if (editingAudit) {
                res = await api.put(`${API_ENDPOINTS.AUDIT.BY_ID}/${editingAudit._id}`, formData);
            } else {
                res = await api.post(API_ENDPOINTS.AUDIT.BASE, formData);
            }
            
            // Show loading if it's a new audit
            if (!editingAudit) {
                setIsGenerating(true);
                setIsAuditModalOpen(false);
                
                // Simulate generation delay
                setTimeout(() => {
                    setIsGenerating(false);
                    setLastScores({
                        score: res.data.overallSustainabilityPercentage,
                        envScore: res.data.environmentalScore
                    });
                    setShowSuccess(true);
                    fetchAudits();
                }, 3000);
            } else {
                fetchAudits();
                setIsAuditModalOpen(false);
                setEditingAudit(null);
            }
        } catch (err) {
            console.error('Error saving audit:', err);
            alert('Failed to save audit');
        }
    };

    const handleDeleteAudit = async (id) => {
        if (window.confirm('Are you sure you want to delete this audit?')) {
            try {
                await api.delete(`${API_ENDPOINTS.AUDIT.BY_ID}/${id}`);
                fetchAudits();
            } catch (err) {
                console.error('Error deleting audit:', err);
                alert('Failed to delete audit');
            }
        }
    };

    const openNewAuditModal = () => {
        setEditingAudit(null);
        setIsAuditModalOpen(true);
    };

    const openEditAuditModal = (audit) => {
        setEditingAudit(audit);
        setIsAuditModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 px-1">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Audits</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Manage your sustainability audit history.</p>
                </div>
                <button
                    onClick={openNewAuditModal}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-teal text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all active:scale-95 w-full md:w-auto mt-2 md:mt-0"
                >
                    <Plus size={20} />
                    New Audit
                </button>
            </header>

            <section>
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass">
                    {audits.length === 0 ? (
                        <div className="text-center py-10 text-text-muted">
                            <p>You haven't performed any audits yet.</p>
                            <button onClick={openNewAuditModal} className="text-primary-teal font-semibold mt-2 hover:underline">Start your first audit</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Date</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Sustainability %</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Env Score</th>
                                        <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audits.map((audit) => (
                                        <tr key={audit._id} className="hover:bg-off-white/50 transition-colors">
                                            <td className="p-4 border-b border-border text-sm font-medium text-text-main">
                                                {new Date(audit.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 border-b border-border">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${audit.overallSustainabilityPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                                    audit.overallSustainabilityPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {audit.overallSustainabilityPercentage ? `${audit.overallSustainabilityPercentage}%` : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b border-border">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${audit.environmentalScore >= 80 ? 'bg-green-100 text-green-800' :
                                                    audit.environmentalScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {audit.environmentalScore ?? 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b border-border">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditAuditModal(audit)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAudit(audit._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <AuditForm
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                onSubmit={handleSaveAudit}
                initialData={editingAudit}
            />

            <ScoreLoadingOverlay isOpen={isGenerating} />
            
            <AuditSuccessModal 
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                score={lastScores.score}
                environmentalScore={lastScores.envScore}
            />
        </div>
    );
};

export default UserAudits;
