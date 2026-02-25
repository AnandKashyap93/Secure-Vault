const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
