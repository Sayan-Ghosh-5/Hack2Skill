import React, { useEffect, useState } from 'react';
import { MealCard } from './MealCard';
import mealsData from '../../data/meals.json';
import { useUser } from '../../contexts/UserContext';

export const MealGrid: React.FC = () => {
  const { user, dailyTracking } = useUser();
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    // In real app, fetch from API. We use JSON data.
    setMeals(mealsData);
  }, []);

  if (!user) return null;

  const proteinNeeded = Math.max(0, user.macroTargets.protein - dailyTracking.consumed.protein);
  const carbsNeeded = Math.max(0, user.macroTargets.carbs - dailyTracking.consumed.carbs);

  return (
    <section id="menu-section" className="py-20 bg-dark-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight mb-4">
            Fuel Your Goal
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-elevated rounded-lg border border-dark-surface">
            <span className="text-text-secondary font-semibold">Based on your progress, you need:</span>
            <span className="text-protein-blue font-bold">{proteinNeeded}g Protein</span>
            <span>&bull;</span>
            <span className="text-carbs-orange font-bold">{carbsNeeded}g Carbs</span>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>
    </section>
  );
};
