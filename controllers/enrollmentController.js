const { Op } = require('sequelize');
const { Enrollment, Student, Course } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Enroll a student in a course
 * @route   POST /api/enrollments
 * @access  Public
 */
const createEnrollment = asyncHandler(async (req, res, next) => {
  const { studentId, courseId, enrollmentDate, grade, status } = req.body;

  // 1. Verify student exists
  const student = await Student.findByPk(studentId);
  if (!student) {
    return next(new AppError(`Student with ID ${studentId} does not exist`, 404));
  }

  // 2. Verify course exists
  const course = await Course.findByPk(courseId);
  if (!course) {
    return next(new AppError(`Course with ID ${courseId} does not exist`, 404));
  }

  // 3. Check for existing enrollment
  const existingEnrollment = await Enrollment.findOne({
    where: { studentId, courseId },
  });
  if (existingEnrollment) {
    return next(
      new AppError(`Student (ID ${studentId}) is already enrolled in Course (ID ${courseId})`, 409)
    );
  }

  // 4. Create enrollment
  const newEnrollment = await Enrollment.create({
    studentId,
    courseId,
    ...(enrollmentDate && { enrollmentDate }),
    ...(grade && { grade }),
    ...(status && { status }),
  });

  // Re-fetch with associated student and course information
  const enrollment = await Enrollment.findByPk(newEnrollment.id, {
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'courseCode', 'title', 'credits', 'department'],
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Enrollment created successfully',
    data: enrollment,
  });
});

/**
 * @desc    Retrieve all enrollments with search, filtering, sorting, and pagination
 * @route   GET /api/enrollments
 * @access  Public
 */
const getAllEnrollments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    studentId,
    courseId,
    status,
    grade,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  } = req.query;

  const whereClause = {};

  // Search across grade or status
  if (search) {
    whereClause[Op.or] = [
      { grade: { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
    ];
  }

  // Exact match filters
  if (studentId) {
    whereClause.studentId = studentId;
  }
  if (courseId) {
    whereClause.courseId = courseId;
  }
  if (status) {
    whereClause.status = status;
  }
  if (grade) {
    whereClause.grade = grade;
  }

  const offset = (page - 1) * limit;

  const { count: totalItems, rows: enrollments } = await Enrollment.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, sortOrder.toUpperCase()]],
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'courseCode', 'title', 'credits', 'department'],
      },
    ],
  });

  const totalPages = Math.ceil(totalItems / limit) || 1;

  res.status(200).json({
    success: true,
    data: enrollments,
    pagination: {
      totalItems,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * @desc    Retrieve enrollment by ID with student and course details
 * @route   GET /api/enrollments/:id
 * @access  Public
 */
const getEnrollmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findByPk(id, {
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'courseCode', 'title', 'credits', 'department'],
      },
    ],
  });

  if (!enrollment) {
    return next(new AppError(`Enrollment with ID ${id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

/**
 * @desc    Update enrollment by ID (e.g. grade, status, enrollmentDate)
 * @route   PUT /api/enrollments/:id
 * @access  Public
 */
const updateEnrollment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findByPk(id);

  if (!enrollment) {
    return next(new AppError(`Enrollment with ID ${id} not found`, 404));
  }

  await enrollment.update(req.body);

  // Return updated entity with associated details
  const updated = await Enrollment.findByPk(id, {
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'courseCode', 'title', 'credits', 'department'],
      },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Enrollment updated successfully',
    data: updated,
  });
});

/**
 * @desc    Delete enrollment by ID
 * @route   DELETE /api/enrollments/:id
 * @access  Public
 */
const deleteEnrollment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findByPk(id);

  if (!enrollment) {
    return next(new AppError(`Enrollment with ID ${id} not found`, 404));
  }

  await enrollment.destroy();

  res.status(200).json({
    success: true,
    message: `Enrollment with ID ${id} deleted successfully`,
  });
});

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
};
