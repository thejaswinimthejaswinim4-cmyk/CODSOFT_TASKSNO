require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Authenticate database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Synchronize models with the database
        await sequelize.sync();
        console.log('Database synchronized successfully.');

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Contacts endpoint: http://localhost:${PORT}/api/contacts`);
        });

        return server;
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = { startServer };
