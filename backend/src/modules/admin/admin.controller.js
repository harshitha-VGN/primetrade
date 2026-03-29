const adminService = require('./admin.service');
const { success, error } = require('../../utils/apiResponse');

// Stats

const getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    return success(res, stats, 'Platform statistics.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// Users 

const getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return success(res, result, 'All users fetched.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const promoteUser = async (req, res) => {
  try {
    const user = await adminService.promoteUser(req.params.id, req.user.id);
    return success(res, user, `${user.name} promoted to admin.`);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const demoteUser = async (req, res) => {
  try {
    const user = await adminService.demoteUser(req.params.id, req.user.id);
    return success(res, user, `${user.name} demoted to user.`);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id, req.user.id);
    return success(res, null, 'User and their tasks deleted.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

//  Tasks 
const getAllTasks = async (req, res) => {
  try {
    const result = await adminService.getAllTasks(req.query);
    return success(res, result, 'All tasks fetched.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    await adminService.deleteAnyTask(req.params.id);
    return success(res, null, 'Task deleted by admin.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getStats, getAllUsers, promoteUser, demoteUser, deleteUser, getAllTasks, deleteTask };