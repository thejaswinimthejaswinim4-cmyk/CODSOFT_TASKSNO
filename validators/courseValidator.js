const Joi = require('joi');

// Schema for course route parameter :id
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive integer',
    'any.required': 'ID is required',
  }),
});

// Schema for creating a course
const createCourseSchema = Joi.object({
  courseCode: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    'string.empty': 'Course code is required',
    'string.min': 'Course code must be at least 2 characters',
    'string.max': 'Course code cannot exceed 20 characters',
    'any.required': 'Course code is required',
  }),
  title: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Course title is required',
    'string.min': 'Course title must be at least 2 characters',
    'string.max': 'Course title cannot exceed 100 characters',
    'any.required': 'Course title is required',
  }),
  description: Joi.string().trim().max(1000).allow('', null).optional(),
  credits: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Credits must be a number',
    'number.min': 'Credits must be at least 1',
    'number.max': 'Credits cannot exceed 10',
    'any.required': 'Credits is required',
  }),
  department: Joi.string().trim().max(50).allow('', null).optional(),
  status: Joi.string().valid('Active', 'Archived').optional().default('Active').messages({
    'any.only': 'Status must be either Active or Archived',
  }),
});

// Schema for updating a course
const updateCourseSchema = Joi.object({
  courseCode: Joi.string().trim().uppercase().min(2).max(20).optional(),
  title: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(1000).allow('', null).optional(),
  credits: Joi.number().integer().min(1).max(10).optional(),
  department: Joi.string().trim().max(50).allow('', null).optional(),
  status: Joi.string().valid('Active', 'Archived').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Schema for querying courses
const courseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
  department: Joi.string().trim().optional(),
  credits: Joi.number().integer().min(1).max(10).optional(),
  status: Joi.string().valid('Active', 'Archived').optional(),
  sortBy: Joi.string().valid('id', 'courseCode', 'title', 'credits', 'department', 'createdAt', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  idParamSchema,
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
};
