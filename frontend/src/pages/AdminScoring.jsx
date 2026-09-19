import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
import { toast } from 'react-toastify';

const AdminScoring = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SCORING_CONFIG}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Ensure wastePickupPoints is present to avoid controlled/uncontrolled warning
            const data = res.data;
            if (typeof data.wastePickupPoints === 'undefined') data.wastePickupPoints = 10;
            setConfig(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch scoring configuration');
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        if (section === 'root') {
            setConfig({
                ...config,
                [field]: Number(value)
            });
        } else {
            setConfig({
                ...config,
                [section]: {
                    ...config[section],
                    [field]: Number(value)
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SCORING_CONFIG}`, config, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Scoring configuration updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update scoring configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading configuration...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Sustainability Scoring Management</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Environmental Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-green-700 flex items-center">
                        <span className="mr-2">🌱</span> Environmental Section
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-700">Electricity Usage</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500">Threshold 1 (kWh)</label>
                                    <input
                                        type="number"
                                        value={config.environmental.electricityUsageThreshold1}
                                        onChange={(e) => handleChange('environmental', 'electricityUsageThreshold1', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Points 1</label>
                                    <input
                                        type="number"
                                        value={config.environmental.electricityUsagePoints1}
                                        onChange={(e) => handleChange('environmental', 'electricityUsagePoints1', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Threshold 2 (kWh)</label>
                                    <input
                                        type="number"
                                        value={config.environmental.electricityUsageThreshold2}
                                        onChange={(e) => handleChange('environmental', 'electricityUsageThreshold2', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Points 2</label>
                                    <input
                                        type="number"
                                        value={config.environmental.electricityUsagePoints2}
                                        onChange={(e) => handleChange('environmental', 'electricityUsagePoints2', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-700">Water Usage</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500">Threshold 1 (L)</label>
                                    <input
                                        type="number"
                                        value={config.environmental.waterUsageThreshold1}
                                        onChange={(e) => handleChange('environmental', 'waterUsageThreshold1', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Points 1</label>
                                    <input
                                        type="number"
                                        value={config.environmental.waterUsagePoints1}
                                        onChange={(e) => handleChange('environmental', 'waterUsagePoints1', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Threshold 2 (L)</label>
                                    <input
                                        type="number"
                                        value={config.environmental.waterUsageThreshold2}
                                        onChange={(e) => handleChange('environmental', 'waterUsageThreshold2', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Points 2</label>
                                    <input
                                        type="number"
                                        value={config.environmental.waterUsagePoints2}
                                        onChange={(e) => handleChange('environmental', 'waterUsagePoints2', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <h3 className="font-medium text-gray-700 border-b pb-2">Boolean Features (Points if Yes)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-500">Solar Panels</label>
                                    <input
                                        type="number"
                                        value={config.environmental.solarPanelsPoints}
                                        onChange={(e) => handleChange('environmental', 'solarPanelsPoints', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Water Saving Taps</label>
                                    <input
                                        type="number"
                                        value={config.environmental.waterSavingTapsPoints}
                                        onChange={(e) => handleChange('environmental', 'waterSavingTapsPoints', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500">Waste Separation</label>
                                    <input
                                        type="number"
                                        value={config.environmental.wasteSeparationPoints}
                                        onChange={(e) => handleChange('environmental', 'wasteSeparationPoints', e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-blue-700 flex items-center">
                        <span className="mr-2">🤝</span> Social Section
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500">Community Participation</label>
                            <input
                                type="number"
                                value={config.social.communityParticipationPoints}
                                onChange={(e) => handleChange('social', 'communityParticipationPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Safe Neighborhood</label>
                            <input
                                type="number"
                                value={config.social.safeNeighborhoodPoints}
                                onChange={(e) => handleChange('social', 'safeNeighborhoodPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Public Transport</label>
                            <input
                                type="number"
                                value={config.social.publicTransportUsagePoints}
                                onChange={(e) => handleChange('social', 'publicTransportUsagePoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                    </div>
                </section>

                {/* Waste Management Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-indigo-700 flex items-center">
                        <span className="mr-2">♻️</span> Waste Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500">Points Per Completed Pickup</label>
                            <input
                                type="number"
                                value={config.wastePickupPoints}
                                onChange={(e) => handleChange('root', 'wastePickupPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                    </div>
                </section>

                {/* Economic Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-amber-700 flex items-center">
                        <span className="mr-2">💰</span> Economic Section
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500">Efficient Appliances</label>
                            <input
                                type="number"
                                value={config.economic.energyEfficientAppliancesPoints}
                                onChange={(e) => handleChange('economic', 'energyEfficientAppliancesPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Budget Tracking</label>
                            <input
                                type="number"
                                value={config.economic.budgetTrackingPoints}
                                onChange={(e) => handleChange('economic', 'budgetTrackingPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Sustainable Shopping</label>
                            <input
                                type="number"
                                value={config.economic.sustainableShoppingPoints}
                                onChange={(e) => handleChange('economic', 'sustainableShoppingPoints', e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminScoring;
