import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all users / employees
// @route   GET /api/users
// @access  Private
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, users });
});

// @desc    Create new employee / user
// @route   POST /api/users
// @access  Private
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, designation, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    designation: designation || 'Employee',
    role: role || 'member',
    status: 'offline',
  });

  const safeUser = await User.findById(user._id).select('-password');
  res.status(201).json({ success: true, user: safeUser });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, user });
});

// @desc    Search users
// @route   GET /api/users/search?q=name
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const users = await User.find({
    $or: [
      { name: { $regex: q || '', $options: 'i' } },
      { email: { $regex: q || '', $options: 'i' } },
    ],
  }).select('-password');

  res.status(200).json({ success: true, users });
});

// @desc    Delete employee / user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted' });
});
