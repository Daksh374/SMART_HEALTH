const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  symptoms: { type: [String], required: true },
  avgSeverity: { type: Number, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
