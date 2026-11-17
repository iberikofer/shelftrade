import { Router } from 'express';
import { getMyBooks, deleteMyBook, updateMyProfile } from '../controllers/me.controller';
import { createBook } from '../controllers/books.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/books', getMyBooks);
router.post('/books', upload.single('photo'), createBook);
router.delete('/books/:id', deleteMyBook);
router.patch('/profile', upload.single('avatar'), updateMyProfile);

export default router;
