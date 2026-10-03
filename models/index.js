const { sequelize } = require('../config/database');
const Student = require('./Student');
const Course = require('./Course');
const Enrollment = require('./Enrollment');

// Define Relationships

// 1. One student can have many enrollments
Student.hasMany(Enrollment, {
  foreignKey: 'studentId',
  as: 'enrollments',
  onDelete: 'CASCADE',
});

// 2. Each enrollment belongs to one student
Enrollment.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student',
});

// 3. One course can have many enrollments
Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'enrollments',
  onDelete: 'CASCADE',
});

// 4. Each enrollment belongs to one course
Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// Many-to-Many associations between Student and Course via Enrollment
Student.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId',
  otherKey: 'courseId',
  as: 'courses',
});

Course.belongsToMany(Student, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'studentId',
  as: 'students',
});

module.exports = {
  sequelize,
  Student,
  Course,
  Enrollment,
};
