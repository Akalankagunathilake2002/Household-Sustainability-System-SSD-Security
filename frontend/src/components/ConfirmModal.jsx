import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // 'danger' or 'info'
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-border overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 text-text-muted hover:text-forest-dark transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary-teal/10 text-primary-teal'
                            }`}>
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-2xl font-bold text-forest-dark mb-2">{title}</h3>
                        <p className="text-text-muted mb-8">{message}</p>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-text-main bg-off-white hover:bg-gray-200 transition-all border border-border"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 px-6 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 ${type === 'danger'
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        : 'bg-primary-teal hover:bg-teal-700 shadow-primary-teal/20'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
