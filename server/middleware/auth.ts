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
  // No authentication required for personal app
  // Set default user
  req.user = { id: 1, username: 'personal_user', email: 'user@personal.app' };
  next();
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Set default user for personal app
  req.user = { id: 1, username: 'personal_user', email: 'user@personal.app' };
  next();
};