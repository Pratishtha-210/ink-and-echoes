import express from 'express';
import { 
  getEntries, 
  getEntry, 
  createEntry, 
  updateEntry, 
  deleteEntry, 
  getAnalytics 
} from '../controllers/journalController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection globally across all journal endpoints
router.use(authenticate, requireAdmin);

router.get('/', getEntries);
router.get('/analytics', getAnalytics); // Place this before /:id to avoid ID conflict
router.get('/:id', getEntry);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
