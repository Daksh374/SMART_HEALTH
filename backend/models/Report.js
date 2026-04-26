const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  summary: { type: String, required: true },
  date: { type: String, required: true },
  fileName: { type: String, default: null },      
  fileType: { type: String, default: null },    
  reportText: { type: String, default: null },    
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
