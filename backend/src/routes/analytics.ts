import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/:userId/weekly
 */
router.get('/:userId/weekly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Last 7 days
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const tracking = await prisma.dailyTracking.findMany({
      where: {
        userId: req.params.userId,
        trackingDate: { gte: dates[0], lte: dates[6] },
      },
    });

    const trackingMap = new Map(tracking.map((t) => [t.trackingDate, t]));

    const targets = {
      calories: user.targetCalories || 2000,
      protein: user.targetProtein || 150,
      carbs: user.targetCarbs || 250,
      fats: user.targetFats || 65,
    };

    const dailyData = dates.map((date) => {
      const t = trackingMap.get(date);
      return {
        date,
        consumed: {
          calories: t?.consumedCalories || 0,
          protein: t?.consumedProtein || 0,
          carbs: t?.consumedCarbs || 0,
          fats: t?.consumedFats || 0,
        },
        targets,
        goalMet: t?.goalMet || false,
      };
    });

    const activeDays = dailyData.filter((d) => d.consumed.calories > 0);
    const weeklyAverages = activeDays.length
      ? {
          calories: Math.round(activeDays.reduce((s, d) => s + d.consumed.calories, 0) / activeDays.length),
          protein: Math.round(activeDays.reduce((s, d) => s + d.consumed.protein, 0) / activeDays.length),
          carbs: Math.round(activeDays.reduce((s, d) => s + d.consumed.carbs, 0) / activeDays.length),
          fats: Math.round(activeDays.reduce((s, d) => s + d.consumed.fats, 0) / activeDays.length),
        }
      : { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const adherenceRate = dailyData.length
      ? Math.round((dailyData.filter((d) => d.goalMet).length / dailyData.length) * 100)
      : 0;

    return res.json({
      success: true,
      data: {
        weekStart: dates[0],
        weekEnd: dates[6],
        dailyData,
        weeklyAverages,
        adherenceRate,
        streak: user.streakCount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch weekly analytics' });
  }
});

/**
 * GET /api/analytics/:userId/monthly
 */
router.get('/:userId/monthly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = today.toISOString().split('T')[0];

    const tracking = await prisma.dailyTracking.findMany({
      where: {
        userId: req.params.userId,
        trackingDate: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { trackingDate: 'asc' },
    });

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });

    const totalDays = tracking.length;
    const goalMetDays = tracking.filter((t) => t.goalMet).length;

    const avgCalories = totalDays
      ? Math.round(tracking.reduce((s, t) => s + t.consumedCalories, 0) / totalDays)
      : 0;

    return res.json({
      success: true,
      data: {
        month: startOfMonth.slice(0, 7),
        totalDaysTracked: totalDays,
        goalMetDays,
        adherenceRate: totalDays ? Math.round((goalMetDays / totalDays) * 100) : 0,
        averageCalories: avgCalories,
        streak: user?.streakCount || 0,
        dailyBreakdown: tracking.map((t) => ({
          date: t.trackingDate,
          calories: t.consumedCalories,
          protein: t.consumedProtein,
          goalMet: t.goalMet,
        })),
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
});

export default router;
