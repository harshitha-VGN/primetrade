const authService = require('./auth.service');
const { success, error } = require('../../utils/apiResponse');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return success(res, user, 'User registered successfully.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return success(res, data, 'Login successful.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMe = (req, res) => {
  return success(res, req.user, 'Authenticated user info.');
};

const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    return success(res, users, 'All users fetched.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, getMe, getAllUsers };