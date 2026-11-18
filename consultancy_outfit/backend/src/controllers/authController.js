import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { sendTokenResponse } from '../middleware/authMiddleware.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, designation } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    designation,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // If user doesn't exist yet, auto-create the demo admin account so user never gets stuck!
  if (!user && email.toLowerCase() === 'admin@example.com' && password === 'password123') {
    user = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      designation: 'Platform Admin',
      role: 'admin',
      status: 'online',
    });
  }

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update status
  user.status = 'online';
  user.lastSeen = Date.now();
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.status = 'offline';
    req.user.lastSeen = Date.now();
    await req.user.save();
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, designation, avatar } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (designation) user.designation = designation;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({ success: true, user });
});

// @desc    Update user status
// @route   PUT /api/auth/status
// @access  Private
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['online', 'offline', 'away', 'busy'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const user = await User.findById(req.user.id);
  user.status = status;
  user.lastSeen = Date.now();
  await user.save();

  res.status(200).json({ success: true, user });
});