import express from 'express';
import { 
  getPoems, 
  getPoem, 
  createPoem, 
  updatePoem, 
  deletePoem, 
  likePoem, 
  addComment 
} from '../controllers/poemController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPoems);
router.get('/:id', getPoem);
router.post('/:id/like', likePoem);
router.post('/:id/comment', addComment);

// Protected Admin-only routes
router.post('/', authenticate, requireAdmin, createPoem);
router.put('/:id', authenticate, requireAdmin, updatePoem);
router.delete('/:id', authenticate, requireAdmin, deletePoem);

export default router;
