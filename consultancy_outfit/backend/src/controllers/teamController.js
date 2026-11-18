import Team from '../models/Team.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import asyncHandler from 'express-async-handler';

// @desc    Create team
// @route   POST /api/teams
// @access  Private
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, companyId, isPrivate } = req.body;

  let targetCompany = companyId || null;
  if (!targetCompany && req.user?.companies && req.user.companies.length > 0) {
    targetCompany = req.user.companies[0];
  }

  const team = await Team.create({
    name,
    description: description || '',
    company: targetCompany,
    owner: req.user.id,
    members: [req.user.id],
    isPrivate: isPrivate || false,
  });

  res.status(201).json({ success: true, team });
});

// @desc    Get teams for company
// @route   GET /api/teams
// @access  Private
export const getTeams = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  const teams = await Team.find({
    company: companyId,
    members: req.user.id,
  }).populate('owner', 'name email');

  res.status(200).json({ success: true, teams });
});

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email avatar status')
    .populate('owner', 'name email');

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  res.status(200).json({ success: true, team });
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  if (team.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, team: updated });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  if (team.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await Team.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Team deleted' });
});

// @desc    Add team member
// @route   POST /api/teams/:id/members
// @access  Private
export const addTeamMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  if (team.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  if (team.members.includes(userId)) {
    res.status(400);
    throw new Error('User already in team');
  }

  team.members.push(userId);
  await team.save();

  res.status(200).json({ success: true, team });
});

// @desc    Remove team member
// @route   DELETE /api/teams/:id/members
// @access  Private
export const removeTeamMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  if (team.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  team.members = team.members.filter((id) => id.toString() !== userId);
  await team.save();

  res.status(200).json({ success: true, message: 'Member removed' });
});