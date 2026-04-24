const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const auth = require('./middleware/auth');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/reports', require('./routes/reports'));

// ─── Disease Prediction Proxy  (POST /api/predict) ─────────
// Forwards symptoms to Python ML service
app.post('/api/predict', auth, async (req, res) => {
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'ML service error', error: err.message });
  }
});

// ─── Chatbot Proxy  (POST /api/chat) ───────────────────────
app.post('/api/chat', auth, async (req, res) => {
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/chat`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'Chatbot service error', error: err.message });
  }
});

// ─── Report Analyzer Proxy  (POST /api/analyze) ────────────
app.post('/api/analyze', auth, async (req, res) => {
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/analyze`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'Analyzer service error', error: err.message });
  }
});

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Smart Health API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
