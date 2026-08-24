const Question = require('../models/Question');
const Result = require('../models/Result');

/**
 * @desc    Submit exam answers and get graded result
 * @route   POST /api/results/submit
 * @access  Protected
 */
const submitExam = async (req, res, next) => {
  try {
    const { answers, subjects, year } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required and cannot be empty.',
      });
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required and cannot be empty.',
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required.',
      });
    }

    // Validate compulsory subjects
    const normalizedSubjects = subjects.map((s) => s.trim().toLowerCase());
    if (!normalizedSubjects.includes('english')) {
      return res.status(400).json({
        success: false,
        message: 'English is a compulsory subject.',
      });
    }
    if (!normalizedSubjects.includes('mathematics')) {
      return res.status(400).json({
        success: false,
        message: 'Mathematics is a compulsory subject.',
      });
    }

    // Fetch correct answers for all submitted question IDs
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Build lookup map: questionId -> question doc
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    let totalScore = 0;
    let attempted = 0;
    let passed = 0;
    let failed = 0;

    // Track per-subject scores
    const subjectScores = {};
    normalizedSubjects.forEach((subj) => {
      subjectScores[subj] = { score: 0, total: 0 };
    });

    const gradedAnswers = answers.map((ans) => {
      const question = questionMap.get(ans.questionId?.toString());

      if (!question) {
        return {
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer || null,
          correctAnswer: 'N/A',
          isCorrect: false,
        };
      }

      const isCorrect = ans.selectedAnswer === question.correctAnswer;
      const wasAttempted = ans.selectedAnswer !== null && ans.selectedAnswer !== undefined && ans.selectedAnswer !== '';

      if (wasAttempted) attempted++;
      if (isCorrect) {
        totalScore++;
        passed++;
      } else {
        failed++;
      }

      const subj = question.subject.toLowerCase();
      if (subjectScores[subj]) {
        subjectScores[subj].total++;
        if (isCorrect) subjectScores[subj].score++;
      }

      return {
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    // Build subjectBreakdown array
    const subjectBreakdown = Object.keys(subjectScores).map((subj) => ({
      subject: subj,
      score: subjectScores[subj].score,
      total: subjectScores[subj].total,
    }));

    // Save result to MongoDB
    const result = await Result.create({
      userId,
      subjects: normalizedSubjects,
      year: String(year),
      totalScore,
      totalQuestions: answers.length,
      attempted,
      passed,
      failed,
      subjectBreakdown,
      answers: gradedAnswers,
      completedAt: new Date(),
    });

    // Populate question details for the review payload
    const populatedAnswers = gradedAnswers.map((ans) => {
      const question = questionMap.get(ans.questionId?.toString());
      return {
        ...ans,
        questionText: question ? question.questionText : 'Question not found',
        options: question ? question.options : {},
        explanation: question ? question.explanation : '',
        passage: question ? question.passage : null,
        subject: question ? question.subject : 'unknown',
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Exam submitted successfully!',
      result: {
        _id: result._id,
        userId: result.userId,
        subjects: result.subjects,
        year: result.year,
        totalScore: result.totalScore,
        totalQuestions: result.totalQuestions,
        attempted: result.attempted,
        passed: result.passed,
        failed: result.failed,
        subjectBreakdown: result.subjectBreakdown,
        answers: populatedAnswers,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all results for a user (dashboard history)
 * @route   GET /api/results/:userId
 * @access  Protected
 */
const getUserResults = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const results = await Result.find({ userId })
      .select('-answers')
      .sort({ completedAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single result for detailed review
 * @route   GET /api/results/review/:id
 * @access  Protected
 */
const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found.',
      });
    }

    const questionIds = result.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    const detailedAnswers = result.answers.map((ans) => {
      const question = questionMap.get(ans.questionId?.toString());
      return {
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: ans.correctAnswer,
        isCorrect: ans.isCorrect,
        questionText: question ? question.questionText : 'Question not found',
        options: question ? question.options : {},
        explanation: question ? question.explanation : '',
        passage: question ? question.passage : null,
        questionImage: question ? question.questionImage : null,
        subject: question ? question.subject : 'unknown',
      };
    });

    return res.status(200).json({
      success: true,
      _id: result._id,
      userId: result.userId,
      subjects: result.subjects,
      year: result.year,
      totalScore: result.totalScore,
      totalQuestions: result.totalQuestions,
      attempted: result.attempted,
      passed: result.passed,
      failed: result.failed,
      subjectBreakdown: result.subjectBreakdown,
      answers: detailedAnswers,
      completedAt: result.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitExam,
  getUserResults,
  getReview,
};
