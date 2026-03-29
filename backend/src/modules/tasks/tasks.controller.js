const taskService = require('./tasks.service');
const { success, error } = require('../../utils/apiResponse');

const create = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    return success(res, task, 'Task created.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMine = async (req, res) => {
  try {
    const tasks = await taskService.getMyTasks(req.user.id);
    return success(res, tasks, 'Your tasks.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getAll = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    return success(res, tasks, 'All tasks.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.user.id, req.user.role, req.body);
    return success(res, task, 'Task updated.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const remove = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id, req.user.role);
    return success(res, null, 'Task deleted.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { create, getMine, getAll, update, remove };