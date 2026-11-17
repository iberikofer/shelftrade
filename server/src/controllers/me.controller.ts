import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AppError } from '../utils/errors';

export const getMyBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const books = await prisma.book.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { exchangeRequests: true },
        },
      },
    });

    res.json({
      data: books,
      total: books.length,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMyBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.ownerId !== req.user.id) {
      throw new AppError('Forbidden: You can only delete your own books.', 403);
    }

    await prisma.book.delete({
      where: { id },
    });

    res.json({
      message: 'Book successfully deleted from your shelf',
      deletedId: id,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl || null,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
