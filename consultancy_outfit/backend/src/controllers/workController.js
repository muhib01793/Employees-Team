import WorkUpdate from '../models/WorkUpdate.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all work updates
// @route   GET /api/work
// @access  Private
export const getWorkUpdates = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const query = {};
  if (employeeId) query.employee = employeeId;

  const updates = await WorkUpdate.find(query)
    .populate('employee', 'name email designation avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, updates });
});

// @desc    Create work update
// @route   POST /api/work
// @access  Private
export const createWorkUpdate = asyncHandler(async (req, res) => {
  const { title, description, status, category, link } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const update = await WorkUpdate.create({
    title,
    description,
    status: status || 'In Progress',
    category: category || 'General Work',
    link: link || '',
    employee: req.user.id,
  });

  const populated = await WorkUpdate.findById(update._id).populate(
    'employee',
    'name email designation avatar'
  );

  res.status(201).json({ success: true, update: populated });
});

// @desc    Delete work update
// @route   DELETE /api/work/:id
// @access  Private
export const deleteWorkUpdate = asyncHandler(async (req, res) => {
  const update = await WorkUpdate.findById(req.params.id);

  if (!update) {
    res.status(404);
    throw new Error('Work update not found');
  }

  if (update.employee.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this update');
  }

  await WorkUpdate.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Work update removed' });
});
