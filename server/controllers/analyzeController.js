const Entry = require('../models/Entry');
const Nudge = require('../models/Nudge');
const Pattern = require('../models/Pattern');
const axios = require('axios');

const analyzeEntry = async (req, res) => {
  try {
    const { entryId } = req.body;
    const userId = req.user.userId;

    const entry = await Entry.findOne({ _id: entryId, user: userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const pastEntries = await Entry.find({ user: userId, _id: { $ne: entryId } }).sort({ createdAt: -1 });
    const pastEntryTexts = pastEntries.map(e => e.description);

    const aiResponse = await axios.post(`${process.env.ML_API_URL}/analyze`, {
      user_id: userId,
      entry: entry.description,
      past_entries: pastEntryTexts
    });

    const { sentiment, pattern, nudge } = aiResponse.data;

    if (nudge.nudge_triggered) {
      const linkedEntries = pastEntries
        .slice(0, pattern.similar_count || 3)
        .map(e => {
          const d = new Date(e.createdAt);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

      const recentSimilar = pastEntries[0];
      const suggestedAction = recentSimilar?.desiredAction
        || `Next time you feel ${sentiment.dominant_emotion}, pause before reacting and give yourself 10 minutes.`;

      await Nudge.create({
        user: userId,
        message: nudge.message,
        status: 'active',
        linkedEntries,
        suggestedAction
      });

      await Pattern.create({
        user: userId,
        description: `Pattern detected: ${sentiment.dominant_emotion}`,
        frequency: pattern.similar_count,
        linkedEntryIds: pastEntries.slice(0, pattern.similar_count).map(e => e._id)
      });
    }

    res.json({ sentiment, pattern, nudge });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { analyzeEntry };
