const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const pdfParse = require('pdf-parse');
const axios    = require('axios');
const auth     = require('../middleware/auth');
const Report   = require('../models/Report');

// ─── Multer config: memory storage, 10 MB limit ────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are supported'), false);
    }
  }
});

// ─── POST /api/reports/upload ───────────────────────────────────────────────
// Accept a PDF or TXT file, extract its text, forward to ML /analyze,
// persist the result, and return analysis data to the client.
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded. Please attach a PDF or TXT file.' });
    }

    // ── Extract raw text from the uploaded file ──────────────────────────
    let reportText = '';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf') {
      const parsed = await pdfParse(req.file.buffer);
      reportText = parsed.text;
    } else {
      // text/plain
      reportText = req.file.buffer.toString('utf-8');
    }

    if (!reportText.trim()) {
      return res.status(422).json({ msg: 'Could not extract text from the uploaded file. The file may be empty or image-only.' });
    }

    // ── Forward to ML /analyze ────────────────────────────────────────────
    let analysis;
    try {
      const mlRes = await axios.post(
        `${process.env.ML_SERVICE_URL}/analyze`,
        { report: reportText }
      );
      analysis = mlRes.data;
    } catch (mlErr) {
      return res.status(502).json({ msg: 'ML analyze service unavailable. Please ensure the ML service is running.' });
    }

    // ── Persist to DB ─────────────────────────────────────────────────────
    const report = new Report({
      userId:     req.user.id,
      summary:    analysis.summary || 'No summary available.',
      date:       new Date().toLocaleDateString(),
      fileName:   req.file.originalname,
      fileType:   mime === 'application/pdf' ? 'pdf' : 'txt',
      reportText: reportText.slice(0, 5000)  // store first 5 k chars
    });
    await report.save();

    res.status(201).json({ ...analysis, reportId: report._id, fileName: req.file.originalname });

  } catch (err) {
    if (err.message === 'Only PDF and TXT files are supported') {
      return res.status(415).json({ msg: err.message });
    }
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ─── POST /api/reports — Save text-analysis result (protected) ─────────────
router.post('/', auth, async (req, res) => {
  const { summary, date, reportText } = req.body;
  try {
    const report = new Report({
      userId:   req.user.id,
      summary,
      date,
      fileType: 'text',
      reportText: reportText ? reportText.slice(0, 5000) : null
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ─── GET /api/reports — Get user's reports (protected) ────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
