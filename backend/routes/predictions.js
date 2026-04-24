const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Prediction = require('../models/Prediction');

// POST /api/predictions — Save prediction (protected)
router.post('/', auth, async (req, res) => {
  const { disease, confidence, symptoms, avgSeverity, date } = req.body;
  try {
    const prediction = new Prediction({
      userId: req.user.id,
      disease,
      confidence,
      symptoms,
      avgSeverity,
      date
    });
    await prediction.save();
    res.status(201).json(prediction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /api/predictions — Get user's predictions (protected)
router.get('/', auth, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
