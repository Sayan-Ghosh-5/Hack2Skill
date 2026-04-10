import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  calculateTDEE,
  calculateMacros,
  calculateAllGoalMacros,
  ActivityLevel,
  Goal,
  Gender,
} from '../utils/macroCalculator';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/users/me
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Silent Break Check
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastGoalMetDate) {
      const todayDate = new Date(todayStr);
      const lastMet = new Date(user.lastGoalMetDate);
      const diffDays = Math.floor((todayDate.getTime() - lastMet.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays > 1 && user.streakCount > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { streakCount: 0 },
        });
      }
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        profile: {
          age: user.age,
          weight: user.weightKg,
          height: user.heightCm,
          gender: user.gender,
          activityLevel: user.activityLevel,
        },
        goals: {
          currentGoal: user.currentGoal,
          tdee: user.tdee,
          macroTargets: {
            calories: user.targetCalories,
            protein: user.targetProtein,
            carbs: user.targetCarbs,
            fats: user.targetFats,
          },
        },
        streak: user.streakCount,
        lastActiveDate: user.lastActiveDate,
        totalMeals: user.totalMeals,
        dietaryRestrictions: JSON.parse(user.dietaryRestrictions),
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PATCH /api/users/me
 */
router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName, lastName, age, weightKg, heightCm,
      gender, activityLevel, dietaryRestrictions,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(age !== undefined && { age }),
        ...(weightKg !== undefined && { weightKg }),
        ...(heightCm !== undefined && { heightCm }),
        ...(gender !== undefined && { gender }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(dietaryRestrictions !== undefined && {
          dietaryRestrictions: JSON.stringify(dietaryRestrictions),
        }),
      },
    });

    return res.json({ success: true, data: { id: updated.id, email: updated.email } });
  } catch {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * POST /api/users/calculate-macros
 */
router.post('/calculate-macros', async (req: AuthRequest, res: Response) => {
  try {
    const { age, weight, height, gender, activityLevel, goal } = req.body;

    if (!age || !weight || !height || !gender || !activityLevel) {
      return res.status(400).json({ error: 'All biometric fields are required' });
    }

    const tdee = calculateTDEE(weight, height, age, gender as Gender, activityLevel as ActivityLevel);
    const allGoalMacros = calculateAllGoalMacros(tdee, weight);

    return res.json({
      success: true,
      data: {
        tdee,
        macros: allGoalMacros,
        ...(goal && { recommendedMacros: allGoalMacros[goal as Goal] }),
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to calculate macros' });
  }
});

/**
 * PATCH /api/users/goal
 */
router.patch('/goal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goal } = req.body;
    if (!['cutting', 'bulking', 'maintenance'].includes(goal)) {
      return res.status(400).json({ error: 'Invalid goal value' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.weightKg || !user.heightCm || !user.age || !user.gender || !user.activityLevel) {
      return res.status(400).json({ error: 'Complete your profile biometrics first' });
    }

    const tdee = calculateTDEE(
      user.weightKg,
      user.heightCm,
      user.age,
      user.gender as Gender,
      user.activityLevel as ActivityLevel
    );
    const macros = calculateMacros(tdee, goal as Goal, user.weightKg);

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        currentGoal: goal,
        tdee,
        targetCalories: macros.calories,
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFats: macros.fats,
      },
    });

    return res.json({
      success: true,
      data: {
        currentGoal: updated.currentGoal,
        tdee: updated.tdee,
        macroTargets: {
          calories: updated.targetCalories,
          protein: updated.targetProtein,
          carbs: updated.targetCarbs,
          fats: updated.targetFats,
        },
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to update goal' });
  }
});

/**
 * POST /api/users/setup
 * One-shot endpoint for onboarding — sets profile + calculates macros
 */
router.post('/setup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { age, weight, height, gender, activityLevel, goal } = req.body;

    if (!age || !weight || !height || !gender || !activityLevel || !goal) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const tdee = calculateTDEE(weight, height, age, gender as Gender, activityLevel as ActivityLevel);
    const macros = calculateMacros(tdee, goal as Goal, weight);

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        age,
        weightKg: weight,
        heightCm: height,
        gender,
        activityLevel,
        currentGoal: goal,
        tdee,
        targetCalories: macros.calories,
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFats: macros.fats,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
    });

    return res.json({
      success: true,
      data: {
        tdee,
        macroTargets: macros,
        currentGoal: updated.currentGoal,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Setup failed' });
  }
});

export default router;
