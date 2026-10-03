const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const validate = require('../middleware/validate');
const {
  idParamSchema,
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
} = require('../validators/studentValidator');

router
  .route('/')
  .get(validate(studentQuerySchema, 'query'), studentController.getAllStudents)
  .post(validate(createStudentSchema, 'body'), studentController.createStudent);

router
  .route('/:id')
  .get(validate(idParamSchema, 'params'), studentController.getStudentById)
  .put(
    validate(idParamSchema, 'params'),
    validate(updateStudentSchema, 'body'),
    studentController.updateStudent
  )
  .delete(validate(idParamSchema, 'params'), studentController.deleteStudent);

module.exports = router;
