import { Router } from 'express';
import { getUsers, updateUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Only ADMIN can manage users
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', getUsers);
router.patch('/:id', updateUser); // e.g. update role or status

export default router;
