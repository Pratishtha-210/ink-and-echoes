import express from 'express';
import { getEntries, createEntry } from '../controllers/openDiaryController.js';

const router = express.Router();

// Public endpoints
router.get('/', getEntries);
router.post('/', createEntry);

export default router;
