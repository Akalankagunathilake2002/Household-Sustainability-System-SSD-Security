import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const AuditForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        environmental: {
            electricityUsage: 0,
            solarPanels: false,
            waterSavingTaps: false,
            wasteSeparation: false,
            waterUsage: 0
        },
        social: {
            communityParticipation: false,
            safeNeighborhood: false,
            publicTransportUsage: false
        },
        economic: {
            energyEfficientAppliances: false,
            budgetTracking: false,
            sustainableShopping: false
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                environmental: { ...initialData.environmental },
                social: { ...initialData.social },
                economic: { ...initialData.economic }
            });
        } else {
            // Reset form when opening for new entry
            setFormData({
                environmental: { electricityUsage: 0, solarPanels: false, waterSavingTaps: false, wasteSeparation: false, waterUsage: 0 },
                social: { communityParticipation: false, safeNeighborhood: false, publicTransportUsage: false },
                economic: { energyEfficientAppliances: false, budgetTracking: false, sustainableShopping: false }
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-forest-dark">
                        {initialData ? 'Update Audit' : 'New Sustainability Audit'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-off-white rounded-lg transition-colors">
                        <X size={24} className="text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Environmental Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-primary-teal mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-teal"></span> Environmental
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-text-main mb-1">Monthly Electricity Usage (kWh)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.environmental.electricityUsage}
                                    onChange={(e) => handleChange('environmental', 'electricityUsage', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Lower is better for the score
                                </p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-text-main mb-1">Monthly Water Usage (Liters)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.environmental.waterUsage}
                                    onChange={(e) => handleChange('environmental', 'waterUsage', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Lower is better for the score
                                </p>
                            </div>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.environmental.solarPanels}
                                    onChange={(e) => handleChange('environmental', 'solarPanels', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Solar Panels Installed</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.environmental.waterSavingTaps}
                                    onChange={(e) => handleChange('environmental', 'waterSavingTaps', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Water Saving Taps</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.environmental.wasteSeparation}
                                    onChange={(e) => handleChange('environmental', 'wasteSeparation', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Waste Separation</span>
                            </label>
                        </div>
                    </section>

                    <div className="border-t border-border"></div>

                    {/* Social Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-primary-teal mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warm-yellow"></span> Social
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.social.communityParticipation}
                                    onChange={(e) => handleChange('social', 'communityParticipation', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Community Participation</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.social.safeNeighborhood}
                                    onChange={(e) => handleChange('social', 'safeNeighborhood', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Safe Neighborhood</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.social.publicTransportUsage}
                                    onChange={(e) => handleChange('social', 'publicTransportUsage', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Public Transport Usage</span>
                            </label>
                        </div>
                    </section>

                    <div className="border-t border-border"></div>

                    {/* Economic Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-primary-teal mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Economic
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.economic.energyEfficientAppliances}
                                    onChange={(e) => handleChange('economic', 'energyEfficientAppliances', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Energy Efficient Appliances</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.economic.budgetTracking}
                                    onChange={(e) => handleChange('economic', 'budgetTracking', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Budget Tracking</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-off-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.economic.sustainableShopping}
                                    onChange={(e) => handleChange('economic', 'sustainableShopping', e.target.checked)}
                                    className="w-5 h-5 text-primary-teal rounded focus:ring-primary-teal"
                                />
                                <span className="text-sm font-medium">Sustainable Shopping</span>
                            </label>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-text-muted font-medium hover:bg-off-white rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-teal text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-primary-teal/20"
                        >
                            <Save size={18} />
                            {initialData ? 'Update Audit' : 'Submit Audit'}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default AuditForm;
