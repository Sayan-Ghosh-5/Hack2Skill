import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { cacheService, CacheKeys } from '../utils/cacheService';

const router = Router();
const prisma = new PrismaClient();

const getToday = () => new Date().toISOString().split('T')[0];

const buildResponse = (tracking: any, user: any) => {
  const targets = {
    calories: user.targetCalories || 2000,
    protein: user.targetProtein || 150,
    carbs: user.targetCarbs || 250,
    fats: user.targetFats || 65,
  };

  const consumed = {
    calories: tracking?.consumedCalories || 0,
    protein: tracking?.consumedProtein || 0,
    carbs: tracking?.consumedCarbs || 0,
    fats: tracking?.consumedFats || 0,
  };

  const remaining = {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fats: Math.max(0, targets.fats - consumed.fats),
  };

  const percentages = {
    calories: Math.round((consumed.calories / targets.calories) * 100),
    protein: Math.round((consumed.protein / targets.protein) * 100),
    carbs: Math.round((consumed.carbs / targets.carbs) * 100),
    fats: Math.round((consumed.fats / targets.fats) * 100),
  };

  return { consumed, targets, remaining, percentages };
};

/**
 * GET /api/tracking/:userId/today
 */
router.get('/:userId/today', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const today = getToday();
    const cacheKey = CacheKeys.tracking(req.params.userId, today);
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const [user, tracking] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.params.userId } }),
      prisma.dailyTracking.findUnique({
        where: { userId_trackingDate: { userId: req.params.userId, trackingDate: today } },
      }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { consumed, targets, remaining, percentages } = buildResponse(tracking, user);

    const response = {
      success: true,
      data: {
        date: today,
        consumed, targets, remaining, percentages,
        goalMet: tracking?.goalMet || false,
        mealsLogged: JSON.parse(tracking?.mealIds || '[]'),
      },
    };

    await cacheService.set(cacheKey, response, 60); // short cache
    return res.json(response);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch tracking' });
  }
});

/**
 * POST /api/tracking/:userId/log-meal — Manually log macros
 */
router.post('/:userId/log-meal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const { calories = 0, protein = 0, carbs = 0, fats = 0, mealId, date } = req.body;
    const trackingDate = date || getToday();
    const userId = req.params.userId;

    const tracking = await prisma.dailyTracking.upsert({
      where: { userId_trackingDate: { userId, trackingDate } },
      create: {
        userId, trackingDate,
        consumedCalories: calories,
        consumedProtein: protein,
        consumedCarbs: carbs,
        consumedFats: fats,
        mealIds: JSON.stringify(mealId ? [mealId] : []),
      },
      update: {
        consumedCalories: { increment: calories },
        consumedProtein: { increment: protein },
        consumedCarbs: { increment: carbs },
        consumedFats: { increment: fats },
      },
    });

    await cacheService.del(CacheKeys.tracking(userId, trackingDate));

    return res.json({
      success: true,
      data: {
        date: trackingDate,
        consumed: {
          calories: tracking.consumedCalories,
          protein: tracking.consumedProtein,
          carbs: tracking.consumedCarbs,
          fats: tracking.consumedFats,
        },
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to log meal' });
  }
});

/**
 * POST /api/tracking/:userId/complete-day — Mark day as goal met
 */
router.post('/:userId/complete-day', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
    const trackingDate = getToday();
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.dailyTracking.updateMany({
      where: { userId, trackingDate },
      data: { goalMet: true },
    });

    let newStreak = user.streakCount;
    if (user.lastGoalMetDate) {
      const todayDate = new Date(trackingDate);
      const lastMet = new Date(user.lastGoalMetDate);
      const diffDays = Math.floor((todayDate.getTime() - lastMet.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        newStreak++; // Continuation
      } else if (diffDays > 1) {
        newStreak = 1; // Break - restart at 1 for today
      }
      // If diffDays === 0, do nothing (Same day)
    } else {
      newStreak = 1; // First time
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { streakCount: newStreak, lastGoalMetDate: trackingDate },
    });

    await cacheService.del(CacheKeys.tracking(userId, trackingDate));

    return res.json({
      success: true,
      data: {
        streakCount: updatedUser.streakCount,
        lastGoalMetDate: updatedUser.lastGoalMetDate,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to complete day' });
  }
});

/**
 * GET /api/tracking/:userId/history
 */
router.get('/:userId/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const { startDate, endDate } = req.query;

    const history = await prisma.dailyTracking.findMany({
      where: {
        userId: req.params.userId,
        ...(startDate && endDate && {
          trackingDate: {
            gte: startDate as string,
            lte: endDate as string,
          },
        }),
      },
      orderBy: { trackingDate: 'desc' },
      take: 90,
    });

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });

    return res.json({
      success: true,
      data: {
        history: history.map((h) => ({
          date: h.trackingDate,
          consumed: {
            calories: h.consumedCalories,
            protein: h.consumedProtein,
            carbs: h.consumedCarbs,
            fats: h.consumedFats,
          },
          targets: {
            calories: user?.targetCalories || 0,
            protein: user?.targetProtein || 0,
            carbs: user?.targetCarbs || 0,
            fats: user?.targetFats || 0,
          },
          goalMet: h.goalMet,
        })),
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/tracking/:userId/streak
 */
router.get('/:userId/streak', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      success: true,
      data: {
        currentStreak: user.streakCount,
        lastActiveDate: user.lastActiveDate,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

export default router;
