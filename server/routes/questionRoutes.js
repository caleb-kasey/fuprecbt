const express = require('express');
const { getQuestions } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected: GET /api/questions?subject=mathematics&year=2023&limit=20
router.get('/', authMiddleware, getQuestions);

module.exports = router;
