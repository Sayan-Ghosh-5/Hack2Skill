import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FiltersState {
  difficulty: string;
  mealType: string;
  maxPrepTime: string;
  sortBy: string;
}

interface RecipeFiltersProps {
  filters: FiltersState;
  onChange: (key: keyof FiltersState, value: string) => void;
}

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
      active
        ? 'bg-neon-green text-dark-bg shadow-[0_0_12px_rgba(0,255,136,0.3)]'
        : 'bg-dark-elevated text-text-secondary border border-dark-elevated hover:border-white/30 hover:text-white'
    }`}
  >
    {label}
  </button>
);

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="bg-dark-surface rounded-2xl border border-dark-elevated p-5 mb-10">
      <div className="flex items-center gap-2 mb-5 text-text-secondary font-semibold text-sm">
        <SlidersHorizontal size={16} className="text-neon-green" />
        Filters & Sort
      </div>

      <div className="space-y-4">
        {/* Difficulty */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {[['', 'All'], ['easy', '🟢 Easy'], ['medium', '🟡 Medium'], ['hard', '🔴 Hard']].map(([val, label]) => (
              <FilterChip
                key={val}
                label={label}
                active={filters.difficulty === val}
                onClick={() => onChange('difficulty', val)}
              />
            ))}
          </div>
        </div>

        {/* Meal Type */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Meal Type</p>
          <div className="flex flex-wrap gap-2">
            {[['', 'All'], ['breakfast', '🌅 Breakfast'], ['lunch', '☀️ Lunch'], ['dinner', '🌙 Dinner'], ['snack', '⚡ Snack']].map(([val, label]) => (
              <FilterChip
                key={val}
                label={label}
                active={filters.mealType === val}
                onClick={() => onChange('mealType', val)}
              />
            ))}
          </div>
        </div>

        {/* Prep Time + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Max Prep Time</p>
            <div className="flex flex-wrap gap-2">
              {[['', 'Any'], ['15', '15 min'], ['30', '30 min'], ['60', '60 min']].map(([val, label]) => (
                <FilterChip
                  key={val}
                  label={label}
                  active={filters.maxPrepTime === val}
                  onClick={() => onChange('maxPrepTime', val)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {[['rating', '⭐ Highest Rated'], ['saves', '❤️ Most Saved'], ['views', '👁 Most Viewed']].map(([val, label]) => (
                <FilterChip
                  key={val}
                  label={label}
                  active={filters.sortBy === val}
                  onClick={() => onChange('sortBy', val)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
