const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FUPRE CBT Portal API is running 🚀',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

// Graceful Shutdown
const handleShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = app;
