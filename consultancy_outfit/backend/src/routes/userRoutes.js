import express from 'express';
import {
  getUsers,
  getUserById,
  searchUsers,
  createUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUsers)
  .post(protect, createUser);

router.route('/search').get(protect, searchUsers);

router.route('/:id')
  .get(protect, getUserById)
  .delete(protect, deleteUser);

export default router;
