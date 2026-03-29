import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const dynamicTexts = [
  "Initializing Bharat AI Operating System...",
  "Analyzing GST & Tally data streams...",
  "Syncing with Indian market intelligence...",
  "Optimizing growth decisions for SMBs...",
  "Predicting revenue trends in Lakhs & Crores...",
  "Synthesizing CFO-level strategic insights..."
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 30% 20%, #0b1220, #020617 70%)'
          }}
        >
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Very subtle corner glow */}
            <motion.div
              animate={{
                opacity: [0.03, 0.06, 0.03],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full"
            />
            
            {/* Minimal floating particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.05
                }}
                animate={{
                  y: [null, "-20px", "20px", "0px"],
                  opacity: [0.02, 0.05, 0.02]
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-[1px] h-[1px] bg-white rounded-full"
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3"
            >
              <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-white">
                BharatMind
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-sm md:text-base text-white/60 font-medium tracking-[0.4em] uppercase mb-16"
            >
              The AI Operating System for Indian Businesses
            </motion.p>

            {/* Dynamic AI Text */}
            <div className="h-10 mb-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={textIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex items-center gap-3 text-white/80 font-mono text-sm md:text-base tracking-wide"
                >
                  <span className="text-emerald-500/60">→</span>
                  <span className="opacity-80">{dynamicTexts[textIndex]}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Premium Glass Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <button
                onClick={handleStart}
                className="group relative flex items-center gap-4 px-10 py-4 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl text-white font-medium transition-all duration-500 hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
              >
                <span className="tracking-wide">Enter Business OS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 text-white/60 group-hover:text-emerald-400" />
              </button>
            </motion.div>

            {/* One-Liner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              <p className="text-xs text-white/40 tracking-[0.2em] uppercase font-medium">
                No Chatbots. Just Decisions.
              </p>
            </motion.div>

            {/* Keyboard Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="mt-8 text-[10px] text-white/30 tracking-widest uppercase"
            >
              Press <span className="px-1.5 py-0.5 border border-white/20 rounded mx-1 font-mono">Enter</span> to begin
            </motion.p>
          </div>

          {/* Subtle Cursor Glow */}
          <CursorGlow />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CursorGlow = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
      style={{
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 255, 198, 0.02), transparent 80%)`,
      }}
    />
  );
};
