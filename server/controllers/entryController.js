const Entry = require('../models/Entry');

const createEntry = async (req, res) => {
  try {
    const { description, trigger, emotionalState, desiredAction, category } = req.body;

    const entry = await Entry.create({
      user: req.user.userId,
      description,
      trigger,
      emotionalState,
      desiredAction,
      category
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateEntry = async (req, res) => {
  try {
    const { description, trigger, emotionalState, desiredAction, category } = req.body;

    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { description, trigger, emotionalState, desiredAction, category },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };