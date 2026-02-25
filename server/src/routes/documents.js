const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    updateDocumentVersion,
    getMyDocuments,
    getAllDocumentsForApprover,
    reviewDocument,
    getDocumentDetails,
    deleteDocument
} = require('../controllers/documents');
const { authMiddleware, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authMiddleware, authorize('CLIENT'), upload.single('document'), uploadDocument);
router.post('/upload/:id/version', authMiddleware, authorize('CLIENT'), upload.single('document'), updateDocumentVersion);
router.get('/my-documents', authMiddleware, authorize('CLIENT'), getMyDocuments);

router.get('/all', authMiddleware, authorize('APPROVER', 'ADMIN'), getAllDocumentsForApprover);
router.patch('/review/:id', authMiddleware, authorize('APPROVER', 'ADMIN'), reviewDocument);
router.get('/:id', authMiddleware, getDocumentDetails);
router.delete('/:id', authMiddleware, authorize('CLIENT', 'ADMIN'), deleteDocument);

module.exports = router;
