import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/orders — Create order from cart
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      userId, items, deliveryAddress, deliveryDate,
      deliveryTimeSlot, specialInstructions,
    } = req.body;

    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const subtotal = parseFloat(
      items.reduce((sum: number, i: any) => sum + i.price, 0).toFixed(2)
    );
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const deliveryFee = subtotal >= 30 ? 0 : 4.99;
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        deliveryAddress,
        deliveryDate,
        deliveryTimeSlot,
        specialInstructions,
        subtotal, tax,
        deliveryFee,
        total,
        paymentStatus: 'pending',
        items: {
          create: items.map((item: any) => ({
            mealId: item.meal?.id || item.mealId,
            portionSize: item.customizations?.portionSize || 1,
            proteinBoostAdded: item.customizations?.proteinBoost || false,
            calories: item.calculatedNutrition?.calories,
            protein: item.calculatedNutrition?.protein,
            carbs: item.calculatedNutrition?.carbs,
            fats: item.calculatedNutrition?.fats,
            unitPrice: item.price,
            quantity: 1,
            totalPrice: item.price,
          })),
        },
      },
      include: { items: { include: { meal: { select: { id: true, name: true, primaryImageUrl: true } } } } },
    });

    // Update user's total meals count
    await prisma.user.update({
      where: { id: userId },
      data: { totalMeals: { increment: items.length } },
    });

    return res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/orders/:userId — User's order history
 */
router.get('/user/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      include: {
        items: {
          include: { meal: { select: { id: true, name: true, primaryImageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: { orders } });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:orderId — Specific order
 */
router.get('/:orderId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        items: {
          include: { meal: true },
        },
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ success: true, data: { order } });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PATCH /api/orders/:orderId/cancel
 */
router.patch('/:orderId/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status: 'cancelled' },
    });

    return res.json({ success: true, data: { order: updated } });
  } catch {
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
