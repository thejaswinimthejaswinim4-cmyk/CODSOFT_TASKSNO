const Joi = require('joi');

// Schema for enrollment route parameter :id
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive integer',
    'any.required': 'ID is required',
  }),
});

// Schema for creating an enrollment
const createEnrollmentSchema = Joi.object({
  studentId: Joi.number().integer().positive().required().messages({
    'number.base': 'Student ID must be a number',
    'number.positive': 'Student ID must be a positive integer',
    'any.required': 'Student ID is required',
  }),
  courseId: Joi.number().integer().positive().required().messages({
    'number.base': 'Course ID must be a number',
    'number.positive': 'Course ID must be a positive integer',
    'any.required': 'Course ID is required',
  }),
  enrollmentDate: Joi.date().iso().optional().messages({
    'date.format': 'Enrollment date must be in YYYY-MM-DD ISO format',
  }),
  grade: Joi.string().trim().max(20).allow('', null).optional().default('In Progress'),
  status: Joi.string().valid('Enrolled', 'Completed', 'Dropped').optional().default('Enrolled').messages({
    'any.only': 'Status must be Enrolled, Completed, or Dropped',
  }),
});

// Schema for updating an enrollment (e.g. updating grade, status, or enrollmentDate)
const updateEnrollmentSchema = Joi.object({
  grade: Joi.string().trim().max(20).allow('', null).optional(),
  status: Joi.string().valid('Enrolled', 'Completed', 'Dropped').optional(),
  enrollmentDate: Joi.date().iso().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update (grade, status, or enrollmentDate)',
});

// Schema for querying enrollments
const enrollmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
  studentId: Joi.number().integer().positive().optional(),
  courseId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('Enrolled', 'Completed', 'Dropped').optional(),
  grade: Joi.string().trim().optional(),
  sortBy: Joi.string().valid('id', 'studentId', 'courseId', 'enrollmentDate', 'grade', 'status', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  idParamSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  enrollmentQuerySchema,
};
