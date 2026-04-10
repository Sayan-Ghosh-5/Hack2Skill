import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface LogCookedModalProps {
  recipe: {
    id: string;
    name: string;
    totalServings: number;
    nutrition: {
      perServing: { calories: number; protein: number; carbs: number; fats: number };
    };
  };
  onClose: () => void;
  onLogged: (macros: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

export const LogCookedModal: React.FC<LogCookedModalProps> = ({ recipe, onClose, onLogged }) => {
  const [servings, setServings] = useState(recipe.totalServings);
  const [notes, setNotes] = useState('');
  const [logged, setLogged] = useState(false);
  const { addMealToTracking } = useUser();

  const { nutrition } = recipe;
  const macros = {
    calories: Math.round(nutrition.perServing.calories * servings),
    protein: Math.round(nutrition.perServing.protein * servings),
    carbs: Math.round(nutrition.perServing.carbs * servings),
    fats: Math.round(nutrition.perServing.fats * servings),
  };

  const handleLog = () => {
    addMealToTracking(macros, { id: recipe.id, name: recipe.name, type: 'recipe' });
    setLogged(true);
    onLogged(macros);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-dark-surface w-full max-w-md rounded-3xl border border-dark-elevated shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-elevated">
          <h3 className="text-xl font-bold text-white">Log as Cooked 🍳</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {!logged ? (
          <div className="p-6 space-y-5">
            <p className="text-text-secondary font-semibold">
              Great work cooking <span className="text-white font-bold">{recipe.name}</span>!
            </p>

            {/* Servings Selector */}
            <div>
              <label className="text-sm font-bold text-text-secondary mb-2 block">
                How many servings did you have?
              </label>
              <div className="flex items-center justify-between bg-dark-bg rounded-xl border border-dark-elevated p-4">
                <div className="grid grid-cols-4 gap-2 w-full">
                  {[0.5, 1, 1.5, 2, recipe.totalServings].filter((v, i, a) => a.indexOf(v) === i).map((val) => (
                    <button
                      key={val}
                      onClick={() => setServings(val)}
                      className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                        servings === val
                          ? 'bg-neon-green text-dark-bg'
                          : 'bg-dark-elevated text-text-secondary hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Macro Preview */}
            <div className="bg-dark-bg rounded-xl p-4 border border-dark-elevated">
              <p className="text-sm font-bold text-text-secondary mb-3">Macros being added to today:</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-2xl font-black text-calories-green">{macros.calories}</div>
                  <div className="text-xs text-text-muted font-semibold">kcal</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-protein-blue">{macros.protein}g</div>
                  <div className="text-xs text-text-muted font-semibold">Protein</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-carbs-orange">{macros.carbs}g</div>
                  <div className="text-xs text-text-muted font-semibold">Carbs</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-fats-purple">{macros.fats}g</div>
                  <div className="text-xs text-text-muted font-semibold">Fats</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-bold text-text-secondary mb-2 block">
                Any modifications? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Added extra garlic, turned out great!"
                rows={3}
                className="w-full bg-dark-bg border border-dark-elevated rounded-xl p-3 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 transition-colors resize-none text-sm"
              />
            </div>

            <button
              onClick={handleLog}
              className="w-full py-4 bg-neon-green text-dark-bg font-bold rounded-xl text-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
            >
              Add to Today's Macros 💪
            </button>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-2xl font-black text-neon-green mb-2">Logged!</h4>
            <p className="text-text-secondary font-semibold">
              +{macros.protein}g protein added to today's tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
