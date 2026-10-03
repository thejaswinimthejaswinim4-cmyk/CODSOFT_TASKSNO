const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const validate = require('../middleware/validate');
const {
  idParamSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  enrollmentQuerySchema,
} = require('../validators/enrollmentValidator');

router
  .route('/')
  .get(validate(enrollmentQuerySchema, 'query'), enrollmentController.getAllEnrollments)
  .post(validate(createEnrollmentSchema, 'body'), enrollmentController.createEnrollment);

router
  .route('/:id')
  .get(validate(idParamSchema, 'params'), enrollmentController.getEnrollmentById)
  .put(
    validate(idParamSchema, 'params'),
    validate(updateEnrollmentSchema, 'body'),
    enrollmentController.updateEnrollment
  )
  .delete(validate(idParamSchema, 'params'), enrollmentController.deleteEnrollment);

module.exports = router;
