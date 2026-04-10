import React from 'react';
import { GoalSelector } from './GoalSelector';
import { ProgressRings } from './ProgressRings';
import { useUser } from '../../contexts/UserContext';
import { ChevronDown } from 'lucide-react';

export const MacroTracker: React.FC = () => {
  const { user, dailyTracking } = useUser();

  if (!user) return null;

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Goal Selector */}
          <div className="w-full lg:w-1/3 flex-shrink-0 z-10">
            <GoalSelector />
          </div>

          {/* Right: Progress Rings */}
          <div className="w-full lg:w-2/3 flex flex-col justify-center items-center lg:items-start z-10">
            <h2 className="text-xl font-bold text-text-primary mb-8 text-center lg:text-left w-full">Current Daily Progress</h2>
            
            <div className="w-full bg-dark-surface p-6 sm:p-8 rounded-2xl border border-dark-elevated shadow-2xl">
               <ProgressRings 
                 consumed={dailyTracking.consumed} 
                 targets={user.macroTargets} 
               />
            </div>

            <div className="mt-10 w-full flex justify-center lg:justify-start">
               <button 
                 onClick={() => {
                   document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="flex items-center gap-2 px-8 py-4 bg-neon-green text-dark-bg font-bold text-lg rounded-xl hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 active:scale-95 group"
               >
                 <span>Add Meal to Connect</span>
                 <ChevronDown className="group-hover:translate-y-1 transition-transform" />
               </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
