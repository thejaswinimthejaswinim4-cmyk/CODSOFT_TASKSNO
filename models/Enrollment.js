const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
    validate: {
      notNull: { msg: 'Student ID is required' },
      isInt: { msg: 'Student ID must be an integer' },
    },
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    validate: {
      notNull: { msg: 'Course ID is required' },
      isInt: { msg: 'Course ID must be an integer' },
    },
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Invalid date format for enrollment date (YYYY-MM-DD)' },
    },
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'In Progress',
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Enrolled',
    validate: {
      isIn: {
        args: [['Enrolled', 'Completed', 'Dropped']],
        msg: 'Status must be Enrolled, Completed, or Dropped',
      },
    },
  },
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'courseId'],
      name: 'unique_student_course_enrollment',
    },
  ],
});

module.exports = Enrollment;
