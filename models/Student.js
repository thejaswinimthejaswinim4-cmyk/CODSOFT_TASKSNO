const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name cannot be empty' },
    },
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name cannot be empty' },
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_student_email',
      msg: 'Email address is already registered',
    },
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email cannot be empty' },
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Invalid date format for date of birth (YYYY-MM-DD)' },
    },
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'Other',
    validate: {
      isIn: {
        args: [['Male', 'Female', 'Other']],
        msg: 'Gender must be Male, Female, or Other',
      },
    },
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Active',
    validate: {
      isIn: {
        args: [['Active', 'Inactive', 'Graduated', 'Suspended']],
        msg: 'Status must be Active, Inactive, Graduated, or Suspended',
      },
    },
  },
}, {
  tableName: 'students',
  timestamps: true,
});

module.exports = Student;
