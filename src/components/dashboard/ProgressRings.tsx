import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface RingProps {
  label: string;
  consumed: number;
  target: number;
  colorHex: string;
  size: number;
  strokeWidth: number;
  isCalories?: boolean;
}

const Ring: React.FC<RingProps> = ({ label, consumed, target, colorHex, size, strokeWidth, isCalories }) => {
  const [offset, setOffset] = useState(0);
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  const percentage = Math.min((consumed / target) * 100, 100);
  const overTarget = consumed > target;
  
  const finalColor = overTarget ? '#FF6B35' : colorHex; // intense orange if over

  useEffect(() => {
    const progressOffset = circumference - (percentage / 100) * circumference;
    // Add small delay to allow mount
    setTimeout(() => setOffset(progressOffset), 100);
  }, [percentage, circumference, consumed, target]);

  return (
    <div className="relative flex flex-col items-center justify-center group" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#1E2530" /* dark-elevated */
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {isCalories ? (
          <div className="flex flex-col items-center">
            {overTarget && <AlertTriangle size={18} className="text-intense-orange mb-1" />}
            <span className="text-2xl font-bold font-interface tracking-tighter" style={{ color: finalColor }}>
              {consumed}
            </span>
            <span className="text-xs font-bold text-text-muted mt-[-2px]">
              / {target} kcal
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             {overTarget && <AlertTriangle size={12} className="text-intense-orange absolute top-1" />}
            <span className="text-xl font-bold font-interface tracking-tighter" style={{ color: finalColor }}>
              {consumed}g
            </span>
            <span className="text-[10px] font-bold text-text-muted mt-[-2px]">
              / {target}g
            </span>
          </div>
        )}
      </div>

      {/* Tooltip Hover */}
      <div className="absolute top-full mt-2 w-max px-2 py-1 bg-dark-elevated text-xs font-bold text-text-primary rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
        {overTarget 
          ? `You are over your ${label} limit by ${consumed - target}${isCalories ? '' : 'g'}.` 
          : `You need ${target - consumed}${isCalories ? '' : 'g'} more ${label} today.`}
      </div>
    </div>
  );
};

export const ProgressRings: React.FC<{
  consumed: { calories: number; protein: number; carbs: number; fats: number };
  targets: { calories: number; protein: number; carbs: number; fats: number };
}> = ({ consumed, targets }) => {
  return (
    <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row items-center justify-center gap-6 md:gap-10">
      
      {/* Central Big Calories Ring */}
      <div className="flex-shrink-0">
        <Ring
          label="Calories"
          consumed={consumed.calories}
          target={targets.calories}
          colorHex="#10B981" // calories-green
          size={160}
          strokeWidth={12}
          isCalories
        />
      </div>

      {/* Mobile grid for macros */}
      <div className="grid grid-cols-2 md:flex gap-6 md:gap-8">
        <Ring
          label="Protein"
          consumed={consumed.protein}
          target={targets.protein}
          colorHex="#3B82F6" // protein-blue
          size={100}
          strokeWidth={8}
        />
        <Ring
          label="Carbs"
          consumed={consumed.carbs}
          target={targets.carbs}
          colorHex="#F59E0B" // carbs-orange
          size={100}
          strokeWidth={8}
        />
        <Ring
          label="Fats"
          consumed={consumed.fats}
          target={targets.fats}
          colorHex="#8B5CF6" // fats-purple
          size={100}
          strokeWidth={8}
        />
      </div>
    </div>
  );
};
