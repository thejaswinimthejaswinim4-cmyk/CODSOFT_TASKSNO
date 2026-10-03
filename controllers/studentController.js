const { Op } = require('sequelize');
const { Student, Enrollment, Course } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Public
 */
const createStudent = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if student with email already exists
  const existingStudent = await Student.findOne({ where: { email } });
  if (existingStudent) {
    return next(new AppError(`Student with email '${email}' already exists`, 409));
  }

  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: student,
  });
});

/**
 * @desc    Retrieve all students with search, filtering, sorting, and pagination
 * @route   GET /api/students
 * @access  Public
 */
const getAllStudents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    gender,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  } = req.query;

  const whereClause = {};

  // Search across firstName, lastName, or email
  if (search) {
    whereClause[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // Exact match filters
  if (status) {
    whereClause.status = status;
  }
  if (gender) {
    whereClause.gender = gender;
  }

  const offset = (page - 1) * limit;

  const { count: totalItems, rows: students } = await Student.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, sortOrder.toUpperCase()]],
  });

  const totalPages = Math.ceil(totalItems / limit) || 1;

  res.status(200).json({
    success: true,
    data: students,
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
 * @desc    Retrieve student by ID with their enrollments and courses
 * @route   GET /api/students/:id
 * @access  Public
 */
const getStudentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const student = await Student.findByPk(id, {
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'courseCode', 'title', 'credits', 'department'],
          },
        ],
      },
    ],
  });

  if (!student) {
    return next(new AppError(`Student with ID ${id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

/**
 * @desc    Update student by ID
 * @route   PUT /api/students/:id
 * @access  Public
 */
const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const student = await Student.findByPk(id);

  if (!student) {
    return next(new AppError(`Student with ID ${id} not found`, 404));
  }

  // If email is updated, ensure uniqueness
  if (email && email !== student.email) {
    const emailExists = await Student.findOne({ where: { email } });
    if (emailExists) {
      return next(new AppError(`Email '${email}' is already taken by another student`, 409));
    }
  }

  await student.update(req.body);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student,
  });
});

/**
 * @desc    Delete student by ID
 * @route   DELETE /api/students/:id
 * @access  Public
 */
const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const student = await Student.findByPk(id);

  if (!student) {
    return next(new AppError(`Student with ID ${id} not found`, 404));
  }

  await student.destroy();

  res.status(200).json({
    success: true,
    message: `Student with ID ${id} deleted successfully`,
  });
});

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
