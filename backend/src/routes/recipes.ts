import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { cacheService, CacheKeys } from '../utils/cacheService';

const router = Router();
const prisma = new PrismaClient();

const parseRecipe = (recipe: any) => ({
  ...recipe,
  dietaryTags: JSON.parse(recipe.dietaryTags || '[]'),
});

/**
 * GET /api/recipes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1', limit = '12', difficulty, mealType,
      dietaryTags, maxPrepTime, sortBy = 'rating',
    } = req.query;

    const filters = { page, limit, difficulty, mealType, dietaryTags, maxPrepTime, sortBy };
    const cached = await cacheService.get(CacheKeys.recipes(filters));
    if (cached) return res.json(cached);

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { isPublished: true };
    if (difficulty) where.difficulty = difficulty;
    if (mealType) where.mealType = mealType;
    if (maxPrepTime) where.totalTimeMinutes = { lte: parseInt(maxPrepTime as string) };

    const orderByMap: Record<string, any> = {
      rating: { rating: 'desc' },
      views: { viewCount: 'desc' },
      saves: { saveCount: 'desc' },
      newest: { createdAt: 'desc' },
    };

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          _count: { select: { ingredients: true, steps: true } },
        },
        orderBy: orderByMap[sortBy as string] || { rating: 'desc' },
        skip,
        take,
      }),
      prisma.recipe.count({ where }),
    ]);

    let filteredRecipes = recipes;
    if (dietaryTags) {
      const tags = (dietaryTags as string).split(',');
      filteredRecipes = recipes.filter((r) => {
        const recipeTags = JSON.parse(r.dietaryTags || '[]');
        return tags.some((tag) => recipeTags.includes(tag));
      });
    }

    const response = {
      success: true,
      data: {
        recipes: filteredRecipes.map((r) => ({
          ...parseRecipe(r),
          ingredientCount: r._count.ingredients,
          stepCount: r._count.steps,
        })),
        pagination: {
          total,
          page: parseInt(page as string),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    };

    await cacheService.set(CacheKeys.recipes(filters), response, 300);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

/**
 * GET /api/recipes/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: { _count: { select: { ingredients: true, steps: true } } },
      take: 20,
    });

    return res.json({
      success: true,
      data: { recipes: recipes.map(parseRecipe) },
    });
  } catch {
    return res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/recipes/saved/:userId
 */
router.get('/saved/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const saved = await prisma.savedRecipe.findMany({
      where: { userId: req.params.userId },
      include: { recipe: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { savedRecipes: saved.map((s) => ({ ...parseRecipe(s.recipe), savedAt: s.createdAt, personalNotes: s.personalNotes, timesCoded: s.timesCoded })) },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch saved recipes' });
  }
});

/**
 * GET /api/recipes/:id
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cached = await cacheService.get(CacheKeys.recipe(req.params.id));

    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: {
        ingredients: { orderBy: { displayOrder: 'asc' } },
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    // Increment view count (fire and forget)
    prisma.recipe.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    let userSaved = false;
    let userRating = null;
    if (req.userId) {
      const savedEntry = await prisma.savedRecipe.findUnique({
        where: { userId_recipeId: { userId: req.userId, recipeId: req.params.id } },
      });
      userSaved = !!savedEntry;
    }

    const response = {
      success: true,
      data: {
        recipe: {
          ...parseRecipe(recipe),
          stats: {
            views: recipe.viewCount,
            saves: recipe.saveCount,
            rating: recipe.rating,
            totalRatings: recipe.totalRatings,
            userSaved,
            userRating,
          },
        },
      },
    };

    await cacheService.set(CacheKeys.recipe(req.params.id), response, 300);
    return res.json(response);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

/**
 * POST /api/recipes/:id/save — Save recipe
 */
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.savedRecipe.create({
      data: { userId: req.userId!, recipeId: req.params.id },
    });
    await prisma.recipe.update({
      where: { id: req.params.id },
      data: { saveCount: { increment: 1 } },
    });
    await cacheService.del(CacheKeys.recipe(req.params.id));
    return res.json({ success: true, message: 'Recipe saved' });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already saved' });
    return res.status(500).json({ error: 'Failed to save recipe' });
  }
});

/**
 * DELETE /api/recipes/:id/save — Unsave recipe
 */
router.delete('/:id/save', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.savedRecipe.delete({
      where: { userId_recipeId: { userId: req.userId!, recipeId: req.params.id } },
    });
    await prisma.recipe.update({
      where: { id: req.params.id },
      data: { saveCount: { decrement: 1 } },
    });
    await cacheService.del(CacheKeys.recipe(req.params.id));
    return res.json({ success: true, message: 'Recipe unsaved' });
  } catch {
    return res.status(500).json({ error: 'Failed to unsave recipe' });
  }
});

/**
 * POST /api/recipes/:id/rate
 */
router.post('/:id/rate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const newTotal = recipe.totalRatings + 1;
    const newRating = parseFloat(
      ((recipe.rating * recipe.totalRatings + rating) / newTotal).toFixed(1)
    );

    await prisma.recipe.update({
      where: { id: req.params.id },
      data: { rating: newRating, totalRatings: newTotal },
    });

    await cacheService.del(CacheKeys.recipe(req.params.id));
    return res.json({ success: true, data: { newRating } });
  } catch {
    return res.status(500).json({ error: 'Failed to rate recipe' });
  }
});

/**
 * POST /api/recipes/:id/cooked
 * Mark as cooked + adds macros to daily tracking
 */
router.post('/:id/cooked', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { cookedDate, notes, portionsMade = 1 } = req.body;
    const trackingDate = cookedDate || new Date().toISOString().split('T')[0];
    const userId = req.userId!;

    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    // Calculate macros to add
    const servingsToAdd = Math.min(portionsMade, recipe.totalServings);
    const macros = {
      calories: Math.round((recipe.caloriesPerServing || 0) * servingsToAdd),
      protein: Math.round((recipe.proteinPerServing || 0) * servingsToAdd),
      carbs: Math.round((recipe.carbsPerServing || 0) * servingsToAdd),
      fats: Math.round((recipe.fatsPerServing || 0) * servingsToAdd),
    };

    // Upsert daily tracking
    await prisma.dailyTracking.upsert({
      where: { userId_trackingDate: { userId, trackingDate } },
      create: {
        userId,
        trackingDate,
        consumedCalories: macros.calories,
        consumedProtein: macros.protein,
        consumedCarbs: macros.carbs,
        consumedFats: macros.fats,
        mealIds: JSON.stringify([recipe.id]),
      },
      update: {
        consumedCalories: { increment: macros.calories },
        consumedProtein: { increment: macros.protein },
        consumedCarbs: { increment: macros.carbs },
        consumedFats: { increment: macros.fats },
      },
    });

    // Update SavedRecipe cook count
    try {
      await prisma.savedRecipe.update({
        where: { userId_recipeId: { userId, recipeId: req.params.id } },
        data: {
          lastCookedDate: trackingDate,
          timesCoded: { increment: 1 },
          ...(notes && { personalNotes: notes }),
        },
      });
    } catch {
      // Not saved — that's fine
    }

    await cacheService.delPattern(`tracking:${userId}:*`);

    return res.json({
      success: true,
      data: {
        message: `Added ${macros.protein}g protein to your daily tracking!`,
        macrosAdded: macros,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to log cooked meal' });
  }
});

/**
 * POST /api/recipes — Create recipe
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, description, difficulty, coverImageUrl, videoTutorialUrl,
      totalServings, caloriesPerServing, proteinPerServing, carbsPerServing, fatsPerServing,
      prepTimeMinutes, cookTimeMinutes, totalTimeMinutes,
      dietaryTags, mealType, cuisineType,
      ingredients = [], steps = [],
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Recipe name is required' });

    const recipe = await prisma.recipe.create({
      data: {
        name, description, difficulty: difficulty || 'easy',
        coverImageUrl, videoTutorialUrl,
        totalServings, caloriesPerServing, proteinPerServing, carbsPerServing, fatsPerServing,
        prepTimeMinutes, cookTimeMinutes, totalTimeMinutes,
        dietaryTags: JSON.stringify(dietaryTags || []),
        mealType, cuisineType,
        createdById: req.userId,
        ingredients: { create: ingredients },
        steps: { create: steps },
      },
      include: { ingredients: true, steps: true },
    });

    return res.status(201).json({ success: true, data: parseRecipe(recipe) });
  } catch {
    return res.status(500).json({ error: 'Failed to create recipe' });
  }
});

export default router;
