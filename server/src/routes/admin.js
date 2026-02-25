const express = require('express');
const router = express.Router();
const { getAllUsers, getAuditLogs, getSystemStats, deleteUser, banUser, getAllDocuments } = require('../controllers/admin');
const { authMiddleware, authorize } = require('../middleware/auth');

router.get('/users', authMiddleware, authorize('ADMIN'), getAllUsers);
router.get('/logs', authMiddleware, authorize('ADMIN'), getAuditLogs);
router.get('/stats', authMiddleware, authorize('ADMIN'), getSystemStats);
router.get('/documents', authMiddleware, authorize('ADMIN'), getAllDocuments);
router.delete('/users/:id', authMiddleware, authorize('ADMIN'), deleteUser);
router.post('/users/:id/ban', authMiddleware, authorize('ADMIN'), banUser);

module.exports = router;
