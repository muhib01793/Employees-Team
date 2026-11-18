import express from 'express';
import {
  getWorkUpdates,
  createWorkUpdate,
  deleteWorkUpdate,
} from '../controllers/workController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getWorkUpdates)
  .post(protect, createWorkUpdate);

router.route('/:id')
  .delete(protect, deleteWorkUpdate);

export default router;
