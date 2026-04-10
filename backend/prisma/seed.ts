import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create restaurants
  const macroKitchen = await prisma.restaurant.upsert({
    where: { id: 'rest-001' },
    update: {},
    create: {
      id: 'rest-001',
      name: 'MacroKitchen',
      description: 'Precision nutrition meals delivered fresh daily.',
      isVerified: true,
      macroAccuracyCertification: true,
    },
  });

  const fitBites = await prisma.restaurant.upsert({
    where: { id: 'rest-002' },
    update: {},
    create: {
      id: 'rest-002',
      name: 'FitBites',
      description: 'Clean & delicious performance food.',
      isVerified: true,
      macroAccuracyCertification: true,
    },
  });

  const plantFuel = await prisma.restaurant.upsert({
    where: { id: 'rest-003' },
    update: {},
    create: {
      id: 'rest-003',
      name: 'PlantFuel',
      description: 'Plant-powered high-protein meals.',
      isVerified: true,
      macroAccuracyCertification: false,
    },
  });

  // Create meals
  const mealsData = [
    {
      id: 'meal-001',
      name: 'Post-Workout Steak & Sweet Potato',
      description: 'Lean sirloin steak with roasted sweet potato and grilled asparagus. Perfect post-workout fuel.',
      restaurantId: macroKitchen.id,
      primaryImageUrl: 'https://images.unsplash.com/photo-1544025162-8311090333be?auto=format&fit=crop&q=80&w=800',
      baseCalories: 520,
      baseProtein: 48,
      baseCarbs: 52,
      baseFats: 12,
      basePrice: 12.99,
      proteinBoostAvailable: true,
      proteinBoostAmount: 30,
      proteinBoostPrice: 3.00,
      mealType: 'dinner',
      dietaryTags: JSON.stringify(['high_protein', 'post_workout', 'gluten_free']),
      rating: 4.8,
      totalRatings: 320,
      macroAccuracyScore: 97,
    },
    {
      id: 'meal-002',
      name: 'Grilled Salmon & Quinoa Bowl',
      description: 'Wild-caught atlantic salmon on a bed of tri-color quinoa with lemon herb vinaigrette.',
      restaurantId: fitBites.id,
      primaryImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
      baseCalories: 480,
      baseProtein: 42,
      baseCarbs: 48,
      baseFats: 14,
      basePrice: 14.99,
      proteinBoostAvailable: true,
      proteinBoostAmount: 25,
      proteinBoostPrice: 4.00,
      mealType: 'lunch',
      dietaryTags: JSON.stringify(['omega3', 'pescetarian', 'gluten_free']),
      rating: 4.7,
      totalRatings: 215,
      macroAccuracyScore: 96,
    },
    {
      id: 'meal-003',
      name: 'Chicken Fajita Prep Bowl',
      description: 'Spiced chicken breast with bell peppers, onions, rice, and salsa. Meal-prep approved.',
      restaurantId: macroKitchen.id,
      primaryImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      baseCalories: 410,
      baseProtein: 38,
      baseCarbs: 35,
      baseFats: 11,
      basePrice: 10.99,
      proteinBoostAvailable: true,
      proteinBoostAmount: 35,
      proteinBoostPrice: 2.50,
      mealType: 'lunch',
      dietaryTags: JSON.stringify(['high_protein', 'keto_friendly']),
      rating: 4.6,
      totalRatings: 180,
      macroAccuracyScore: 95,
    },
    {
      id: 'meal-004',
      name: 'Vegan Tempeh Power Bowl',
      description: 'Marinated tempeh with roasted broccoli, edamame, brown rice, and tahini dressing.',
      restaurantId: plantFuel.id,
      primaryImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
      baseCalories: 450,
      baseProtein: 28,
      baseCarbs: 60,
      baseFats: 16,
      basePrice: 11.50,
      proteinBoostAvailable: true,
      proteinBoostAmount: 20,
      proteinBoostPrice: 2.00,
      mealType: 'lunch',
      dietaryTags: JSON.stringify(['vegan', 'high_fiber', 'plant_protein']),
      rating: 4.5,
      totalRatings: 145,
      macroAccuracyScore: 94,
    },
  ];

  for (const meal of mealsData) {
    await prisma.meal.upsert({
      where: { id: meal.id },
      update: {},
      create: meal,
    });
  }

  // Create recipes
  const recipe1 = await prisma.recipe.upsert({
    where: { id: 'recipe-001' },
    update: {},
    create: {
      id: 'recipe-001',
      name: 'High-Protein Chicken Stir-Fry',
      description: 'Quick and easy 30-minute dinner packed with 45g protein per serving. Restaurant quality at home.',
      difficulty: 'easy',
      coverImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800',
      totalServings: 2,
      caloriesPerServing: 420,
      proteinPerServing: 45,
      carbsPerServing: 38,
      fatsPerServing: 12,
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      totalTimeMinutes: 30,
      dietaryTags: JSON.stringify(['high_protein', 'quick', 'gluten_free']),
      mealType: 'dinner',
      viewCount: 12500,
      saveCount: 3200,
      rating: 4.8,
      totalRatings: 450,
      isPublished: true,
    },
  });

  // Ingredients for recipe 1
  const recipe1Ingredients = [
    { name: 'Chicken breast', amount: 400, unit: 'g', calories: 440, protein: 82, carbs: 0, fats: 9.6, prepNotes: 'diced into 1-inch cubes', displayOrder: 1 },
    { name: 'Broccoli florets', amount: 200, unit: 'g', calories: 68, protein: 5.6, carbs: 13.6, fats: 0.8, prepNotes: 'cut into bite-sized pieces', displayOrder: 2 },
    { name: 'Red bell pepper', amount: 1, unit: 'whole', calories: 31, protein: 1, carbs: 7.5, fats: 0.3, prepNotes: 'sliced thin', displayOrder: 3 },
    { name: 'Soy sauce (low sodium)', amount: 3, unit: 'tbsp', calories: 30, protein: 3, carbs: 3, fats: 0, prepNotes: null, displayOrder: 4 },
    { name: 'Garlic cloves', amount: 4, unit: 'cloves', calories: 18, protein: 0.8, carbs: 4, fats: 0.1, prepNotes: 'minced', displayOrder: 5 },
    { name: 'Fresh ginger', amount: 1, unit: 'tsp', calories: 2, protein: 0, carbs: 0.4, fats: 0, prepNotes: 'grated', displayOrder: 6 },
    { name: 'Sesame oil', amount: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fats: 14, prepNotes: null, displayOrder: 7 },
    { name: 'Cornstarch', amount: 1, unit: 'tbsp', calories: 30, protein: 0, carbs: 7, fats: 0, prepNotes: 'for sauce thickening', displayOrder: 8 },
    { name: 'Brown rice (cooked)', amount: 200, unit: 'g', calories: 216, protein: 5, carbs: 45, fats: 1.8, prepNotes: null, displayOrder: 9 },
    { name: 'Spring onions', amount: 3, unit: 'stalks', calories: 10, protein: 0.5, carbs: 2, fats: 0, prepNotes: 'sliced for garnish', displayOrder: 10 },
  ];

  await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe1.id } });
  for (const ing of recipe1Ingredients) {
    await prisma.recipeIngredient.create({ data: { ...ing, recipeId: recipe1.id } });
  }

  // Steps for recipe 1
  const recipe1Steps = [
    { stepNumber: 1, title: 'Prep the chicken', instruction: 'Cut chicken breast into 1-inch cubes. Pat completely dry with paper towels to ensure maximum browning. Season generously with salt, pepper, and a pinch of cornstarch. Toss to coat.', proTip: 'Dry chicken = better browning! The cornstarch creates a light crispy coating.', timerSeconds: null },
    { stepNumber: 2, title: 'Mix the sauce', instruction: 'In a small bowl, whisk together soy sauce, minced garlic, grated ginger, and 1 tsp cornstarch dissolved in 2 tbsp water. Set aside.', proTip: null, timerSeconds: null },
    { stepNumber: 3, title: 'Heat the wok', instruction: 'Heat wok or large non-stick pan over high heat for 2 minutes until smoking hot. Add sesame oil and swirl to coat.', proTip: 'A screaming hot wok is the #1 secret to restaurant-quality stir-fry.', timerSeconds: 120 },
    { stepNumber: 4, title: 'Sear the chicken', instruction: 'Add chicken in a SINGLE LAYER — do not overcrowd. Cook undisturbed for 2 minutes until golden. Toss and cook 2 more minutes until cooked through. Remove from pan and set aside.', proTip: 'Resist the urge to stir! Let it sear for a crust.', timerSeconds: 240 },
    { stepNumber: 5, title: 'Stir-fry the vegetables', instruction: 'Add broccoli and bell pepper to the hot wok. Stir-fry for 3-4 minutes until tender-crisp and slightly charred. Return chicken to the pan.', proTip: 'You want a slight char on the veggies — that\'s flavor!', timerSeconds: 210 },
    { stepNumber: 6, title: 'Add sauce & serve', instruction: 'Pour sauce over everything. Toss vigorously for 30 seconds until sauce coats everything and thickens. Serve immediately over brown rice. Garnish with spring onions.', proTip: 'Move fast — the sauce thickens quickly!', timerSeconds: 30 },
  ];

  await prisma.recipeStep.deleteMany({ where: { recipeId: recipe1.id } });
  for (const step of recipe1Steps) {
    await prisma.recipeStep.create({ data: { ...step, recipeId: recipe1.id } });
  }

  const recipe2 = await prisma.recipe.upsert({
    where: { id: 'recipe-002' },
    update: {},
    create: {
      id: 'recipe-002',
      name: 'Overnight Protein Oats (3 Variations)',
      description: 'Prep once, eat breakfast all week. Three flavour variations with 30g+ protein each.',
      difficulty: 'easy',
      coverImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
      totalServings: 1,
      caloriesPerServing: 380,
      proteinPerServing: 32,
      carbsPerServing: 45,
      fatsPerServing: 10,
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      totalTimeMinutes: 5,
      dietaryTags: JSON.stringify(['high_protein', 'meal_prep', 'vegetarian']),
      mealType: 'breakfast',
      viewCount: 28000,
      saveCount: 8400,
      rating: 4.9,
      totalRatings: 890,
      isPublished: true,
    },
  });

  const recipe2Ingredients = [
    { name: 'Rolled oats', amount: 60, unit: 'g', calories: 228, protein: 6, carbs: 40, fats: 4, prepNotes: null, displayOrder: 1 },
    { name: 'Protein powder (vanilla)', amount: 30, unit: 'g', calories: 120, protein: 24, carbs: 3, fats: 1.5, prepNotes: null, displayOrder: 2 },
    { name: 'Greek yogurt (0% fat)', amount: 100, unit: 'g', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, prepNotes: null, displayOrder: 3 },
    { name: 'Almond milk (unsweetened)', amount: 150, unit: 'ml', calories: 22, protein: 0.6, carbs: 1, fats: 1.5, prepNotes: null, displayOrder: 4 },
    { name: 'Chia seeds', amount: 1, unit: 'tbsp', calories: 58, protein: 2, carbs: 4, fats: 3.5, prepNotes: null, displayOrder: 5 },
    { name: 'Banana', amount: 0.5, unit: 'whole', calories: 45, protein: 0.6, carbs: 12, fats: 0.2, prepNotes: 'sliced for topping', displayOrder: 6 },
  ];

  await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe2.id } });
  for (const ing of recipe2Ingredients) {
    await prisma.recipeIngredient.create({ data: { ...ing, recipeId: recipe2.id } });
  }

  const recipe2Steps = [
    { stepNumber: 1, title: 'Mix the base', instruction: 'Add oats, protein powder, and chia seeds to a jar or container. Mix the dry ingredients first to distribute evenly.', proTip: 'A wide-mouth mason jar works perfectly for overnight oats.', timerSeconds: null },
    { stepNumber: 2, title: 'Add wet ingredients', instruction: 'Add Greek yogurt and almond milk. Stir everything together until protein powder is fully dissolved and no clumps remain.', proTip: 'Warm the milk slightly if protein powder clumps — it dissolves much easier.', timerSeconds: null },
    { stepNumber: 3, title: 'Refrigerate overnight', instruction: 'Cover and refrigerate for a minimum of 4 hours, ideally overnight (8 hours). The oats will absorb the liquid and become creamy.', proTip: 'Prep 5 jars on Sunday for the whole week!', timerSeconds: null },
    { stepNumber: 4, title: 'Top and serve', instruction: 'In the morning, give it a stir. Add toppings — sliced banana, a drizzle of honey, or fresh berries. Eat cold or warm for 60 seconds in the microwave.', proTip: null, timerSeconds: null },
  ];

  await prisma.recipeStep.deleteMany({ where: { recipeId: recipe2.id } });
  for (const step of recipe2Steps) {
    await prisma.recipeStep.create({ data: { ...step, recipeId: recipe2.id } });
  }

  const recipe3 = await prisma.recipe.upsert({
    where: { id: 'recipe-003' },
    update: {},
    create: {
      id: 'recipe-003',
      name: 'Salmon & Sweet Potato Sheet Pan',
      description: 'One pan, minimal cleanup — omega-3 rich salmon with roasted sweet potato and green beans.',
      difficulty: 'medium',
      coverImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
      totalServings: 2,
      caloriesPerServing: 510,
      proteinPerServing: 42,
      carbsPerServing: 44,
      fatsPerServing: 18,
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      totalTimeMinutes: 35,
      dietaryTags: JSON.stringify(['high_protein', 'omega3', 'gluten_free', 'pescetarian']),
      mealType: 'dinner',
      viewCount: 9200,
      saveCount: 2100,
      rating: 4.7,
      totalRatings: 320,
      isPublished: true,
    },
  });

  const recipe3Ingredients = [
    { name: 'Salmon fillets', amount: 2, unit: 'fillets (180g each)', calories: 720, protein: 72, carbs: 0, fats: 48, prepNotes: 'skin-on', displayOrder: 1 },
    { name: 'Sweet potato', amount: 400, unit: 'g', calories: 344, protein: 5.2, carbs: 80, fats: 0.4, prepNotes: 'cubed into 1-inch pieces', displayOrder: 2 },
    { name: 'Green beans', amount: 200, unit: 'g', calories: 62, protein: 3.6, carbs: 14, fats: 0.4, prepNotes: 'trimmed', displayOrder: 3 },
    { name: 'Olive oil', amount: 2, unit: 'tbsp', calories: 240, protein: 0, carbs: 0, fats: 28, prepNotes: null, displayOrder: 4 },
    { name: 'Garlic powder', amount: 1, unit: 'tsp', calories: 10, protein: 0.5, carbs: 2, fats: 0, prepNotes: null, displayOrder: 5 },
    { name: 'Paprika', amount: 1, unit: 'tsp', calories: 6, protein: 0.3, carbs: 1.2, fats: 0.3, prepNotes: 'smoked preferred', displayOrder: 6 },
    { name: 'Lemon', amount: 1, unit: 'whole', calories: 17, protein: 0.6, carbs: 5.4, fats: 0.2, prepNotes: 'halved', displayOrder: 7 },
  ];

  await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe3.id } });
  for (const ing of recipe3Ingredients) {
    await prisma.recipeIngredient.create({ data: { ...ing, recipeId: recipe3.id } });
  }

  const recipe3Steps = [
    { stepNumber: 1, title: 'Preheat & prep sheet pan', instruction: 'Preheat oven to 220°C (425°F). Line a large sheet pan with parchment paper. If you have two sheet pans, use both for better caramelization.', proTip: 'Overcrowding = steaming, not roasting. Give everything space!', timerSeconds: null },
    { stepNumber: 2, title: 'Season and roast sweet potato', instruction: 'Toss sweet potato cubes with 1 tbsp olive oil, garlic powder, paprika, salt and pepper. Spread in a single layer on sheet pan. Roast for 15 minutes at 220°C.', proTip: 'Cut potatoes evenly so they cook at the same rate.', timerSeconds: 900 },
    { stepNumber: 3, title: 'Add green beans', instruction: 'After 15 minutes, push sweet potato to one side. Add green beans tossed in a little olive oil, salt and pepper. Roast another 5 minutes.', proTip: null, timerSeconds: 300 },
    { stepNumber: 4, title: 'Add salmon', instruction: 'Place salmon fillets skin-side down on the pan. Season with salt, pepper, and a squeeze of lemon. Roast for 10-12 minutes until salmon flakes easily with a fork.', proTip: 'Salmon is done when it turns opaque and flakes — don\'t overcook!', timerSeconds: 660 },
    { stepNumber: 5, title: 'Rest & serve', instruction: 'Remove from oven. Squeeze remaining lemon over everything. Let salmon rest for 2 minutes before serving. Plate with equal portions of vegetables.', proTip: 'Resting allows juices to redistribute — worth the wait!', timerSeconds: 120 },
  ];

  await prisma.recipeStep.deleteMany({ where: { recipeId: recipe3.id } });
  for (const step of recipe3Steps) {
    await prisma.recipeStep.create({ data: { ...step, recipeId: recipe3.id } });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   Created: ${await prisma.restaurant.count()} restaurants`);
  console.log(`   Created: ${await prisma.meal.count()} meals`);
  console.log(`   Created: ${await prisma.recipe.count()} recipes`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
