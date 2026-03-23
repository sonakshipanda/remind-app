const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createEntry, getEntries, getEntry, updateEntry, deleteEntry } = require('../controllers/entryController');

router.use(protect);

router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;