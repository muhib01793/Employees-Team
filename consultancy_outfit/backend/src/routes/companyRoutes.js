import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addMember,
  removeMember,
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCompanies)
  .post(protect, createCompany);

router.route('/:id')
  .get(protect, getCompanyById)
  .put(protect, updateCompany)
  .delete(protect, deleteCompany);

router.route('/:id/members')
  .post(protect, addMember)
  .delete(protect, removeMember);

export default router;