const { Task } = require("../models");

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    if (status && !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending or completed"
      });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high"
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      status: status || "pending",
      priority,
      category,
      dueDate
    });

    return res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;

    const where = {};

    if (status) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be pending or completed"
        });
      }

      where.status = status;
    }

    if (priority) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Priority must be low, medium, or high"
        });
      }

      where.priority = priority;
    }

    if (category) {
      where.category = category;
    }

    const tasks = await Task.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty"
      });
    }

    if (status !== undefined && !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending or completed"
      });
    }

    if (
      priority !== undefined &&
      !["low", "medium", "high"].includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high"
      });
    }

    await task.update({
      title: title !== undefined ? title.trim() : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      category: category !== undefined ? category : task.category,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const { status } = req.body;

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending or completed"
      });
    }

    await task.update({ status });

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};