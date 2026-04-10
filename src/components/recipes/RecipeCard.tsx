import React from 'react';
import { Clock, Star, Heart, ChefHat, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  recipe: {
    id: string;
    name: string;
    coverImage: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timing: { total: number };
    nutrition: { perServing: { calories: number; protein: number; carbs: number; fats: number } };
    stats: { rating: number; saves: number };
    tags?: string[];
  };
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-calories-green', bg: 'bg-calories-green/10 border-calories-green/30' },
  medium: { label: 'Medium', color: 'text-carbs-orange', bg: 'bg-carbs-orange/10 border-carbs-orange/30' },
  hard: { label: 'Hard', color: 'text-intense-orange', bg: 'bg-intense-orange/10 border-intense-orange/30' },
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();
  const diff = difficultyConfig[recipe.difficulty] || difficultyConfig.easy;
  const { protein, carbs, fats, calories } = recipe.nutrition.perServing;

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-dark-surface rounded-2xl overflow-hidden border border-dark-elevated hover:border-neon-green/30 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 group cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img
          src={recipe.coverImage}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent" />

        {/* Difficulty Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold border ${diff.bg} ${diff.color}`}>
          {diff.label}
        </span>

        {/* Saves */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-dark-bg/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-text-secondary">
          <Heart size={12} className="text-intense-orange" />
          {(recipe.stats.saves / 1000).toFixed(1)}K
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-neon-green transition-colors">
          {recipe.name}
        </h3>

        {/* Macro Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="px-2 py-0.5 bg-calories-green/10 text-calories-green border border-calories-green/20 rounded text-xs font-bold">{calories} kcal</span>
          <span className="px-2 py-0.5 bg-protein-blue/10 text-protein-blue border border-protein-blue/20 rounded text-xs font-bold">{protein}P</span>
          <span className="px-2 py-0.5 bg-carbs-orange/10 text-carbs-orange border border-carbs-orange/20 rounded text-xs font-bold">{carbs}C</span>
          <span className="px-2 py-0.5 bg-fats-purple/10 text-fats-purple border border-fats-purple/20 rounded text-xs font-bold">{fats}F</span>
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-elevated">
          <div className="flex items-center gap-3 text-text-secondary text-sm">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-electric-blue" />
              {recipe.timing.total}m
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-carbs-orange fill-current" />
              {recipe.stats.rating}
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-dark-elevated hover:bg-neon-green text-text-secondary hover:text-dark-bg text-sm font-bold rounded-lg transition-all duration-200 group/btn">
            <ChefHat size={14} className="group-hover/btn:scale-110 transition-transform" />
            Cook This
          </button>
        </div>
      </div>
    </div>
  );
};
