const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, internalHealth } = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/health', internalHealth);

module.exports = router;
