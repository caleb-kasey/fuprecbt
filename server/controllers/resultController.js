const Question = require('../models/Question');
const Result = require('../models/Result');

// @desc    Submit exam answers and get graded result
// @route   POST /api/results/submit
// @access  Protected
const submitExam = async (req, res) => {
  try {
    const { answers, subjects, year } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers array is required.' });
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Subjects array is required.' });
    }

    if (!year) {
      return res.status(400).json({ message: 'Year is required.' });
    }

    // Validate that English and Mathematics are included (compulsory)
    const normalizedSubjects = subjects.map((s) => s.toLowerCase());
    if (!normalizedSubjects.includes('english')) {
      return res.status(400).json({ message: 'English is a compulsory subject.' });
    }
    if (!normalizedSubjects.includes('mathematics')) {
      return res.status(400).json({ message: 'Mathematics is a compulsory subject.' });
    }

    // Fetch correct answers from MongoDB for all submitted question IDs
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Build a lookup map: questionId → question document
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    // Grade each answer server-side
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
      const question = questionMap[ans.questionId];

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

      // Track subject breakdown
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

    // Return full result with correctAnswer and explanation for review
    // Populate question details for the review page
    const populatedAnswers = await Promise.all(
      gradedAnswers.map(async (ans) => {
        const question = questionMap[ans.questionId];
        return {
          ...ans,
          questionText: question ? question.questionText : 'Question not found',
          options: question ? question.options : {},
          explanation: question ? question.explanation : '',
          passage: question ? question.passage : null,
          subject: question ? question.subject : 'unknown',
        };
      })
    );

    res.status(201).json({
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
    console.error('Submit Exam Error:', error.message);
    res.status(500).json({ message: 'Server error submitting exam.' });
  }
};

// @desc    Get all results for a user (dashboard)
// @route   GET /api/results/:userId
// @access  Protected
const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await Result.find({ userId })
      .select('-answers') // Exclude full answers array for the list view
      .sort({ completedAt: -1 });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Get User Results Error:', error.message);
    res.status(500).json({ message: 'Server error fetching results.' });
  }
};

// @desc    Get a single result for review
// @route   GET /api/results/review/:id
// @access  Protected
const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found.' });
    }

    // Fetch question details for each answer
    const questionIds = result.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    const detailedAnswers = result.answers.map((ans) => {
      const question = questionMap[ans.questionId.toString()];
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

    res.status(200).json({
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
    console.error('Get Review Error:', error.message);
    res.status(500).json({ message: 'Server error fetching review.' });
  }
};

module.exports = { submitExam, getUserResults, getReview };
