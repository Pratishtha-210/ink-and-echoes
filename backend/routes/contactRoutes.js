import express from 'express';
import { 
  submitContact, 
  getMessages, 
  toggleReadStatus, 
  deleteMessage 
} from '../controllers/contactController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public submission
router.post('/', submitContact);

// Protected Admin-only routes
router.get('/', authenticate, requireAdmin, getMessages);
router.patch('/:id/read', authenticate, requireAdmin, toggleReadStatus);
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
