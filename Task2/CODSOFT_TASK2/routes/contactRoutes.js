const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const {
    validateCreateContact,
    validateUpdateContact,
    validateContactId,
    validateQueryParams
} = require('../validators/contactValidator');

// CRUD endpoints for contacts
router.post('/', validateCreateContact, contactController.createContact);
router.get('/', validateQueryParams, contactController.getAllContacts);
router.get('/:id', validateContactId, contactController.getContactById);
router.put('/:id', validateContactId, validateUpdateContact, contactController.updateContact);
router.delete('/:id', validateContactId, contactController.deleteContact);

module.exports = router;
