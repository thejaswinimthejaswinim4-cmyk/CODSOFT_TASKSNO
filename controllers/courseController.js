const { Op } = require('sequelize');
const { Course, Enrollment, Student } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Public
 */
const createCourse = asyncHandler(async (req, res, next) => {
  const { courseCode } = req.body;

  // Check if course with courseCode already exists
  const existingCourse = await Course.findOne({ where: { courseCode } });
  if (existingCourse) {
    return next(new AppError(`Course with code '${courseCode}' already exists`, 409));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

/**
 * @desc    Retrieve all courses with search, filtering, sorting, and pagination
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    credits,
    status,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  } = req.query;

  const whereClause = {};

  // Search across courseCode, title, description, or department
  if (search) {
    whereClause[Op.or] = [
      { courseCode: { [Op.like]: `%${search}%` } },
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { department: { [Op.like]: `%${search}%` } },
    ];
  }

  // Exact match filters
  if (department) {
    whereClause.department = department;
  }
  if (credits) {
    whereClause.credits = credits;
  }
  if (status) {
    whereClause.status = status;
  }

  const offset = (page - 1) * limit;

  const { count: totalItems, rows: courses } = await Course.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, sortOrder.toUpperCase()]],
  });

  const totalPages = Math.ceil(totalItems / limit) || 1;

  res.status(200).json({
    success: true,
    data: courses,
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
 * @desc    Retrieve course by ID with enrolled students
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findByPk(id, {
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
          },
        ],
      },
    ],
  });

  if (!course) {
    return next(new AppError(`Course with ID ${id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @desc    Update course by ID
 * @route   PUT /api/courses/:id
 * @access  Public
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { courseCode } = req.body;

  const course = await Course.findByPk(id);

  if (!course) {
    return next(new AppError(`Course with ID ${id} not found`, 404));
  }

  // If courseCode is updated, check uniqueness
  if (courseCode && courseCode !== course.courseCode) {
    const codeExists = await Course.findOne({ where: { courseCode } });
    if (codeExists) {
      return next(new AppError(`Course code '${courseCode}' is already taken by another course`, 409));
    }
  }

  await course.update(req.body);

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course,
  });
});

/**
 * @desc    Delete course by ID
 * @route   DELETE /api/courses/:id
 * @access  Public
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findByPk(id);

  if (!course) {
    return next(new AppError(`Course with ID ${id} not found`, 404));
  }

  await course.destroy();

  res.status(200).json({
    success: true,
    message: `Course with ID ${id} deleted successfully`,
  });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
