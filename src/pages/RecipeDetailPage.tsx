import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { IngredientChecklist } from '../components/recipes/IngredientChecklist';
import { CookingMode } from '../components/recipes/CookingMode';
import { LogCookedModal } from '../components/recipes/LogCookedModal';
import { StepTimer } from '../components/recipes/StepTimer';
import recipesData from '../data/recipes.json';
import {
  Clock, Star, Heart, ChefHat, Eye, Lightbulb,
  Play, ArrowLeft, BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

const difficultyConfig: Record<string, any> = {
  easy: { label: 'Easy', color: 'text-calories-green', bg: 'bg-calories-green/10 border-calories-green/30' },
  medium: { label: 'Medium', color: 'text-carbs-orange', bg: 'bg-carbs-orange/10 border-carbs-orange/30' },
  hard: { label: 'Hard', color: 'text-intense-orange', bg: 'bg-intense-orange/10 border-intense-orange/30' },
};

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cookingMode, setCookingMode] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggedToast, setLoggedToast] = useState<string | null>(null);

  const recipe = (recipesData as any[]).find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-white mb-2">Recipe not found</h2>
          <button onClick={() => navigate('/recipes')} className="text-neon-green hover:underline mt-4 block">
            Browse all recipes
          </button>
        </div>
      </div>
    );
  }

  const diff = difficultyConfig[recipe.difficulty] || difficultyConfig.easy;
  const macros = recipe.nutrition.perServing;

  const handleLogged = (macros: any) => {
    setShowLogModal(false);
    setLoggedToast(`+${macros.protein}g protein logged to today! 💪`);
    setTimeout(() => setLoggedToast(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Toast */}
      {loggedToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-6 z-50 bg-neon-green text-dark-bg font-bold px-5 py-3.5 rounded-xl shadow-[0_0_25px_rgba(0,255,136,0.4)]"
        >
          {loggedToast}
        </motion.div>
      )}

      <main className="flex-1">
        {/* Back */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors font-semibold text-sm mb-8"
          >
            <ArrowLeft size={16} /> All Recipes
          </button>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-video bg-dark-elevated shadow-2xl">
              <img
                src={recipe.coverImage}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 to-transparent" />

              {/* Play placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all hover:scale-110">
                  <Play size={24} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div>
              {/* Rating + Stats */}
              <div className="flex items-center flex-wrap gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="text-carbs-orange fill-current" />
                  <span className="font-black text-white text-lg">{recipe.stats.rating}</span>
                  <span className="text-text-muted text-sm">({recipe.stats.totalRatings} ratings)</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-sm">
                  <Eye size={14} />
                  {(recipe.stats.views / 1000).toFixed(1)}K views
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                {recipe.name}
              </h1>

              <p className="text-text-secondary text-lg font-medium mb-6">
                {recipe.description}
              </p>

              {/* Meta Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${diff.bg} ${diff.color}`}>
                  {diff.label}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-dark-elevated text-text-primary border border-dark-surface">
                  <Clock size={14} className="text-electric-blue" />
                  {recipe.timing.prep}m prep + {recipe.timing.cook}m cook
                </span>
                <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-dark-elevated text-text-primary border border-dark-surface">
                  🍽️ {recipe.totalServings} serving{recipe.totalServings !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 border ${
                    saved
                      ? 'bg-intense-orange/10 border-intense-orange/40 text-intense-orange'
                      : 'bg-dark-elevated border-dark-surface text-text-secondary hover:text-white hover:border-white/20'
                  }`}
                >
                  <Heart size={18} className={saved ? 'fill-current' : ''} />
                  {saved ? 'Saved!' : 'Save Recipe'}
                </button>

                <button
                  onClick={() => setCookingMode(true)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-neon-green text-dark-bg font-bold rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                >
                  <ChefHat size={18} />
                  Start Cooking →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrition Strip */}
        <section className="border-y border-dark-elevated bg-dark-surface py-8 my-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-text-muted font-semibold text-sm mb-5 uppercase tracking-wider">
              Nutrition Per Serving — Makes {recipe.totalServings}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calories', value: `${macros.calories}`, unit: 'kcal', color: 'text-calories-green', bg: 'bg-calories-green/5 border-calories-green/20' },
                { label: 'Protein', value: `${macros.protein}g`, unit: 'protein', color: 'text-protein-blue', bg: 'bg-protein-blue/5 border-protein-blue/20' },
                { label: 'Carbs', value: `${macros.carbs}g`, unit: 'carbs', color: 'text-carbs-orange', bg: 'bg-carbs-orange/5 border-carbs-orange/20' },
                { label: 'Fats', value: `${macros.fats}g`, unit: 'fats', color: 'text-fats-purple', bg: 'bg-fats-purple/5 border-fats-purple/20' },
              ].map((m) => (
                <div key={m.label} className={`p-5 rounded-2xl border ${m.bg} text-center`}>
                  <div className={`text-3xl font-black ${m.color}`}>{m.value}</div>
                  <div className="text-text-muted text-sm font-semibold mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients + Steps */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Ingredients (2/5) */}
            <div className="lg:col-span-2">
              <IngredientChecklist ingredients={recipe.ingredients} recipeId={recipe.id} />
            </div>

            {/* Steps (3/5) */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-electric-blue" />
                  Instructions ({recipe.steps.length} steps)
                </h3>
                <button
                  onClick={() => setCookingMode(true)}
                  className="text-xs font-bold text-neon-green hover:text-white bg-neon-green/10 hover:bg-neon-green border border-neon-green/30 hover:border-neon-green px-4 py-2 rounded-lg transition-all duration-200"
                >
                  🍳 Cooking Mode →
                </button>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step: any) => (
                  <div
                    key={step.id || step.stepNumber}
                    className="bg-dark-surface border border-dark-elevated rounded-2xl p-6 group hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dark-elevated border border-dark-bg flex items-center justify-center font-black text-white group-hover:bg-neon-green/10 group-hover:border-neon-green/30 group-hover:text-neon-green transition-all">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        {step.title && (
                          <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                        )}
                        <p className="text-text-secondary leading-relaxed font-medium">{step.instruction}</p>

                        {step.timerSeconds && (
                          <div className="mt-4">
                            <StepTimer seconds={step.timerSeconds} stepNumber={step.stepNumber} />
                          </div>
                        )}

                        {step.proTip && (
                          <div className="mt-4 flex items-start gap-2.5 bg-carbs-orange/5 border border-carbs-orange/20 rounded-xl px-4 py-3">
                            <Lightbulb size={16} className="text-carbs-orange flex-shrink-0 mt-0.5" />
                            <p className="text-carbs-orange text-sm font-semibold">
                              <span className="font-black">Pro Tip: </span>{step.proTip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Log as Cooked */}
              <div className="mt-10 p-6 bg-dark-surface border border-neon-green/20 rounded-2xl text-center">
                <h4 className="text-xl font-bold text-white mb-2">Made this recipe? 🎉</h4>
                <p className="text-text-secondary text-sm mb-5 font-medium">
                  Log it to add the macros to your daily tracking.
                </p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="px-8 py-4 bg-neon-green text-dark-bg font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                >
                  Log as Cooked 🍳
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Cooking Mode Overlay */}
      {cookingMode && (
        <CookingMode
          steps={recipe.steps}
          recipeName={recipe.name}
          onClose={() => setCookingMode(false)}
        />
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogCookedModal
          recipe={recipe}
          onClose={() => setShowLogModal(false)}
          onLogged={handleLogged}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
