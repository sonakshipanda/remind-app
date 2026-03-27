const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { analyzeEntry } = require('../controllers/analyzeController');

router.use(protect);

router.post('/', analyzeEntry);

module.exports = router;