import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceOrbProps {
  isListening: boolean;
  isProcessing: boolean;
  isExecuting: boolean;
}

export function VoiceOrb({ isListening, isProcessing, isExecuting }: VoiceOrbProps) {
  const isActive = isListening || isProcessing || isExecuting;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop Dimming */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Glowing Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glows */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
            />

            {/* Core Orb */}
            <motion.div
              animate={isListening ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 40px rgba(16,185,129,0.4)",
                  "0 0 80px rgba(16,185,129,0.6)",
                  "0 0 40px rgba(16,185,129,0.4)"
                ]
              } : isProcessing ? {
                rotate: 360,
                scale: [1, 0.9, 1],
              } : {
                scale: [1, 1.05, 1],
              }}
              transition={isProcessing ? {
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              } : {
                duration: 2, repeat: Infinity, ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full relative z-10 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]"
            >
              {/* Inner Detail */}
              <div className="w-28 h-28 border-2 border-white/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border border-white/10 rounded-full" />
              </div>
            </motion.div>

            {/* Wave Animation (only when listening) */}
            {isListening && (
              <div className="absolute -bottom-24 flex items-center gap-1 h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [10, 40, 10],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut"
                    }}
                    className="w-1 bg-emerald-500/60 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Status Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute -bottom-40 text-center"
            >
              <p className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-sm animate-pulse">
                {isListening ? 'Listening...' : isProcessing ? 'Processing Intelligence...' : 'Executing Decision...'}
              </p>
              <p className="text-white/40 text-[10px] mt-2 font-medium tracking-widest uppercase">
                BharatMind AI System
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
