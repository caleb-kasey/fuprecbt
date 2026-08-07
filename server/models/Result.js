const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjects: {
      type: [String],
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    attempted: {
      type: Number,
      required: true,
    },
    passed: {
      type: Number,
      required: true,
    },
    failed: {
      type: Number,
      required: true,
    },
    subjectBreakdown: [
      {
        subject: { type: String, required: true },
        score: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedAnswer: { type: String, default: null },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fetching user history quickly
resultSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
