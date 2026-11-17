import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { sendExchangeNotificationEmail } from "../config/mailer";

export const requestExchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { bookId } = req.params;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
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

    if (!book) {
      throw new AppError("Target book not found.", 404);
    }

    // Guard: Users cannot request exchange for their own books
    if (book.ownerId === req.user.id) {
      throw new AppError("Cannot request an exchange for your own book.", 400);
    }

    // Fetch requester's available books
    const requesterBooks = await prisma.book.findMany({
      where: { ownerId: req.user.id },
      select: {
        title: true,
        author: true,
      },
    });

    // Send email notification to the book's owner
    let emailResult = { messageId: 'local-dispatch', previewUrl: undefined as string | undefined };
    try {
      emailResult = await sendExchangeNotificationEmail({
        toEmail: book.owner.email,
        toOwnerName: book.owner.name,
        bookTitle: book.title,
        requesterName: req.user.name,
        requesterEmail: req.user.email,
        requesterBooks,
      });
    } catch (mailError) {
      console.warn('[Exchange Request] Notification email failed to send:', mailError);
    }

    // Record request in database
    const exchangeRequest = await prisma.exchangeRequest.create({
      data: {
        fromUserId: req.user.id,
        toBookId: book.id,
        status: "PENDING",
      },
      include: {
        toBook: {
          select: {
            id: true,
            title: true,
            author: true,
            photoUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message:
        "Exchange request sent successfully! An email notification has been dispatched to the owner.",
      previewUrl: emailResult.previewUrl,
      data: exchangeRequest,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    // 1. Requests sent by me
    const sent = await prisma.exchangeRequest.findMany({
      where: { fromUserId: req.user.id },
      include: {
        toBook: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Requests received for my books
    const received = await prisma.exchangeRequest.findMany({
      where: {
        toBook: {
          ownerId: req.user.id,
        },
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        toBook: {
          select: { id: true, title: true, author: true, photoUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      sent,
      received,
    });
  } catch (err) {
    next(err);
  }
};

const updateStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export const updateRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const request = await prisma.exchangeRequest.findUnique({
      where: { id },
      include: {
        toBook: true,
      },
    });

    if (!request) {
      throw new AppError("Exchange request not found", 404);
    }

    // Only the owner of the book can accept or reject the request
    if (request.toBook.ownerId !== req.user.id) {
      throw new AppError(
        "Forbidden: Only the book owner can update this request.",
        403,
      );
    }

    const updated = await prisma.exchangeRequest.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: `Exchange request ${status.toLowerCase()} successfully`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
