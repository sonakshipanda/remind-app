const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware');

const EntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  emotionalState: { type: String },
  trigger: { type: String },
  desiredAction: { type: String },
  category: { type: String }
}, { timestamps: true });

const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { description, emotionalState, trigger, desiredAction, category } = req.body;
    const entry = await Entry.create({ user: req.user.userId, description, emotionalState, trigger, desiredAction, category });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
