const Joi = require('joi');

// Schema for route parameter :id
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive integer',
    'any.required': 'ID is required',
  }),
});

// Schema for creating a student
const createStudentSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().trim().email().max(100).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Date of birth must be in YYYY-MM-DD ISO format',
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional().default('Other').messages({
    'any.only': 'Gender must be Male, Female, or Other',
  }),
  status: Joi.string().valid('Active', 'Inactive', 'Graduated', 'Suspended').optional().default('Active').messages({
    'any.only': 'Status must be Active, Inactive, Graduated, or Suspended',
  }),
});

// Schema for updating a student (partial update allowed)
const updateStudentSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().trim().email().max(100).optional(),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  status: Joi.string().valid('Active', 'Inactive', 'Graduated', 'Suspended').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Schema for querying students (search, filter, sort, paginate)
const studentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('Active', 'Inactive', 'Graduated', 'Suspended').optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  sortBy: Joi.string().valid('id', 'firstName', 'lastName', 'email', 'createdAt', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  idParamSchema,
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
};
