import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { StepTimer } from './StepTimer';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id?: string;
  stepNumber: number;
  title?: string | null;
  instruction: string;
  proTip?: string | null;
  timerSeconds?: number | null;
}

interface CookingModeProps {
  steps: Step[];
  recipeName: string;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ steps, recipeName, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  // Keep screen awake if supported
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };
    requestWakeLock();
    return () => { wakeLock?.release?.(); };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentStep < steps.length - 1) setCurrentStep((c) => c + 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) setCurrentStep((c) => c - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, steps.length, onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-dark-bg flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-elevated shrink-0">
        <div>
          <p className="text-neon-green text-xs font-bold uppercase tracking-widest">Cooking Mode</p>
          <h2 className="text-white font-bold text-lg leading-tight">{recipeName}</h2>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 h-3 bg-neon-green'
                  : i < currentStep
                  ? 'w-3 h-3 bg-neon-green/40'
                  : 'w-3 h-3 bg-dark-elevated'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-dark-elevated hover:bg-dark-surface hover:text-white text-text-secondary transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-24 lg:px-40 xl:px-60 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl text-center py-12"
          >
            {/* Step Number */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-green/10 border-2 border-neon-green/40 text-neon-green text-2xl font-black mb-8">
              {step.stepNumber}
            </div>

            {/* Title */}
            {step.title && (
              <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                {step.title}
              </h3>
            )}

            {/* Instruction */}
            <p className="text-xl md:text-2xl text-text-secondary leading-relaxed font-medium mb-8">
              {step.instruction}
            </p>

            {/* Timer */}
            {step.timerSeconds && (
              <div className="flex justify-center mb-8">
                <StepTimer seconds={step.timerSeconds} stepNumber={step.stepNumber} />
              </div>
            )}

            {/* Pro Tip */}
            {step.proTip && (
              <div className="flex items-start gap-3 bg-carbs-orange/5 border border-carbs-orange/20 rounded-2xl px-6 py-4 text-left">
                <Lightbulb size={20} className="text-carbs-orange flex-shrink-0 mt-0.5" />
                <p className="text-carbs-orange text-base font-semibold">
                  <span className="font-black">Pro Tip: </span>{step.proTip}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 px-8 pb-8 pt-4 border-t border-dark-elevated">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-dark-elevated hover:bg-dark-surface rounded-xl font-bold text-text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <span className="text-sm font-bold text-text-muted">
            Step {currentStep + 1} of {steps.length}
          </span>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((c) => c + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-neon-green text-dark-bg hover:bg-white rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-neon-green text-dark-bg hover:bg-white rounded-xl font-bold transition-all hover:scale-105"
            >
              🎉 Done!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
