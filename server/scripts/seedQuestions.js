const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Question = require('../models/Question');

const QUESTIONS_DIR = path.join(__dirname, '..', 'questions-data');

const seedQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding\n');

    // Read all JSON files from questions-data folder
    const files = fs.readdirSync(QUESTIONS_DIR).filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('⚠️  No JSON files found in questions-data/ folder.');
      console.log('   Expected format: subject_year.json (e.g. mathematics_2023.json)');
      process.exit(0);
    }

    let totalInserted = 0;

    for (const file of files) {
      // Extract subject and year from filename: mathematics_2023.json
      const baseName = path.basename(file, '.json'); // "mathematics_2023"
      const parts = baseName.split('_');

      if (parts.length < 2) {
        console.log(`⚠️  Skipping "${file}" — filename must be subject_year.json`);
        continue;
      }

      const subject = parts.slice(0, -1).join('_').toLowerCase(); // handles multi-word if needed
      const year = parseInt(parts[parts.length - 1], 10);

      // Validate subject
      const validSubjects = ['english', 'mathematics', 'physics', 'chemistry', 'biology'];
      if (!validSubjects.includes(subject)) {
        console.log(`⚠️  Skipping "${file}" — invalid subject "${subject}"`);
        continue;
      }

      // Validate year
      if (![2023, 2024, 2025].includes(year)) {
        console.log(`⚠️  Skipping "${file}" — invalid year "${year}"`);
        continue;
      }

      // Read and parse JSON file
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
        // Check for duplicate by subject + year + questionText
        const exists = await Question.findOne({
          subject,
          year,
          questionText: q.questionText,
        });

        if (exists) {
          skippedCount++;
          continue;
        }

        // Insert with subject and year added
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
