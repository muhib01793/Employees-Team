import Company from '../models/Company.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Create company
// @route   POST /api/companies
// @access  Private
export const createCompany = asyncHandler(async (req, res) => {
  const { name, description, website } = req.body;

  const company = await Company.create({
    name,
    description,
    website,
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'admin' }],
  });

  // Add company to user's companies
  await User.findByIdAndUpdate(req.user.id, {
    $push: { companies: company._id },
  });

  res.status(201).json({ success: true, company });
});

// @desc    Get user's companies
// @route   GET /api/companies
// @access  Private
export const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({
    'members.user': req.user.id,
    isActive: true,
  }).populate('owner', 'name email avatar');

  res.status(200).json({ success: true, companies });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('members.user', 'name email avatar status lastSeen')
    .populate('owner', 'name email avatar');

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  res.status(200).json({ success: true, company });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Check if user is admin/owner
  const member = company.members.find(
    (m) => m.user.toString() === req.user.id
  );
  if (!member || (member.role !== 'admin' && company.owner.toString() !== req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to update this company');
  }

  const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, company: updated });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Owner only)
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  if (company.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only owner can delete company');
  }

  await Company.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Company deleted' });
});

// @desc    Add member to company
// @route   POST /api/companies/:id/members
// @access  Private (Admin only)
export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  const company = await Company.findById(req.params.id);
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Check authorization
  const member = company.members.find(
    (m) => m.user.toString() === req.user.id
  );
  if (!member || member.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can add members');
  }

  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if already member
  const alreadyMember = company.members.find(
    (m) => m.user.toString() === userId
  );
  if (alreadyMember) {
    res.status(400);
    throw new Error('User already a member');
  }

  company.members.push({ user: userId, role: role || 'member' });
  await company.save();

  await User.findByIdAndUpdate(userId, {
    $push: { companies: company._id },
  });

  res.status(200).json({ success: true, company });
});

// @desc    Remove member from company
// @route   DELETE /api/companies/:id/members
// @access  Private (Admin only)
export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const company = await Company.findById(req.params.id);
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  company.members = company.members.filter(
    (m) => m.user.toString() !== userId
  );
  await company.save();

  await User.findByIdAndUpdate(userId, {
    $pull: { companies: company._id },
  });

  res.status(200).json({ success: true, message: 'Member removed' });
});