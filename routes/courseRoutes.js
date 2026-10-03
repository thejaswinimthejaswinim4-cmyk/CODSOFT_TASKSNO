const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const validate = require('../middleware/validate');
const {
  idParamSchema,
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
} = require('../validators/courseValidator');

router
  .route('/')
  .get(validate(courseQuerySchema, 'query'), courseController.getAllCourses)
  .post(validate(createCourseSchema, 'body'), courseController.createCourse);

router
  .route('/:id')
  .get(validate(idParamSchema, 'params'), courseController.getCourseById)
  .put(
    validate(idParamSchema, 'params'),
    validate(updateCourseSchema, 'body'),
    courseController.updateCourse
  )
  .delete(validate(idParamSchema, 'params'), courseController.deleteCourse);

module.exports = router;
