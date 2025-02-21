// backend/models/ResignationRequest.js
const mongoose = require('mongoose');

const ResignationRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  intendedLastWorkingDay: { type: Date, required: true },
  finalWorkingDay: { type: Date },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  exitInterview: {
    reasonForLeaving: { type: String },
    feedback: { type: String },
    recommend: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ResignationRequest', ResignationRequestSchema);
