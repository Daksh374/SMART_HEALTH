const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');

// POST /api/reports — Save report analysis (protected)
router.post('/', auth, async (req, res) => {
  const { summary, date } = req.body;
  try {
    const report = new Report({
      userId: req.user.id,
      summary,
      date
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /api/reports — Get user's reports (protected)
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
