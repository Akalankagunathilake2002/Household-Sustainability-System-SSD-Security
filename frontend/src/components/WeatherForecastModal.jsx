import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Sun, CloudRain, Wind, Droplets, Calendar, Clock } from 'lucide-react';

const WeatherForecastModal = ({ isOpen, onClose, forecast, city }) => {
    if (!isOpen || !forecast) return null;

    const getWeatherIcon = (iconCode, size = 24) => {
        const iconMap = {
            '01': <Sun className="text-warm-yellow" size={size} />,
            '02': <Sun className="text-warm-yellow" size={size} />,
            '03': <Cloud className="text-text-muted" size={size} />,
            '04': <Cloud className="text-text-muted" size={size} />,
            '09': <CloudRain className="text-blue-500" size={size} />,
            '10': <CloudRain className="text-blue-500" size={size} />,
            '11': <CloudRain className="text-red-500" size={size} />,
            '13': <Cloud className="text-blue-200" size={size} />,
            '50': <Wind className="text-text-muted" size={size} />,
        };
        const code = iconCode?.substring(0, 2);
        return iconMap[code] || <Cloud className="text-text-muted" size={size} />;
    };

    // Process forecast data to get daily summaries
    const dailyForecasts = forecast.reduce((acc, curr) => {
        const date = new Date(curr.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = {
                date,
                temps: [],
                icons: [],
                descriptions: [],
                humidity: [],
                wind: []
            };
        }
        acc[date].temps.push(curr.main.temp);
        acc[date].icons.push(curr.weather[0].icon);
        acc[date].descriptions.push(curr.weather[0].description);
        acc[date].humidity.push(curr.main.humidity);
        acc[date].wind.push(curr.wind.speed);
        return acc;
    }, {});

    const processedDaily = Object.values(dailyForecasts).slice(0, 5).map(day => ({
        date: day.date,
        dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        avgTemp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
        icon: day.icons[Math.floor(day.icons.length / 2)], // middle of the day icon
        description: day.descriptions[0]
    }));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden glass z-10"
                >
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-forest-dark">{city} Forecast</h2>
                            <p className="text-sm text-text-muted flex items-center gap-1">
                                <Calendar size={14} /> Next 5 Days
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-off-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <section className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                                <Clock size={16} /> Hourly (Next 24h)
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {forecast.slice(0, 8).map((hour, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 bg-off-white rounded-2xl min-w-[100px]">
                                        <span className="text-xs font-semibold">
                                            {new Date(hour.dt * 1000).getHours()}:00
                                        </span>
                                        {getWeatherIcon(hour.weather[0].icon, 32)}
                                        <span className="text-lg font-bold">{Math.round(hour.main.temp)}°</span>
                                        <span className="text-[10px] text-text-muted capitalize">{hour.weather[0].description}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                                <Calendar size={16} /> 5-Day Forecast
                            </h3>
                            <div className="flex flex-col gap-3">
                                {processedDaily.map((day, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-border rounded-2xl">
                                        <div className="flex items-center gap-4 min-w-[100px]">
                                            <span className="font-bold text-lg">{day.dayName}</span>
                                            <span className="text-xs text-text-muted">{day.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getWeatherIcon(day.icon, 28)}
                                            <span className="text-sm capitalize">{day.description}</span>
                                        </div>
                                        <div className="text-xl font-bold">
                                            {day.avgTemp}°C
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="p-4 bg-primary-teal/5 text-center text-xs text-text-muted">
                        Weather data provided by OpenWeatherMap API
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WeatherForecastModal;
