const Task = require('./task.model');

const mapTask = (taskDoc) => ({
  id: taskDoc._id,
  title: taskDoc.title,
  description: taskDoc.description,
  status: taskDoc.status,
  user: taskDoc.user,
  created_at: taskDoc.createdAt,
  updated_at: taskDoc.updatedAt,
});

const createTask = async ({ title, description, status }, userId) => {
  const task = await Task.create({ title, description, status, user: userId });
  return mapTask(task);
};

const getMyTasks = async (userId) => {
  const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
  return tasks.map(mapTask);
};

const getAllTasks = async () => {
  const tasks = await Task.find().populate('user', 'name email').sort({ createdAt: -1 });
  return tasks.map(mapTask);
};

const updateTask = async (id, userId, role, updates) => {
  const task = await Task.findById(id);
  if (!task) throw { status: 404, message: 'Task not found.' };
  if (task.user.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Not authorized.' };

  const { title, description, status } = updates;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  await task.save();
  return mapTask(task);
};

const deleteTask = async (id, userId, role) => {
  const task = await Task.findById(id);
  if (!task) throw { status: 404, message: 'Task not found.' };
  if (task.user.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Not authorized.' };
  await task.deleteOne();
  return { deleted: true };
};

module.exports = { createTask, getMyTasks, getAllTasks, updateTask, deleteTask };