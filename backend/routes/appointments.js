const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// POST /api/appointments  — Create appointment (protected)
router.post('/', auth, async (req, res) => {
  const { doctorName, specialization, date, time, reason } = req.body;
  try {
    const appointment = new Appointment({
      userId: req.user.id,
      doctorName,
      specialization,
      date,
      time,
      reason
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /api/appointments  — Get user's appointments (protected)
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE /api/appointments/:id  — Cancel appointment (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
    res.json({ msg: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
