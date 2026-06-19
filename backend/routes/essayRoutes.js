import express from 'express';
import { 
  getEssays, 
  getEssay, 
  createEssay, 
  updateEssay, 
  deleteEssay 
} from '../controllers/essayController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getEssays);
router.get('/:id', getEssay);

// Protected Admin-only routes
router.post('/', authenticate, requireAdmin, createEssay);
router.put('/:id', authenticate, requireAdmin, updateEssay);
router.delete('/:id', authenticate, requireAdmin, deleteEssay);

export default router;
