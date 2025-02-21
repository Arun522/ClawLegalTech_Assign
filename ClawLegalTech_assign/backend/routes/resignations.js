// backend/routes/resignations.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ResignationRequest = require('../models/ResignationRequest');
const moment = require('moment');

// Define a sample holidays list (ISO date strings)
const holidays = ['2025-01-01', '2025-12-25'];

const isWeekendOrHoliday = (date) => {
  const day = moment(date).day();
  const dateStr = moment(date).format('YYYY-MM-DD');
  return day === 0 || day === 6 || holidays.includes(dateStr);
};

// Employee submits resignation
router.post('/', protect, authorize('Employee'), async (req, res) => {
  const { reason, intendedLastWorkingDay } = req.body;
  if (isWeekendOrHoliday(intendedLastWorkingDay)) {
    return res.status(400).json({ message: 'Last working day cannot be a weekend or holiday.' });
  }
  try {
    const resignation = new ResignationRequest({
      employee: req.user._id,
      reason,
      intendedLastWorkingDay,
    });
    await resignation.save();
    res.json({ message: 'Resignation request submitted.', resignation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee views their resignation request
router.get('/my-request', protect, authorize('Employee'), async (req, res) => {
  try {
    const resignation = await ResignationRequest.findOne({ employee: req.user._id });
    res.json(resignation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR gets all resignation requests
router.get('/', protect, authorize('HR'), async (req, res) => {
  try {
    const requests = await ResignationRequest.find().populate('employee', 'username');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR approves or rejects a resignation
router.put('/:id', protect, authorize('HR'), async (req, res) => {
  const { status, finalWorkingDay } = req.body;
  try {
    const resignation = await ResignationRequest.findById(req.params.id);
    if (!resignation) {
      return res.status(404).json({ message: 'Resignation request not found' });
    }
    if (status === 'Approved') {
      if (!finalWorkingDay || isWeekendOrHoliday(finalWorkingDay)) {
        return res.status(400).json({ message: 'Final working day is invalid.' });
      }
      resignation.finalWorkingDay = finalWorkingDay;
    }
    resignation.status = status;
    await resignation.save();
    res.json({ message: `Resignation ${status}`, resignation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee submits exit interview after approval
router.post('/:id/exit-interview', protect, authorize('Employee'), async (req, res) => {
  const { reasonForLeaving, feedback, recommend } = req.body;
  try {
    const resignation = await ResignationRequest.findById(req.params.id);
    if (!resignation) {
      return res.status(404).json({ message: 'Resignation request not found' });
    }
    if (resignation.status !== 'Approved') {
      return res.status(400).json({ message: 'Exit interview available only after approval.' });
    }
    resignation.exitInterview = { reasonForLeaving, feedback, recommend };
    await resignation.save();
    res.json({ message: 'Exit interview submitted.', resignation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR views exit interview responses for a given request
router.get('/:id/exit-interview', protect, authorize('HR'), async (req, res) => {
  try {
    const resignation = await ResignationRequest.findById(req.params.id);
    if (!resignation) {
      return res.status(404).json({ message: 'Resignation request not found' });
    }
    res.json({ exitInterview: resignation.exitInterview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
