import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';

const createBookSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(200),
  author: z.string().min(1, 'Author name is required').max(150),
  photoUrl: z.string().optional(),
});

export const getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, sort = 'asc', page = '1', limit = '8' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 8));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.BookWhereInput = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { author: { contains: term, mode: 'insensitive' } },
      ];
    }

    const sortOrder = (sort as string).toLowerCase() === 'desc' ? 'desc' : 'asc';

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          title: sortOrder,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      data: books,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            _count: {
              select: { books: true },
            },
          },
        },
      },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    res.json({ data: book });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const parsed = createBookSchema.parse(req.body);

    let photoUrl = parsed.photoUrl;
    // If a file was uploaded via multer, construct server URL
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const book = await prisma.book.create({
      data: {
        title: parsed.title.trim(),
        author: parsed.author.trim(),
        photoUrl: photoUrl || null,
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Book successfully added to shelf',
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // Role check: Only the owner or an ADMIN can delete the book
    if (book.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden: You can only delete books that you own.', 403);
    }

    await prisma.book.delete({
      where: { id },
    });

    res.json({
      message: 'Book successfully removed from shelf',
      deletedId: id,
    });
  } catch (err) {
    next(err);
  }
};

