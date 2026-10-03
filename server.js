const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome / Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Student Record Management API',
    version: '1.0.0',
    documentation: {
      healthCheck: '/api/health',
      students: '/api/students',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
    },
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// Catch 404 routes
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server and Connect Database
let server;
const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(` Student Record Management API running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
  });
};

if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(' [Unhandled Rejection]:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

module.exports = { app, startServer };
