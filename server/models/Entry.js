const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  trigger: {
    type: String
  },
  emotionalState: {
    type: String
  },
  desiredAction: {
    type: String
  },
  category: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Entry', EntrySchema);