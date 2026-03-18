const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes');
const nudgeRoutes = require('./routes/nudgeRoutes');

dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/nudges', nudgeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'REMIND Backend is running!' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});