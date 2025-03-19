const User = require('../models/user.model');
const { validateEditedUser } = require('../utils/validator');

const updateUser = async (req, res) => {
  const userId = req.user.id;
  const { email, password, name } = req.body;

  const { error } = validateEditedUser(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Please provide necessary details',
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User does not exist',
    });
  }

  if (email) user.email = email;
  if (name) user.name = name;
  if (password) user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
};

const deleteUser = async (req, res) => {
  const user = req.user;
  const userId = req.body.userId;
  const password = req.body.password;

  const isUser = await User.findById(userId);
  if (!isUser) {
    return res.status(400).json({
      success: false,
      message: 'User does not exist',
    });
  }

  // Admin can delete without a password, users must verify their own password
  if (user.role !== 'admin') {
    const isValidPassword = password
      ? await isUser.verifyPassword(password)
      : null;
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect Credentials',
      });
    }
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
};

const getUser = async (req, res) => {
  const userId = req.params.userId;

  console.log(userId);

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({});

  if (!users?.length) {
    res.status(404).json({
      success: true,
      message: 'No user found',
    });
  }

  res.status(200).json({
    success: true,
    data: users,
  });
};

module.exports = { updateUser, deleteUser, getUser, getAllUsers };
