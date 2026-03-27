const mongoose = require('mongoose');

const NudgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'snoozed', 'dismissed'],
    default: 'active'
  },
  deliveryTime: {
    type: Date
  },
  patternId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pattern'
  }
}, { timestamps: true });

module.exports = mongoose.model('Nudge', NudgeSchema);