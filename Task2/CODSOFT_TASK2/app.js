const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Contact Management REST API',
        endpoints: {
            health: '/api/health',
            contacts: '/api/contacts'
        }
    });
});

// Direct health-check endpoint
app.use('/health', healthRoutes);

// API routes prefix (/api/health, /api/contacts)
app.use('/api', apiRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Catch all errors
app.use(errorHandler);

module.exports = app;
