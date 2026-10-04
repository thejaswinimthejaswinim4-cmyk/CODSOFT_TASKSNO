const express = require('express');
const router = express.Router();
const contactRoutes = require('./contactRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/health', healthRoutes);
router.use('/contacts', contactRoutes);

module.exports = router;
