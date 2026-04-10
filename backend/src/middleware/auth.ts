import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
}

// Generate JWT tokens
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return { userId: decoded.userId };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return { userId: decoded.userId };
};

// Middleware: require valid access token
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware: optional auth (does not block unauthenticated requests)
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { userId } = verifyAccessToken(authHeader.substring(7));
      req.userId = userId;
    } catch {
      // ignore invalid token — just proceed as guest
    }
  }
  next();
};
