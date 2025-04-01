const express = require('express');

const router = express.Router();
const loginLimiter = require('../middlewares/loginLimiter');
const {
  registerUser,
  loginUser,
  refresh,
  logout,
} = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logout);
router.get('/refresh', refresh);

module.exports = router;
