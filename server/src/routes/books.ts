import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  deleteBook,
} from '../controllers/books.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes
router.post('/', requireAuth, upload.single('photo'), createBook);
router.delete('/:id', requireAuth, deleteBook);

export default router;
