const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Resolve database storage path
const dbStorage = process.env.DB_STORAGE || './database.sqlite';
const storagePath = path.isAbsolute(dbStorage)
  ? dbStorage
  : path.resolve(process.cwd(), dbStorage);

// Initialize Sequelize instance with SQLite configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: process.env.NODE_ENV === 'development' ? false : false, // Set to console.log for SQL query debugging
  define: {
    timestamps: true, // Auto-manage createdAt and updatedAt
    underscored: false,
  },
});

// Test and sync database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(' SQLite database connection established successfully.');
    
    // Sync models with database
    await sequelize.sync();
    console.log(' Database models synchronized.');
  } catch (error) {
    console.error(' Unable to connect to SQLite database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
