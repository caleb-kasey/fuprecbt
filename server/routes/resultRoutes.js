const express = require('express');
const router = express.Router();
const { submitExam, getUserResults, getReview } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/results/submit
router.post('/submit', authMiddleware, submitExam);

// GET /api/results/review/:id  (must come before /:userId to avoid route conflict)
router.get('/review/:id', authMiddleware, getReview);

// GET /api/results/:userId
router.get('/:userId', authMiddleware, getUserResults);

module.exports = router;
