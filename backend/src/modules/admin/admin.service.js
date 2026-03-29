const User = require('../auth/user.model');
const Task = require('../tasks/task.model');

//  Users 

const getAllUsers = async ({ search, role, page = 1, limit = 20 } = {}) => {
  const query = {};
  if (role && ['user', 'admin'].includes(role)) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query, '-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return { users, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
};

const promoteUser = async (id, requestingAdminId) => {
  if (id === requestingAdminId) throw { status: 400, message: 'Cannot change your own role.' };
  const user = await User.findById(id, '-password');
  if (!user) throw { status: 404, message: 'User not found.' };
  user.role = 'admin';
  await user.save();
  return user;
};

const demoteUser = async (id, requestingAdminId) => {
  if (id === requestingAdminId) throw { status: 400, message: 'Cannot demote yourself.' };
  const user = await User.findById(id, '-password');
  if (!user) throw { status: 404, message: 'User not found.' };
  user.role = 'user';
  await user.save();
  return user;
};

const deleteUser = async (id, requestingAdminId) => {
  if (id === requestingAdminId) throw { status: 400, message: 'Cannot delete your own account.' };
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: 'User not found.' };
  // Cascade-delete user's tasks
  await Task.deleteMany({ user: id });
  await user.deleteOne();
  return { deleted: true };
};

// ── Tasks ────────────────────────────────────────────────────────────────────

const getAllTasks = async ({ search, status, userId, page = 1, limit = 20 } = {}) => {
  const query = {};
  if (status && ['pending', 'in_progress', 'completed'].includes(status)) query.status = status;
  if (userId) query.user = userId;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];

  const skip = (page - 1) * limit;
  const [tasks, total] = await Promise.all([
    Task.find(query).populate('user', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  return { tasks, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
};

const deleteAnyTask = async (id) => {
  const task = await Task.findById(id);
  if (!task) throw { status: 404, message: 'Task not found.' };
  await task.deleteOne();
  return { deleted: true };
};

//  Stats 

const getStats = async () => {
  const [totalUsers, totalAdmins, totalTasks, tasksByStatus] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'admin' }),
    Task.countDocuments(),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusMap = { pending: 0, in_progress: 0, completed: 0 };
  tasksByStatus.forEach(({ _id, count }) => { if (_id in statusMap) statusMap[_id] = count; });

  return {
    users: { total: totalUsers + totalAdmins, regular: totalUsers, admins: totalAdmins },
    tasks: { total: totalTasks, ...statusMap },
  };
};

module.exports = { getAllUsers, promoteUser, demoteUser, deleteUser, getAllTasks, deleteAnyTask, getStats };