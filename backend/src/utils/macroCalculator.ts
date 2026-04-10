export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete';
export type Goal = 'cutting' | 'bulking' | 'maintenance';
export type Gender = 'male' | 'female' | 'other';

export const calculateTDEE = (
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): number => {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 78; // average
  }

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

export const calculateMacros = (tdee: number, goal: Goal, weight: number) => {
  const adjustments: Record<Goal, number> = {
    cutting: -0.15,
    bulking: 0.15,
    maintenance: 0,
  };

  const calories = Math.round(tdee * (1 + adjustments[goal]));

  const proteinMultipliers: Record<Goal, number> = {
    cutting: 2.4,
    bulking: 2.2,
    maintenance: 2.0,
  };

  const protein = Math.round(weight * proteinMultipliers[goal]);

  const fatPercentages: Record<Goal, number> = {
    cutting: 0.25,
    bulking: 0.30,
    maintenance: 0.25,
  };

  const fats = Math.round((calories * fatPercentages[goal]) / 9);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

  return { calories, protein, carbs, fats };
};

export const calculateMealMacros = (
  baseMeal: {
    baseCalories: number;
    baseProtein: number;
    baseCarbs: number;
    baseFats: number;
    proteinBoostAmount?: number | null;
  },
  customization: {
    portionSize: number;
    proteinBoost: boolean;
  }
) => {
  let calories = Math.round(baseMeal.baseCalories * customization.portionSize);
  let protein = Math.round(baseMeal.baseProtein * customization.portionSize);
  let carbs = Math.round(baseMeal.baseCarbs * customization.portionSize);
  let fats = Math.round(baseMeal.baseFats * customization.portionSize);

  if (customization.proteinBoost && baseMeal.proteinBoostAmount) {
    protein += baseMeal.proteinBoostAmount;
    calories += baseMeal.proteinBoostAmount * 4; // 4 kcal/g protein
  }

  return { calories, protein, carbs, fats };
};

export const calculateAllGoalMacros = (tdee: number, weight: number) => {
  return {
    cutting: calculateMacros(tdee, 'cutting', weight),
    bulking: calculateMacros(tdee, 'bulking', weight),
    maintenance: calculateMacros(tdee, 'maintenance', weight),
  };
};
