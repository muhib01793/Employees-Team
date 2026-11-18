import express from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(protect, getTeamById)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.route('/:id/members')
  .post(protect, addTeamMember)
  .delete(protect, removeTeamMember);

export default router;