import React, { useState } from 'react';
import { CheckSquare, Square, ShoppingCart, Copy, Check } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  prepNotes?: string | null;
  nutrition?: { calories: number; protein: number; carbs: number; fats: number } | null;
}

interface IngredientChecklistProps {
  ingredients: Ingredient[];
  recipeId: string;
}

export const IngredientChecklist: React.FC<IngredientChecklistProps> = ({ ingredients, recipeId }) => {
  const storageKey = `checklist_${recipeId}`;
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [copied, setCopied] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  };

  const copyShoppingList = () => {
    const text = ingredients
      .map((i) => `• ${i.amount} ${i.unit} ${i.name}${i.prepNotes ? ` (${i.prepNotes})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">
            📝 Ingredients <span className="text-text-muted text-base font-normal">({ingredients.length})</span>
          </h3>
          <span className="text-xs text-text-muted font-semibold">
            {checked.size}/{ingredients.length} checked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="text-xs font-bold text-text-secondary hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-surface border border-transparent hover:border-white/10"
          >
            {showNutrition ? 'Hide Nutrition' : 'Show Nutrition'}
          </button>
          <button
            onClick={copyShoppingList}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-elevated hover:bg-electric-blue/20 text-text-secondary hover:text-electric-blue border border-transparent hover:border-electric-blue/30 transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy List'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {ingredients.map((ing) => {
          const isChecked = checked.has(ing.id);
          return (
            <div
              key={ing.id}
              onClick={() => toggle(ing.id)}
              className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                isChecked
                  ? 'bg-dark-bg/50 border-dark-elevated/50 opacity-60'
                  : 'bg-dark-elevated/30 border-dark-elevated hover:border-white/10 hover:bg-dark-elevated/60'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isChecked
                  ? <CheckSquare size={20} className="text-neon-green" />
                  : <Square size={20} className="text-text-muted" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`font-bold text-sm ${isChecked ? 'line-through text-text-muted' : 'text-white'}`}>
                    {ing.amount} {ing.unit}
                  </span>
                  <span className={`font-semibold text-sm ${isChecked ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {ing.name}
                  </span>
                  {ing.prepNotes && (
                    <span className="text-xs text-text-muted italic">{ing.prepNotes}</span>
                  )}
                </div>
                {showNutrition && ing.nutrition && (
                  <div className="flex gap-3 mt-1.5 text-xs">
                    <span className="text-calories-green">{ing.nutrition.calories} kcal</span>
                    <span className="text-protein-blue">{ing.nutrition.protein}P</span>
                    <span className="text-carbs-orange">{ing.nutrition.carbs}C</span>
                    <span className="text-fats-purple">{ing.nutrition.fats}F</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
