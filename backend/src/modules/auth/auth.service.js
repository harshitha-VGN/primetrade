const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const register = async ({ name, email, password, adminSecret }) => {
  const existing = await User.findOne({ email });
  if (existing) throw { status: 409, message: 'Email already registered.' };

  const hashed = await bcrypt.hash(password, 12);
  
  // If correct admin secret is provided, create as admin
  const role = adminSecret && adminSecret === process.env.ADMIN_SECRET ? 'admin' : 'user';
  
  const user = await User.create({ name, email, password: hashed, role });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 401, message: 'Invalid email or password.' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid email or password.' };

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const getAllUsers = async () => {
  return await User.find({}, '-password').sort({ createdAt: -1 });
};

module.exports = { register, login, getAllUsers };