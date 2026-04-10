import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Goal } from '../../utils/macroCalculator';

export const GoalSelector: React.FC = () => {
  const { user, updateGoal } = useUser();

  if (!user) return null;

  const currentTDEE = Math.round(user.macroTargets.calories / (
    user.currentGoal === 'cutting' ? 0.85 :
    user.currentGoal === 'bulking' ? 1.15 : 1
  ));

  const options: { id: Goal; label: string; icon: string }[] = [
    { id: 'cutting', label: 'Cutting', icon: '🔥' },
    { id: 'bulking', label: 'Bulking', icon: '💪' },
    { id: 'maintenance', label: 'Maintenance', icon: '⚖️' }
  ];

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">Your Goal</h2>
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = user.currentGoal === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateGoal(opt.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,136,0.15)]' 
                  : 'border-dark-elevated bg-dark-surface hover:border-text-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <span className={`font-bold text-lg ${isSelected ? 'text-neon-green' : 'text-text-primary'}`}>
                  {opt.label}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-neon-green bg-none' : 'border-text-muted'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-neon-green rounded-full shadow-[0_0_8px_#00FF88]" />}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-text-secondary mt-2">
        Based on your stats: <span className="font-bold text-text-primary">{currentTDEE} kcal</span> TDEE
      </p>
    </div>
  );
};
