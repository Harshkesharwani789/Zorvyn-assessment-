import { Router } from 'express';
import { 
  createRecord, 
  getRecords, 
  getRecordById, 
  updateRecord, 
  deleteRecord, 
  getDashboardSummary 
} from '../controllers/recordController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Everyone can view dashboard summary
router.get('/summary', authorize(['VIEWER', 'ANALYST', 'ADMIN']), getDashboardSummary);

// Analyst and Admin can view records
router.get('/', authorize(['ANALYST', 'ADMIN']), getRecords);
router.get('/:id', authorize(['ANALYST', 'ADMIN']), getRecordById);

// Only Admin can create, update, delete records
router.post('/', authorize(['ADMIN']), createRecord);
router.patch('/:id', authorize(['ADMIN']), updateRecord);
router.delete('/:id', authorize(['ADMIN']), deleteRecord);

export default router;
