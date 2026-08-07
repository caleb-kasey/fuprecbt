const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      enum: ['english', 'mathematics', 'physics', 'chemistry', 'biology'],
      lowercase: true,
    },
    year: {
      type: Number,
      required: true,
      enum: [2023, 2024, 2025],
    },
    passage: {
      type: String,
      default: null, // Used only for English comprehension
    },
    questionImage: {
      type: String,
      default: null, // Optional path to SVG diagram
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    correctAnswer: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries and duplicate prevention
questionSchema.index({ subject: 1, year: 1 });
questionSchema.index({ subject: 1, year: 1, questionText: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
