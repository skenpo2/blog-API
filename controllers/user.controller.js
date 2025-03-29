const User = require('../models/user.model');
// import joi validation helper function
const { validateEditedUser } = require('../utils/validator');

// @desc   get a user
// @route  PUT  /api/user/
// @access Private (user can only edit his or her own details)
const updateUser = async (req, res) => {
  const userId = req.user.id; //obtain userId from JWT
  const { email, password, name } = req.body;

  //validate user entries
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

// @desc   Delete a user
// @route  DELETE /api/user
// @access Private (only the logged user and an admin can delete)
const deleteUser = async (req, res) => {
  const user = req.user; //get the logged user from JWT
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

// @desc   get a user
// @route  GET  /api/user/:userId
// @access Public
const getUser = async (req, res) => {
  const userId = req.params.userId;

  const user = await User.findById(userId).select('name posts comments');

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

// @desc   get all users
// @route  GET  /api/user
// @access Private (Admin Only)
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('name posts comments');

  if (!users?.length) {
    return res.status(404).json({
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
