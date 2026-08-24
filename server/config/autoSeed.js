const fs = require('fs');
const path = require('path');
const Question = require('../models/Question');

const autoSeedQuestions = async () => {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      return; // Database already contains questions
    }

    console.log('🌱 No questions found in MongoDB. Starting automatic database seed...');
    const QUESTIONS_DIR = path.join(__dirname, '..', 'questions-data');

    if (!fs.existsSync(QUESTIONS_DIR)) {
      console.warn('⚠️ questions-data directory not found.');
      return;
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter(file => file.endsWith('.json'));
    if (files.length === 0) {
      console.warn('⚠️ No JSON question files found in questions-data directory.');
      return;
    }

    let totalInserted = 0;
    const validSubjects = ['english', 'mathematics', 'physics', 'chemistry', 'biology'];

    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const parts = baseName.split('_');
      if (parts.length < 2) continue;

      const subject = parts.slice(0, -1).join('_').toLowerCase();
      const year = parseInt(parts[parts.length - 1], 10);

      if (!validSubjects.includes(subject) || ![2023, 2024, 2025].includes(year)) {
        continue;
      }

      const filePath = path.join(QUESTIONS_DIR, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      let questions;
      try {
        questions = JSON.parse(rawData);
      } catch (parseErr) {
        console.error(`⚠️ Failed to parse ${file}:`, parseErr.message);
        continue;
      }

      if (!Array.isArray(questions)) continue;

      const docsToInsert = questions.map(q => ({
        subject,
        year,
        passage: q.passage || null,
        questionImage: q.questionImage || null,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      }));

      if (docsToInsert.length > 0) {
        await Question.insertMany(docsToInsert, { ordered: false });
        totalInserted += docsToInsert.length;
      }
    }

    console.log(`✅ Auto-seeding complete! ${totalInserted} questions inserted into MongoDB.`);
  } catch (error) {
    console.error('⚠️ Auto-seed error:', error.message);
  }
};

module.exports = autoSeedQuestions;
