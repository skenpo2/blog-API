const express = require('express');

const { registerUser } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register');
router.post('/login');
router.post('/logout');
router.get('/refresh-token');

module.exports = router;
