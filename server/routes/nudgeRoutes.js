const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getNudges, createNudge, updateNudgeStatus } = require('../controllers/nudgeController');

router.use(protect);

router.get('/', getNudges);
router.post('/', createNudge);
router.put('/:id', updateNudgeStatus);

module.exports = router;