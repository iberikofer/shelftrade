import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Authentication required.', 401));
    }

    if (req.user.role !== role) {
      return next(new AppError(`Forbidden: Requires ${role} privileges.`, 403));
    }

    next();
  };
};
