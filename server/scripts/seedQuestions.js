const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const env = require('../config/env');
const Question = require('../models/Question');

const QUESTIONS_DIR = path.join(__dirname, '..', 'questions-data');
const VALID_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology'];
const VALID_YEARS = [2023, 2024, 2025];

const seedQuestions = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding\n');

    if (!fs.existsSync(QUESTIONS_DIR)) {
      console.error('❌ questions-data directory does not exist.');
      process.exit(1);
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('⚠️  No JSON files found in questions-data/ folder.');
      process.exit(0);
    }

    let totalInserted = 0;

    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const parts = baseName.split('_');

      if (parts.length < 2) {
        console.log(`⚠️  Skipping "${file}" — filename must be subject_year.json`);
        continue;
      }

      const subject = parts.slice(0, -1).join('_').toLowerCase();
      const year = parseInt(parts[parts.length - 1], 10);

      if (!VALID_SUBJECTS.includes(subject)) {
        console.log(`⚠️  Skipping "${file}" — invalid subject "${subject}"`);
        continue;
      }

      if (!VALID_YEARS.includes(year)) {
        console.log(`⚠️  Skipping "${file}" — invalid year "${year}"`);
        continue;
      }

      const filePath = path.join(QUESTIONS_DIR, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      let questions;

      try {
        questions = JSON.parse(rawData);
      } catch (parseErr) {
        console.log(`⚠️  Skipping "${file}" — invalid JSON: ${parseErr.message}`);
        continue;
      }

      if (!Array.isArray(questions)) {
        console.log(`⚠️  Skipping "${file}" — file must contain a JSON array`);
        continue;
      }

      let insertedCount = 0;
      let skippedCount = 0;

      for (const q of questions) {
        const exists = await Question.findOne({
          subject,
          year,
          questionText: q.questionText,
        });

        if (exists) {
          skippedCount++;
          continue;
        }

        await Question.create({
          subject,
          year,
          passage: q.passage || null,
          questionImage: q.questionImage || null,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        });

        insertedCount++;
      }

      totalInserted += insertedCount;
      console.log(
        `📄 ${file}: ${insertedCount} inserted, ${skippedCount} skipped (duplicates)`
      );
    }

    console.log(`\n✅ Seeding complete! Total questions inserted: ${totalInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedQuestions();
