const mongoose = require('mongoose');

const PatternSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  triggerConditions: {
    type: String
  },
  frequency: {
    type: Number,
    default: 0
  },
  linkedEntryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Pattern', PatternSchema);