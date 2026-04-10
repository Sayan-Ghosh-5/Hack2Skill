import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { calculateTDEE, calculateMacros } from '../utils/macroCalculator';
import {
  generateTokens,
  verifyRefreshToken,
  authMiddleware,
  AuthRequest,
} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER');

/**
 * POST /api/auth/google
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      console.error('Google token verification failed:', e);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    if (!payload?.email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: payload.sub }, { email: payload.email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.sub,
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          profileImage: payload.picture || '',
          passwordHash: '', // No password for OAuth users
        },
      });
    } else if (!user.googleId) {
      // Link account if email matches but no googleId
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, profileImage: payload.picture },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          currentGoal: user.currentGoal,
          profileImage: user.profileImage,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});


/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          currentGoal: user.currentGoal,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch {
    return res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/refresh-token
 */
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const { userId } = verifyRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = generateTokens(userId);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({ success: true, data: { tokens } });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
