//import joi validation helper functions
const { validateRegistration, validateLogin } = require('../utils/validator');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// import JWT generator helpers
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateJWT');

// @desc   register a user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  // valid user entries
  const { error } = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const { email, password, name } = req.body;

  const isRegistered = await User.findOne({ email });

  if (isRegistered) {
    return res.status(400).json({
      success: false,
      message: 'User already exist',
    });
  }

  const newUser = new User({ email, password, name });

  await newUser.save();
  res.status(201).json({
    success: true,
    data: newUser,
  });
};

// @desc   login a registered user and send JWT
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  // valid user entries
  const { error } = validateLogin(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
  const { email, password } = req.body;

  const isUser = await User.findOne({ email });

  if (!isUser) {
    return res.status(400).json({
      success: false,
      message: 'User does not exist',
    });
  }
  // verifyPassword is a a custom mongoose method to verify user password
  const isValidPassword = await isUser.verifyPassword(password);

  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      message: 'Incorrect Credentials',
    });
  }
  // generate access and refresh token for isUser
  const accessToken = generateAccessToken(isUser);

  const refreshToken = generateRefreshToken(isUser);

  res
    .status(200)
    .cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      data: isUser,
      token: accessToken,
    });
};

// @desc   refresh token
// @route  GET /api/auth/refresh
// @access Private
const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(400).json({
      success: false,
      message: 'unauthorized',
    });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: ' Forbidden',
      });
    }
    const isUser = await User.findById(decoded.user.id);

    if (!isUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    const accessToken = generateAccessToken(isUser);
    res.status(200).json({
      success: true,
      token: accessToken,
    });
  });
};

// @desc   register a user
// @route  POST /api/auth/logout
// @access Public

const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(400).json({
      success: false,
      message: 'No cookie found',
    });
  }

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
  res.json({
    success: true,
    message: ' logged out successfully',
  });
};

module.exports = { registerUser, loginUser, refresh, logout };
