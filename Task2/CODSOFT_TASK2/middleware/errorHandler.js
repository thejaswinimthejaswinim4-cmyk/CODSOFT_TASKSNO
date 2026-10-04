/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log unexpected errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
        console.error('Unhandled Error:', err);
    }

    // Handle JSON syntax parsing errors from express.json()
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload provided.'
        });
    }

    // Handle Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const errorDetails = err.errors ? err.errors.map(e => ({
            field: e.path,
            message: e.message
        })) : [];

        return res.status(409).json({
            success: false,
            message: 'A duplicate record already exists.',
            errors: errorDetails
        });
    }

    // Handle Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const errorDetails = err.errors ? err.errors.map(e => ({
            field: e.path,
            message: e.message
        })) : [];

        return res.status(400).json({
            success: false,
            message: 'Validation error.',
            errors: errorDetails
        });
    }

    // Handle generic custom errors with status code
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
