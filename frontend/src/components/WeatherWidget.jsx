import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import WeatherForecastModal from './WeatherForecastModal';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationLoaded, setLocationLoaded] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastParams, setLastParams] = useState(null);

    const fetchWeather = async (params) => {
        setLoading(true);
        setError(null);
        setLastParams(params);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await api.get(`${API_ENDPOINTS.WEATHER}?${query}`);
            setWeather(response.data);
            setLoading(false);
            setLocationLoaded(true);
        } catch (err) {
            console.error('Weather fetch error:', err);
            const errorMsg = err.response?.data?.msg || 'Failed to fetch weather data';
            setError(errorMsg);
            setLoading(false);
        }
    };

    const fetchForecast = async () => {
        if (forecast || !lastParams) return;

        setForecastLoading(true);
        try {
            const query = new URLSearchParams(lastParams).toString();
            const response = await api.get(`${API_ENDPOINTS.WEATHER_FORECAST}?${query}`);
            setForecast(response.data.list);
            setForecastLoading(false);
        } catch (err) {
            console.error('Forecast fetch error:', err);
            setForecastLoading(false);
        }
    };

    const handleWidgetClick = () => {
        if (!weather) return;
        setIsModalOpen(true);
        fetchForecast();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            fetchWeather({ city: searchCity });
        }
    };

    const getMyLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather({ lat: latitude, lon: longitude });
            },
            (err) => {
                console.error('Geolocation error:', err);
                let msg = 'Failed to get your location.';
                if (err.code === 1) msg = 'Location access denied. Please enable it in browser settings.';
                else if (err.code === 2) msg = 'Location unavailable. Check your device settings.';
                else if (err.code === 3) msg = 'Location request timed out. Please try again.';

                setError(msg);
                setLoading(false);
            },
            options
        );
    };

    useEffect(() => {
        getMyLocation();
    }, []);

    const getWeatherIcon = (iconCode) => {
        const iconMap = {
            '01': <Sun className="text-warm-yellow" size={32} />,
            '02': <Sun className="text-warm-yellow" size={32} />,
            '03': <Cloud className="text-text-muted" size={32} />,
            '04': <Cloud className="text-text-muted" size={32} />,
            '09': <CloudRain className="text-blue-500" size={32} />,
            '10': <CloudRain className="text-blue-500" size={32} />,
            '11': <AlertCircle className="text-red-500" size={32} />,
            '13': <Cloud className="text-blue-200" size={32} />,
            '50': <Wind className="text-text-muted" size={32} />,
        };
        const code = iconCode?.substring(0, 2);
        return iconMap[code] || <Cloud className="text-text-muted" size={32} />;
    };

    return (
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm glass flex flex-col justify-center min-h-[180px]">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-text-muted">Fetching local weather...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center gap-3 text-center"
                    >
                        <div className="p-3 bg-red-50 rounded-full">
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                        <p className="text-sm text-red-600 font-medium px-4 mb-2">{error}</p>

                        <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full px-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter city name..."
                                    value={searchCity}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/20"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 text-xs font-semibold px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors"
                                >
                                    Search City
                                </button>
                                <button
                                    type="button"
                                    onClick={getMyLocation}
                                    className="text-xs font-semibold px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Try GPS
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4 cursor-pointer group"
                        onClick={handleWidgetClick}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-1 text-text-muted mb-1">
                                    <MapPin size={14} />
                                    <span className="text-xs font-medium uppercase tracking-wider">{weather.city}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-forest-dark group-hover:text-primary-teal transition-colors">
                                    {Math.round(weather.temp)}°C
                                </h3>
                                <p className="text-sm text-text-muted capitalize">{weather.description}</p>
                            </div>
                            <div className="p-3 bg-soft-yellow-bg rounded-2xl group-hover:scale-110 transition-transform">
                                {getWeatherIcon(weather.icon)}
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-2 border-t border-border/50">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Droplets size={16} className="text-blue-400" />
                                    <span className="text-xs font-semibold">{weather.humidity}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Wind size={16} className="text-teal-400" />
                                    <span className="text-xs font-semibold">{weather.windSpeed} m/s</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary-teal opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                <TrendingUp size={12} />
                                View Forecast
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <WeatherForecastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                forecast={forecast}
                city={weather?.city}
            />
        </div>
    );
};

export default WeatherWidget;
