import React from 'react';
import { motion } from 'framer-motion';

const SmartBin = ({ level }) => {
    // Determine color based on level
    const getColor = (level) => {
        if (level < 50) return '#4ade80'; // Green
        if (level < 80) return '#facc15'; // Yellow
        return '#ef4444'; // Red
    };

    const color = getColor(level);

    return (
        <div className="relative w-48 h-64 mx-auto">
            {/* Bin Body */}
            <div className="absolute inset-0 border-4 border-gray-700 rounded-b-xl bg-gray-100 overflow-hidden shadow-inner">
                {/* Liquid/Fill Level */}
                <motion.div
                    initial={{ height: '0%' }}
                    animate={{ height: `${level}%` }}
                    transition={{ duration: 1, type: 'spring' }}
                    className="absolute bottom-0 w-full opacity-80"
                    style={{ backgroundColor: color }}
                />

                {/* Measurement Lines */}
                <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
                    <div className="w-full h-px bg-gray-300 opacity-50"></div>
                    <div className="w-full h-px bg-gray-300 opacity-50"></div>
                    <div className="w-full h-px bg-gray-300 opacity-50"></div>
                </div>

                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800 drop-shadow-md bg-white/50 px-2 py-1 rounded-lg">
                        {level}%
                    </span>
                </div>
            </div>

            {/* Bin Lid */}
            <div className="absolute -top-4 -left-2 -right-2 h-6 bg-gray-800 rounded-lg shadow-md flex justify-center items-center">
                <div className="w-16 h-2 bg-gray-600 rounded-full opacity-50"></div>
            </div>

            {/* Reflection highlight */}
            <div className="absolute top-4 right-4 w-2 h-32 bg-white opacity-20 rounded-full blur-[1px] pointer-events-none"></div>
        </div>
    );
};

export default SmartBin;
