const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending"
    },

    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: true
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "tasks",
    timestamps: true
  }
);

module.exports = Task;