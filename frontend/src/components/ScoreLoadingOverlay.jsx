import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Search, Cpu, Database } from 'lucide-react';

const ScoreLoadingOverlay = ({ isOpen }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    "Analyzing environmental impact...",
    "Calculating energy efficiency...",
    "Reviewing social contributions...",
    "Assessing economic sustainability...",
    "Finalizing your score..."
  ];

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statuses.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative mb-12">
            {/* Pulsing ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-[-20px] border-4 border-primary-teal rounded-full"
            />
            
            {/* Main icon animation */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 4, ease: "linear" },
                scale: { repeat: Infinity, duration: 2 }
              }}
              className="w-24 h-24 bg-teal-soft-bg rounded-3xl flex items-center justify-center text-primary-teal shadow-xl shadow-primary-teal/20"
            >
              <Leaf size={48} />
            </motion.div>

            {/* Orbiting icons */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-warm-yellow shadow-md">
                <Search size={18} />
              </div>
              <div className="absolute bottom-[-10px] left-[-30px] w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-blue-500 shadow-md">
                <Database size={18} />
              </div>
              <div className="absolute bottom-[-10px] right-[-30px] w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-purple-500 shadow-md">
                <Cpu size={18} />
              </div>
            </motion.div>
          </div>

          <motion.div
            key={statusIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="space-y-3"
          >
            <h2 className="text-2xl font-bold text-forest-dark tracking-tight">Your score is generating</h2>
            <p className="text-text-muted font-medium min-h-[1.5rem]">
              {statuses[statusIndex]}
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-12 w-64 h-2 bg-gray-100 rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-full bg-gradient-to-r from-primary-teal to-emerald-400"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreLoadingOverlay;
