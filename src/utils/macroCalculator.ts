export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete';
export type Goal = 'cutting' | 'bulking' | 'maintenance';
export type Gender = 'male' | 'female' | 'other';

export const calculateTDEE = (
  weight: number, // in kg
  height: number, // in cm
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): number => {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male' || gender === 'other') { // default to male formula for other
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

export const calculateMacros = (
  tdee: number,
  goal: Goal,
  weight: number
) => {
  const adjustments: Record<Goal, number> = {
    cutting: -0.15,
    bulking: 0.15,
    maintenance: 0
  };
  
  const calories = Math.round(tdee * (1 + adjustments[goal]));
  
  const proteinMultipliers: Record<Goal, number> = {
    cutting: 2.4,
    bulking: 2.2,
    maintenance: 2.0
  };
  
  const protein = Math.round(weight * proteinMultipliers[goal]);
  const fatPercentage = goal === 'bulking' ? 0.30 : 0.25;
  const fats = Math.round((calories * fatPercentage) / 9);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);
  
  return { calories, protein, carbs, fats };
};
