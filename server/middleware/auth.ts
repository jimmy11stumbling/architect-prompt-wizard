import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUser(parseInt(userId as string));
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email || '',
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (userId) {
      const user = await storage.getUser(parseInt(userId as string));
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email || '',
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};