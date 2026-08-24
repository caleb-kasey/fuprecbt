const express = require('express');
const { submitExam, getUserResults, getReview } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/submit', authMiddleware, submitExam);
router.get('/review/:id', authMiddleware, getReview);
router.get('/:userId', authMiddleware, getUserResults);

module.exports = router;
