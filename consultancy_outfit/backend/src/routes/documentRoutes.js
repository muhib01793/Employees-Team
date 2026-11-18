import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

router.route('/:id')
  .get(protect, getDocumentById)
  .delete(protect, deleteDocument);

router.route('/:id/download')
  .get(downloadDocument);

export default router;
