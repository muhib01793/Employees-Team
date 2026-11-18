import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  updateStatus,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/status', protect, updateStatus);

export default router;