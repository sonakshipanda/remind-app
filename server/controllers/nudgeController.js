const Nudge = require('../models/Nudge');

const getNudges = async (req, res) => {
  try {
    const nudges = await Nudge.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(nudges);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const createNudge = async (req, res) => {
  try {
    const { message, deliveryTime, patternId } = req.body;

    const nudge = await Nudge.create({
      user: req.user.userId,
      message,
      deliveryTime,
      patternId
    });

    res.status(201).json(nudge);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateNudgeStatus = async (req, res) => {
  try {
    const nudge = await Nudge.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { status: req.body.status },
      { new: true }
    );
    if (!nudge) return res.status(404).json({ message: 'Nudge not found' });
    res.json(nudge);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { getNudges, createNudge, updateNudgeStatus };