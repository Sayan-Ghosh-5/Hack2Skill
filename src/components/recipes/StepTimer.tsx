import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';

interface StepTimerProps {
  seconds: number;
  stepNumber: number;
}

export const StepTimer: React.FC<StepTimerProps> = ({ seconds, stepNumber }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            // Play audio alert
            try {
              const ctx = new AudioContext();
              const oscillator = ctx.createOscillator();
              const gainNode = ctx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(ctx.destination);
              oscillator.frequency.value = 880;
              gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
              oscillator.start();
              oscillator.stop(ctx.currentTime + 1.5);
            } catch {}
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  const reset = () => {
    clearInterval(intervalRef.current!);
    setTimeLeft(seconds);
    setRunning(false);
    setDone(false);
  };

  const toggle = () => {
    if (done) { reset(); return; }
    setRunning((r) => !r);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
      done
        ? 'bg-neon-green/10 border-neon-green/40 shadow-[0_0_12px_rgba(0,255,136,0.2)]'
        : running
        ? 'bg-electric-blue/10 border-electric-blue/40'
        : 'bg-dark-elevated border-dark-elevated'
    }`}>
      {done ? (
        <Bell size={16} className="text-neon-green animate-bounce" />
      ) : (
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#1E2530" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="12"
              fill="none"
              stroke={running ? '#00D9FF' : '#4A5568'}
              strokeWidth="3"
              strokeDasharray={75.4}
              strokeDashoffset={75.4 - (75.4 * progress) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
        </div>
      )}

      <span className={`font-black text-lg tabular-nums ${done ? 'text-neon-green' : running ? 'text-electric-blue' : 'text-white'}`}>
        {done ? 'Done!' : fmt(timeLeft)}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className={`p-1.5 rounded-lg transition-all ${
            done ? 'text-text-muted hover:text-white' : running ? 'text-electric-blue hover:bg-electric-blue/10' : 'text-text-secondary hover:text-white'
          }`}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={reset}
          className="p-1.5 rounded-lg text-text-muted hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
