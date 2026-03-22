const Entry = require('../models/Entry');
const Nudge = require('../models/Nudge');
const Pattern = require('../models/Pattern');
const axios = require('axios');

const analyzeEntry = async (req, res) => {
  try {
    const { entryId } = req.body;
    const userId = req.user.userId;

    // Get the new entry
    const entry = await Entry.findOne({ _id: entryId, user: userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Get all past entries for this user
    const pastEntries = await Entry.find({ user: userId, _id: { $ne: entryId } });
    const pastEntryTexts = pastEntries.map(e => e.description);

    // Call the AI engine
    const aiResponse = await axios.post('http://localhost:8001/analyze', {
      user_id: userId,
      entry: entry.description,
      past_entries: pastEntryTexts
    });

    const { sentiment, pattern, nudge } = aiResponse.data;

    // If a pattern is detected and a nudge is triggered, save it
    if (nudge.nudge_triggered) {
      await Nudge.create({
        user: userId,
        message: nudge.message,
        status: 'active'
      });

      await Pattern.create({
        user: userId,
        description: `Pattern detected: ${sentiment.dominant_emotion}`,
        frequency: pattern.similar_count,
        linkedEntryIds: pastEntries.slice(0, pattern.similar_count).map(e => e._id)
      });
    }

    res.json({
      sentiment,
      pattern,
      nudge
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { analyzeEntry };