const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      name: 'unique_course_code',
      msg: 'Course code already exists',
    },
    validate: {
      notEmpty: { msg: 'Course code cannot be empty' },
    },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Course title cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Credits must be an integer' },
      min: { args: [1], msg: 'Credits must be at least 1' },
      max: { args: [10], msg: 'Credits cannot exceed 10' },
    },
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Active',
    validate: {
      isIn: {
        args: [['Active', 'Archived']],
        msg: 'Status must be either Active or Archived',
      },
    },
  },
}, {
  tableName: 'courses',
  timestamps: true,
});

module.exports = Course;
