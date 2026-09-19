import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, ArrowRight, Share2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const ConfettiPiece = ({ index }) => {
  const colors = ['#0ea5a4', '#facc15', '#3b82f6', '#ef4444', '#10b981'];
  const color = colors[index % colors.length];
  
  return (
    <motion.div
      initial={{ 
        x: '50vw', 
        y: '50vh', 
        scale: 0, 
        rotate: 0,
        opacity: 1 
      }}
      animate={{ 
        x: `calc(50vw + ${(Math.random() - 0.5) * 800}px)`,
        y: `calc(50vh + ${(Math.random() - 0.5) * 800}px)`,
        scale: Math.random() * 1.5 + 0.5,
        rotate: Math.random() * 720,
        opacity: [1, 1, 0]
      }}
      transition={{ 
        duration: Math.random() * 2 + 1.5,
        ease: "easeOut" 
      }}
      className="absolute w-3 h-3 rounded-sm z-[10001]"
      style={{ backgroundColor: color }}
    />
  );
};

const AuditSuccessModal = ({ isOpen, onClose, score, environmentalScore }) => {
  const handleShare = async () => {
    const shareData = {
      title: 'EcoPulse Sustainability Achievement',
      text: `I just scored ${Math.round(score)}% on my EcoPulse Sustainability Audit! 🌍 Can you beat my score and lead a greener life?`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} Check it out here: ${shareData.url}`);
        toast.info('Results copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Failed to share results');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti container */}
          <div className="fixed inset-0 pointer-events-none z-[10001] overflow-hidden">
            {[...Array(60)].map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top celebration area */}
              <div className="bg-gradient-to-br from-primary-teal to-emerald-700 p-8 text-center text-white relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
                >
                  <Trophy size={40} className="text-warm-yellow" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                <p className="text-emerald-100 font-medium">You've successfully completed your audit.</p>
                
                {/* Floating particles background decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                  <motion.div 
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, 20, 0], x: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                    className="absolute bottom-10 right-10 w-6 h-6 bg-white border-2 border-white rounded-full opacity-50"
                  />
                </div>
              </div>

              {/* Score Display */}
              <div className="p-8 text-center">
                <div className="mb-8">
                  <span className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2 block">Sustainability Score</span>
                  <div className="flex items-center justify-center gap-2">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-6xl font-black text-forest-dark tracking-tighter"
                    >
                      {Math.round(score)}
                    </motion.span>
                    <span className="text-4xl font-bold text-primary-teal">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-off-white rounded-2xl border border-border">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-1">Environmental</span>
                    <strong className="text-xl text-forest-dark">{Math.round(environmentalScore)}%</strong>
                  </div>
                  <div className="p-4 bg-off-white rounded-2xl border border-border">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-1">Status</span>
                    <strong className="text-[13px] text-primary-teal font-bold">
                      {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-primary-teal text-white font-bold rounded-2xl shadow-lg shadow-primary-teal/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                  >
                    View My History <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full py-4 bg-white text-text-main font-bold rounded-2xl border border-border hover:bg-off-white transition-all flex items-center justify-center gap-2 group"
                  >
                    <Share2 size={18} className="group-hover:rotate-12 transition-transform" /> Share Results
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditSuccessModal;
