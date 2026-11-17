import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma';
import {
  signToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/jwt';
import { AppError } from '../utils/errors';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../config/mailer';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        avatarUrl: data.avatarUrl || null,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Send welcome email to new reader
    sendWelcomeEmail({
      toEmail: user.email,
      name: user.name,
    }).catch(err => {
      console.warn('[Register] Welcome email failed to dispatch:', err);
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            requestsSent: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      user: {
        ...user,
        bookCount: user._count.books,
        requestsCount: user._count.requestsSent,
      },
    });
  } catch (err) {
    next(err);
  }
};

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      const resetToken = signPasswordResetToken(user.id, user.email);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      await sendPasswordResetEmail({
        toEmail: user.email,
        name: user.name,
        resetUrl,
      });
    }

    res.json({
      message:
        'If an account associated with this email exists, a password reset link has been dispatched.',
    });
  } catch (err) {
    next(err);
  }
};

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    let payload: { id: string; email: string };
    try {
      payload = verifyPasswordResetToken(token);
    } catch {
      throw new AppError('The password reset token is invalid or has expired.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.id },
      data: { passwordHash },
    });

    res.json({
      message: 'Your password has been successfully reset. You may now sign in.',
    });
  } catch (err) {
    next(err);
  }
};
