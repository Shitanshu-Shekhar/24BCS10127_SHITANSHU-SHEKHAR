const express = require('express');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const router = express.Router();

function validationMessages(error) {
  if (error?.name === 'ValidationError') return Object.values(error.errors).map(item => item.message);
  return [error.message || 'Invalid request'];
}
function handleError(res, error) {
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: 'This email is already registered for the event' });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({ success: false, errors: validationMessages(error) });
  }
  if (error?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid registration ID format' });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}
function validId(id) { return mongoose.isValidObjectId(id); }

// POST /api/registrations — create a registration
router.post('/', async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    return res.status(201).json({ success: true, message: 'Registration successful', data: registration });
  } catch (error) {
    if (error.message === 'Invalid discount code') return res.status(400).json({ success: false, message: 'Invalid discount code' });
    return handleError(res, error);
  }
});

// GET /api/registrations?eventType=ROBOTICS&status=CONFIRMED
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventType) filter.eventType = req.query.eventType;
    if (req.query.status) filter.status = req.query.status;
    const registrations = await Registration.find(filter).sort({ registrationDate: -1 });
    return res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) { return handleError(res, error); }
});

// GET /api/registrations/:id — get one registration
router.get('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid registration ID format' });
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
    return res.status(200).json({ success: true, data: registration });
  } catch (error) { return handleError(res, error); }
});

// PUT /api/registrations/:id — update details; validate the complete merged document first.
router.put('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid registration ID format' });
  try {
    const existing = await Registration.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Registration not found' });

    const allowed = ['studentName', 'collegeEmail', 'rollNumber', 'eventType', 'teamSize', 'ticketPrice', 'discountCode', 'status', 'registrationDate'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) existing.set(key, req.body[key]);
    // Document validation ensures cross-field constraints (AI_WORKSHOP/teamSize) run too.
    await existing.validate();
    const update = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = existing.get(key);
    // runValidators is explicitly enabled as required by the assignment.
    const updated = await Registration.findByIdAndUpdate(req.params.id, { $set: update }, {
      new: true, runValidators: true, context: 'query'
    });
    return res.status(200).json({ success: true, message: 'Registration updated successfully', data: updated });
  } catch (error) {
    if (error.message === 'Invalid discount code') return res.status(400).json({ success: false, message: 'Invalid discount code' });
    return handleError(res, error);
  }
});

// DELETE /api/registrations/:id — assignment describes cancel/delete; remove record.
router.delete('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid registration ID format' });
  try {
    const deleted = await Registration.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Registration not found' });
    return res.status(200).json({ success: true, message: 'Registration deleted successfully', data: deleted });
  } catch (error) { return handleError(res, error); }
});

module.exports = router;
