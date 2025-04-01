require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const connectDB = require('./databases/connectDB');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const postRoutes = require('./routes/post.route');
const commentRoutes = require('./routes/comment.route');

// Import error handler middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = 5001;
const DatabaseUrl = process.env.MONGO_URI;

// Global Error Handlers
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(` Unhandled Rejection: ${reason}`);
  console.error(promise);
});

// Connect to Database
connectDB(DatabaseUrl);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Request Logger Middleware
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

// Handle 404 Errors (Page Not Found)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Page not found' });
});

//Express Error Handler Middleware
app.use(errorHandler);

// Start Server after DB Connection
mongoose.connection.once('open', () => {
  logger.info(' MongoDB connected successfully.');
  app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
    logger.info(` Server running on ${PORT}`);
  });
});

// Handle MongoDB Connection Errors
mongoose.connection.on('error', (err) => {
  logger.warn(' MongoDB Connection Error:', err);
});
