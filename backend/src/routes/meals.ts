import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { calculateMealMacros } from '../utils/macroCalculator';
import { cacheService, CacheKeys } from '../utils/cacheService';

const router = Router();
const prisma = new PrismaClient();

const parseMeal = (meal: any) => ({
  ...meal,
  galleryImages: JSON.parse(meal.galleryImages || '[]'),
  availablePortionSizes: JSON.parse(meal.availablePortionSizes || '[0.5,1,1.5,2]'),
  dietaryTags: JSON.parse(meal.dietaryTags || '[]'),
  ingredients: JSON.parse(meal.ingredients || '[]'),
  allergens: JSON.parse(meal.allergens || '[]'),
  proteinSwapOptions: JSON.parse(meal.proteinSwapOptions || '{}'),
  carbSwapOptions: JSON.parse(meal.carbSwapOptions || '{}'),
});

/**
 * GET /api/meals
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1', limit = '12', mealType, dietaryTags,
      minProtein, maxCalories, sortBy = 'rating',
    } = req.query;

    const filters = { page, limit, mealType, dietaryTags, minProtein, maxCalories, sortBy };
    const cached = await cacheService.get(CacheKeys.meals(filters));
    if (cached) return res.json(cached);

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { isActive: true };
    if (mealType) where.mealType = mealType;
    if (minProtein) where.baseProtein = { gte: parseInt(minProtein as string) };
    if (maxCalories) where.baseCalories = { lte: parseInt(maxCalories as string) };

    const orderByMap: Record<string, any> = {
      protein: { baseProtein: 'desc' },
      calories: { baseCalories: 'asc' },
      price: { basePrice: 'asc' },
      rating: { rating: 'desc' },
    };

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        include: { restaurant: { select: { id: true, name: true } } },
        orderBy: orderByMap[sortBy as string] || { rating: 'desc' },
        skip,
        take,
      }),
      prisma.meal.count({ where }),
    ]);

    // Filter by dietaryTags in-memory (SQLite doesn't support array operations)
    let filteredMeals = meals;
    if (dietaryTags) {
      const tags = (dietaryTags as string).split(',');
      filteredMeals = meals.filter((m) => {
        const mealTags = JSON.parse(m.dietaryTags || '[]');
        return tags.some((tag) => mealTags.includes(tag));
      });
    }

    const response = {
      success: true,
      data: {
        meals: filteredMeals.map(parseMeal),
        pagination: {
          total,
          page: parseInt(page as string),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    };

    await cacheService.set(CacheKeys.meals(filters), response, 300); // 5 min cache
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

/**
 * GET /api/meals/recommendations
 */
router.get('/recommendations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const tracking = await prisma.dailyTracking.findUnique({
      where: { userId_trackingDate: { userId: req.userId!, trackingDate: today } },
    });

    const consumed = tracking
      ? { protein: tracking.consumedProtein, calories: tracking.consumedCalories }
      : { protein: 0, calories: 0 };

    const remainingCalories = (user.targetCalories || 2000) - consumed.calories;
    const proteinPercentage = user.targetProtein
      ? (consumed.protein / user.targetProtein) * 100
      : 50;

    let reason = 'Balanced selection based on your goals';
    let where: any = { isActive: true, baseCalories: { lte: Math.max(remainingCalories, 300) } };

    if (proteinPercentage < 50) {
      reason = `You need more protein today — these high-protein meals can help!`;
      where.baseProtein = { gte: 35 };
    } else if (remainingCalories < 400) {
      reason = 'You\'re close to your calorie limit — here are lighter options';
      where.baseCalories = { lte: 400 };
    }

    const meals = await prisma.meal.findMany({
      where,
      include: { restaurant: { select: { id: true, name: true } } },
      orderBy: [{ baseProtein: 'desc' }, { rating: 'desc' }],
      take: 6,
    });

    return res.json({
      success: true,
      data: { reason, recommendedMeals: meals.map(parseMeal) },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * GET /api/meals/:id
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const cached = await cacheService.get(CacheKeys.meal(req.params.id));
    if (cached) return res.json(cached);

    const meal = await prisma.meal.findUnique({
      where: { id: req.params.id },
      include: { restaurant: true },
    });

    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const response = { success: true, data: parseMeal(meal) };
    await cacheService.set(CacheKeys.meal(req.params.id), response, 600);
    return res.json(response);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch meal' });
  }
});

/**
 * GET /api/meals/:id/calculate
 * Calculate macros for a customized meal
 */
router.post('/:id/calculate', async (req: Request, res: Response) => {
  try {
    const meal = await prisma.meal.findUnique({ where: { id: req.params.id } });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const { portionSize = 1, proteinBoost = false } = req.body;

    const macros = calculateMealMacros(meal, { portionSize, proteinBoost });
    const price = meal.basePrice * portionSize + (proteinBoost && meal.proteinBoostPrice ? meal.proteinBoostPrice : 0);

    return res.json({
      success: true,
      data: {
        customization: { portionSize, proteinBoost },
        nutrition: macros,
        price: parseFloat(price.toFixed(2)),
      },
    });
  } catch {
    return res.status(500).json({ error: 'Calculation failed' });
  }
});

export default router;
