const Question = require('../models/Question');

const ALLOWED_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology'];

// @desc    Get questions for a subject and year
// @route   GET /api/questions?subject=mathematics&year=2023&limit=20
// @access  Protected
const getQuestions = async (req, res) => {
  try {
    const { subject, year, limit = 20 } = req.query;

    // Validate subject
    if (!subject) {
      return res.status(400).json({ message: 'Subject query parameter is required.' });
    }

    const normalizedSubject = subject.toLowerCase();
    if (!ALLOWED_SUBJECTS.includes(normalizedSubject)) {
      return res.status(400).json({
        message: `Invalid subject. Allowed values: ${ALLOWED_SUBJECTS.join(', ')}`,
      });
    }

    const questionLimit = parseInt(limit, 10) || 20;

    let questions;

    if (year === 'random') {
      // Use MongoDB $sample to get random questions from all years
      questions = await Question.aggregate([
        { $match: { subject: normalizedSubject } },
        { $sample: { size: questionLimit } },
        {
          $project: {
            correctAnswer: 0,
            explanation: 0,
          },
        },
      ]);
    } else {
      // Validate year
      const yearNum = parseInt(year, 10);
      if (!year || ![2023, 2024, 2025].includes(yearNum)) {
        return res.status(400).json({
          message: 'Invalid year. Allowed values: 2023, 2024, 2025, or "random".',
        });
      }

      // CRITICAL: Exclude correctAnswer and explanation from response
      questions = await Question.find(
        { subject: normalizedSubject, year: yearNum },
        { correctAnswer: 0, explanation: 0 }
      ).limit(questionLimit);
    }

    res.status(200).json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Get Questions Error:', error.message);
    res.status(500).json({ message: 'Server error fetching questions.' });
  }
};

module.exports = { getQuestions };
