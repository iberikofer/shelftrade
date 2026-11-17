import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { Role } from "@prisma/client";

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [totalUsers, totalBooks, totalRequests] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.exchangeRequest.count(),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalBooks,
        totalRequests,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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

    res.json({
      data: users.map((u) => ({
        ...u,
        bookCount: u._count.books,
        requestsCount: u._count.requestsSent,
      })),
      total: users.length,
    });
  } catch (err) {
    next(err);
  }
};

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const createUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError("A user with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role as Role,
        avatarUrl: data.avatarUrl || null,
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

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      throw new AppError("Cannot delete your own administrative account.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Cascade deletes user and all their books/requests
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      message: "User and all associated books successfully deleted",
      deletedId: id,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAnyBookByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new AppError("Book not found", 404);
    }

    await prisma.book.delete({
      where: { id },
    });

    res.json({
      message: "Book successfully deleted by administrator",
      deletedId: id,
    });
  } catch (err) {
    next(err);
  }
};
