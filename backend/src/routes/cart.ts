import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { calculateMealMacros } from '../utils/macroCalculator';

const router = Router();
const prisma = new PrismaClient();

// In-memory cart store per user (persists until server restart)
// In production, use Redis or store in DB
const cartStore = new Map<string, any[]>();

const getCart = (userId: string) => cartStore.get(userId) || [];

const computeCartTotals = (items: any[]) => ({
  subtotal: parseFloat(items.reduce((sum, i) => sum + i.price, 0).toFixed(2)),
  itemCount: items.length,
  totalNutrition: {
    calories: items.reduce((sum, i) => sum + (i.calculatedNutrition?.calories || 0), 0),
    protein: items.reduce((sum, i) => sum + (i.calculatedNutrition?.protein || 0), 0),
    carbs: items.reduce((sum, i) => sum + (i.calculatedNutrition?.carbs || 0), 0),
    fats: items.reduce((sum, i) => sum + (i.calculatedNutrition?.fats || 0), 0),
  },
});

/**
 * GET /api/cart/:userId
 */
router.get('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  const items = getCart(req.params.userId);
  return res.json({
    success: true,
    data: { cart: { items, totals: computeCartTotals(items) } },
  });
});

/**
 * POST /api/cart/add
 */
router.post('/add', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, mealId, customizations } = req.body;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const { portionSize = 1, proteinBoost = false } = customizations || {};
    const nutrition = calculateMealMacros(meal, { portionSize, proteinBoost });
    const price = parseFloat(
      (meal.basePrice * portionSize + (proteinBoost && meal.proteinBoostPrice ? meal.proteinBoostPrice : 0)).toFixed(2)
    );

    const cartItem = {
      id: Math.random().toString(36).substr(2, 9),
      meal: {
        id: meal.id,
        name: meal.name,
        image: meal.primaryImageUrl,
        restaurant: meal.restaurant,
      },
      customizations: { portionSize, proteinBoost },
      calculatedNutrition: nutrition,
      price,
    };

    const items = getCart(userId);
    items.push(cartItem);
    cartStore.set(userId, items);

    // Get daily tracking for macro impact
    const today = new Date().toISOString().split('T')[0];
    const tracking = await prisma.dailyTracking.findUnique({
      where: { userId_trackingDate: { userId, trackingDate: today } },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const currentConsumed = {
      protein: tracking?.consumedProtein || 0,
      carbs: tracking?.consumedCarbs || 0,
      fats: tracking?.consumedFats || 0,
      calories: tracking?.consumedCalories || 0,
    };

    return res.json({
      success: true,
      data: {
        cart: { items, totals: computeCartTotals(items) },
        macroImpact: {
          currentConsumed,
          afterAdding: {
            protein: currentConsumed.protein + nutrition.protein,
            carbs: currentConsumed.carbs + nutrition.carbs,
            fats: currentConsumed.fats + nutrition.fats,
            calories: currentConsumed.calories + nutrition.calories,
          },
          remaining: {
            protein: Math.max(0, (user?.targetProtein || 0) - currentConsumed.protein - nutrition.protein),
            carbs: Math.max(0, (user?.targetCarbs || 0) - currentConsumed.carbs - nutrition.carbs),
            fats: Math.max(0, (user?.targetFats || 0) - currentConsumed.fats - nutrition.fats),
          },
          warnings: nutrition.calories + currentConsumed.calories > (user?.targetCalories || 0)
            ? ['Exceeds daily calorie target']
            : [],
        },
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
});

/**
 * DELETE /api/cart/item/:itemId
 */
router.delete('/item/:itemId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { userId } = req.query as { userId: string };
  if (!userId || req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  const items = getCart(userId).filter((i) => i.id !== req.params.itemId);
  cartStore.set(userId, items);

  return res.json({
    success: true,
    data: { cart: { items, totals: computeCartTotals(items) } },
  });
});

/**
 * DELETE /api/cart/:userId/clear
 */
router.delete('/:userId/clear', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
  cartStore.set(req.params.userId, []);
  return res.json({ success: true, data: { cart: { items: [], totals: computeCartTotals([]) } } });
});

export default router;
