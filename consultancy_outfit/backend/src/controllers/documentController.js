import Document from '../models/Document.js';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  const { title, description, companyId, teamId, isPublic } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  let targetCompany = companyId || null;
  if (!targetCompany && req.user?.companies && req.user.companies.length > 0) {
    targetCompany = req.user.companies[0];
  }

  const document = await Document.create({
    title: title || req.file.originalname,
    description: description || '',
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedBy: req.user.id,
    company: targetCompany,
    team: teamId || null,
    isPublic: isPublic === 'true' || isPublic === true,
  });

  const populated = await Document.findById(document._id).populate('uploadedBy', 'name email avatar');
  res.status(201).json({ success: true, document: populated });
});

// @desc    Get documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = asyncHandler(async (req, res) => {
  const { companyId, teamId } = req.query;

  const query = {};
  if (companyId) query.company = companyId;
  if (teamId) query.team = teamId;

  const documents = await Document.find(query)
    .populate('uploadedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, documents });
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('uploadedBy', 'name email avatar');

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.status(200).json({ success: true, document });
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  document.downloadCount = (document.downloadCount || 0) + 1;
  await document.save();

  const relPath = document.fileUrl.startsWith('/') ? document.fileUrl.substring(1) : document.fileUrl;
  const filePath = path.join(process.cwd(), relPath);

  if (fs.existsSync(filePath)) {
    return res.download(filePath, document.fileName);
  }

  res.redirect(document.fileUrl);
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Remove local file if exists
  if (document.fileUrl) {
    const relPath = document.fileUrl.startsWith('/') ? document.fileUrl.substring(1) : document.fileUrl;
    const filePath = path.join(process.cwd(), relPath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('File unlink error:', err.message);
      }
    }
  }

  await Document.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Document deleted' });
});
