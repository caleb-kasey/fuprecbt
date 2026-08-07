const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/questions?subject=mathematics&year=2023&limit=20
router.get('/', authMiddleware, getQuestions);

module.exports = router;
