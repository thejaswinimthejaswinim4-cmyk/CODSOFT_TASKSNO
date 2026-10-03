const express = require('express');
const router = express.Router();

const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');

// API Health Check & Metadata
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Record Management API is operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      students: '/api/students',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
    },
  });
});

// Resource routes
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);

module.exports = router;
