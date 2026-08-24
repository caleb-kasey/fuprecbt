const Question = require('../models/Question');

const ALLOWED_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology'];
const ALLOWED_YEARS = [2023, 2024, 2025];

/**
 * @desc    Get questions for a subject and year
 * @route   GET /api/questions?subject=mathematics&year=2023&limit=20
 * @access  Protected
 */
const getQuestions = async (req, res, next) => {
  try {
    const { subject, year, limit = 20 } = req.query;

    // Validate subject
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject query parameter is required.',
      });
    }

    const normalizedSubject = subject.trim().toLowerCase();
    if (!ALLOWED_SUBJECTS.includes(normalizedSubject)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject. Allowed values: ${ALLOWED_SUBJECTS.join(', ')}`,
      });
    }

    const questionLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    let questions;

    if (year === 'random') {
      // Aggregate random sample across all years for the subject
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
      const yearNum = parseInt(year, 10);
      if (!year || !ALLOWED_YEARS.includes(yearNum)) {
        return res.status(400).json({
          success: false,
          message: `Invalid year. Allowed values: ${ALLOWED_YEARS.join(', ')}, or "random".`,
        });
      }

      // Exclude correctAnswer and explanation for active exam session
      questions = await Question.find(
        { subject: normalizedSubject, year: yearNum },
        { correctAnswer: 0, explanation: 0 }
      ).limit(questionLimit);
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  ALLOWED_SUBJECTS,
  ALLOWED_YEARS,
};
