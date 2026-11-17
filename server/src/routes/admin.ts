import { Router } from 'express';
import {
  getAllUsers,
  createUserByAdmin,
  deleteUserByAdmin,
  deleteAnyBookByAdmin,
  getAdminStats,
} from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);
router.delete('/books/:id', deleteAnyBookByAdmin);

export default router;
