import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';

interface MealCardProps {
  meal: any;
}

export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const [portion, setPortion] = useState(1);
  const [proteinBoost, setProteinBoost] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { addToCart } = useCart();
  const { user, dailyTracking, addMealToTracking } = useUser();
  
  const boostAmount = proteinBoost ? meal.customizations.proteinBoost.amount : 0;
  const boostPrice = proteinBoost ? meal.customizations.proteinBoost.price : 0;
  
  const calculatedMacros = {
    calories: Math.round(meal.baseServing.calories * portion + (proteinBoost ? boostAmount * 4 : 0)), // Approx 4 kcal per g of pure protein
    protein: Math.round(meal.baseServing.protein * portion + boostAmount),
    carbs: Math.round(meal.baseServing.carbs * portion),
    fats: Math.round(meal.baseServing.fats * portion)
  };
  
  const price = (meal.baseServing.price * portion + boostPrice).toFixed(2);

  const handleAddToCart = () => {
    // Add to cart
    addToCart({
      mealId: meal.id,
      name: meal.name,
      image: meal.image,
      macros: calculatedMacros,
      customization: { portion, proteinBoost },
      price: parseFloat(price)
    });
    
    // Add to Tracking
    addMealToTracking(calculatedMacros, meal);
    
    // Show success state
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const remainingBefore = user ? {
    protein: Math.max(0, user.macroTargets.protein - dailyTracking.consumed.protein),
    carbs: Math.max(0, user.macroTargets.carbs - dailyTracking.consumed.carbs),
    fats: Math.max(0, user.macroTargets.fats - dailyTracking.consumed.fats),
  } : { protein: 0, carbs: 0, fats: 0 };
  
  const remainingAfter = {
    protein: Math.max(0, remainingBefore.protein - calculatedMacros.protein),
    carbs: Math.max(0, remainingBefore.carbs - calculatedMacros.carbs),
    fats: Math.max(0, remainingBefore.fats - calculatedMacros.fats),
  };

  return (
    <div 
      className="bg-dark-surface rounded-xl flex flex-col relative border border-dark-elevated transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Macro Impact Preview Hover overlay (only on desktop/hover) */}
      <div className={`absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-20 rounded-xl p-6 transition-opacity duration-300 flex flex-col justify-center items-center ${isHovered && (!('ontouchstart' in window)) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <h4 className="font-bold text-text-primary text-xl mb-4">Macro Impact</h4>
         
         <div className="w-full space-y-3">
           <div className="flex justify-between items-center text-sm">
             <span className="text-text-secondary">Protein:</span>
             <span className="font-bold text-text-primary">
               {dailyTracking?.consumed.protein} <span className="text-neon-green">→ {dailyTracking?.consumed.protein + calculatedMacros.protein}g</span>
             </span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-text-secondary">Carbs:</span>
             <span className="font-bold text-text-primary">
               {dailyTracking?.consumed.carbs} <span className="text-electric-blue">→ {dailyTracking?.consumed.carbs + calculatedMacros.carbs}g</span>
             </span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-text-secondary">Fats:</span>
             <span className="font-bold text-text-primary">
               {dailyTracking?.consumed.fats} <span className="text-intense-orange">→ {dailyTracking?.consumed.fats + calculatedMacros.fats}g</span>
             </span>
           </div>
           
           <div className="mt-4 pt-4 border-t border-dark-elevated">
             <p className="text-sm font-semibold text-text-primary mb-2 text-center">Remaining After Meal:</p>
             <div className="flex justify-center gap-4 text-sm">
                <span className="text-protein-blue font-bold">{remainingAfter.protein}g P</span>
                <span className="text-carbs-orange font-bold">{remainingAfter.carbs}g C</span>
                <span className="text-fats-purple font-bold">{remainingAfter.fats}g F</span>
             </div>
           </div>
         </div>
      </div>


      {/* Image */}
      <div className="relative h-56 overflow-hidden rounded-t-xl shrink-0">
        <img 
          src={meal.image} 
          alt={meal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent" />
        
        {/* Recommended Badge logic could go here */}
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col z-10">
        <h3 className="text-[22px] leading-tight font-bold text-text-primary mb-3">
          {meal.name}
        </h3>
        
        {/* Macro Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="px-2.5 py-1 bg-calories-green/10 text-calories-green border border-calories-green/20 rounded font-bold text-xs tracking-wider">
            {calculatedMacros.calories} kcal
          </span>
          <span className="px-2.5 py-1 bg-protein-blue/10 text-protein-blue border border-protein-blue/20 rounded font-bold text-xs">
            {calculatedMacros.protein}P
          </span>
          <span className="px-2.5 py-1 bg-carbs-orange/10 text-carbs-orange border border-carbs-orange/20 rounded font-bold text-xs">
            {calculatedMacros.carbs}C
          </span>
          <span className="px-2.5 py-1 bg-fats-purple/10 text-fats-purple border border-fats-purple/20 rounded font-bold text-xs">
            {calculatedMacros.fats}F
          </span>
        </div>
        
        {/* Spacer to push customizer down */}
        <div className="flex-1" />

        {/* Customization */}
        <div className="space-y-4 pt-4 border-t border-dark-elevated">
          {/* Portion Adjuster */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-secondary">Customize Portion:</span>
            <div className="flex items-center gap-3 bg-dark-bg p-1 rounded-lg border border-dark-elevated">
              <button 
                onClick={() => setPortion(Math.max(0.5, portion - 0.5))}
                className="p-1 rounded-md text-text-muted hover:text-white hover:bg-dark-elevated transition-colors disabled:opacity-30"
                disabled={portion <= 0.5}
              >
                <Minus size={16} />
              </button>
              <span className="font-bold w-6 text-center text-text-primary text-sm">{portion}x</span>
              <button 
                onClick={() => setPortion(Math.min(2, portion + 0.5))}
                className="p-1 rounded-md text-text-muted hover:text-white hover:bg-dark-elevated transition-colors disabled:opacity-30"
                disabled={portion >= 2}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Protein Boost */}
          {meal.customizations?.proteinBoost && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary">
                Extra Protein:
              </span>
              <button
                onClick={() => setProteinBoost(!proteinBoost)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  proteinBoost 
                    ? 'bg-protein-blue text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] border border-protein-blue' 
                    : 'bg-dark-bg text-text-secondary hover:text-white border border-dark-elevated hover:border-protein-blue/50'
                }`}
              >
                {proteinBoost ? (
                  <>
                    <Check size={14} /> +30g (${boostPrice.toFixed(2)})
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add ($3.00)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Price & CTA */}
        <div className="mt-6 pt-4 border-t border-dark-elevated flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <span className="text-text-secondary text-sm font-semibold">Total Price</span>
             <span className="text-2xl font-black text-white">${price}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full py-3.5 px-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              isAdded 
                ? 'bg-neon-green text-dark-bg scale-100 shadow-[0_0_20px_rgba(0,255,136,0.5)]' 
                : 'bg-electric-blue text-dark-bg hover:bg-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                Added to Macros! <Check size={20} strokeWidth={3} />
              </>
            ) : (
              <>
                Add to Macros & Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
