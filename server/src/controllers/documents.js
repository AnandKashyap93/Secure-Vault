const { Document, Version, Comment } = require('../models');
const { logAction } = require('../utils/logger');

const uploadDocument = async (req, res) => {
    const { title, description, approverEmail, priority, category } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const document = await Document.create({
            title,
            description,
            approverEmail,
            priority: priority || 'NORMAL',
            category: category || 'GENERAL',
            clientId: req.user.id
        });

        const version = await Version.create({
            versionNum: 1,
            fileUrl: file.path,
            fileName: file.originalname,
            documentId: document._id
        });

        await logAction('DOCUMENT_UPLOAD', `Uploaded document: ${title}`, req.user.id, req);

        const docObj = document.toObject();
        docObj.id = docObj._id;
        docObj.versions = [{ ...version.toObject(), id: version._id }];

        res.status(201).json(docObj);
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

const updateDocumentVersion = async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded for new version' });
    }

    try {
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this document' });
        }

        const latestVersion = await Version.findOne({ documentId: id }).sort({ versionNum: -1 });
        const nextVersion = latestVersion ? latestVersion.versionNum + 1 : 1;

        const newVersion = await Version.create({
            versionNum: nextVersion,
            fileUrl: file.path,
            fileName: file.originalname,
            documentId: document._id
        });

        document.status = 'PENDING';
        await document.save();

        await logAction('DOCUMENT_VERSION_UPDATE', `Uploaded version ${nextVersion} for: ${document.title}`, req.user.id, req);

        const docObj = document.toObject();
        docObj.id = docObj._id;
        docObj.versions = [{ ...newVersion.toObject(), id: newVersion._id }];

        res.json(docObj);
    } catch (error) {
        res.status(500).json({ message: 'Version update failed', error: error.message });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ clientId: req.user.id }).sort({ updatedAt: -1 }).lean();

        const docsWithVersions = await Promise.all(documents.map(async (doc) => {
            const versions = await Version.find({ documentId: doc._id }).sort({ versionNum: -1 }).lean();
            return {
                ...doc,
                id: doc._id,
                versions: versions.map(v => ({ ...v, id: v._id }))
            };
        }));

        res.json(docsWithVersions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

const getAllDocumentsForApprover = async (req, res) => {
    try {
        const documents = await Document.find({ approverEmail: req.user.email })
            .populate('clientId', 'name email')
            .sort({ updatedAt: -1 })
            .lean();

        const docsWithVersions = await Promise.all(documents.map(async (doc) => {
            const versions = await Version.find({ documentId: doc._id }).sort({ versionNum: -1 }).lean();
            return {
                ...doc,
                id: doc._id,
                client: doc.clientId ? { name: doc.clientId.name, email: doc.clientId.email } : null,
                versions: versions.map(v => ({ ...v, id: v._id }))
            };
        }));

        res.json(docsWithVersions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

const reviewDocument = async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const document = await Document.findById(id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        document.status = status;
        await document.save();

        if (comment) {
            await Comment.create({
                text: comment,
                documentId: document._id,
                authorId: req.user.id
            });
        }

        await logAction(`DOCUMENT_${status}`, `Reviewed document ID: ${id}`, req.user.id, req);

        // Fetch document details simply to return it with comments like Prisma did
        const comments = await Comment.find({ documentId: document._id })
            .populate('authorId', 'name')
            .lean();

        const docObj = document.toObject();
        docObj.id = docObj._id;
        docObj.comments = comments.map(c => ({
            ...c,
            id: c._id,
            author: c.authorId ? { name: c.authorId.name } : null
        }));

        res.json(docObj);
    } catch (error) {
        res.status(500).json({ message: 'Review update failed', error: error.message });
    }
};

const getDocumentDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await Document.findById(id)
            .populate('clientId', 'name email')
            .lean();

        if (!document) return res.status(404).json({ message: 'Document not found' });

        const versions = await Version.find({ documentId: document._id }).sort({ versionNum: -1 }).lean();
        const comments = await Comment.find({ documentId: document._id })
            .populate('authorId', 'name role')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            ...document,
            id: document._id,
            client: document.clientId ? { name: document.clientId.name, email: document.clientId.email } : null,
            versions: versions.map(v => ({ ...v, id: v._id })),
            comments: comments.map(c => ({
                ...c,
                id: c._id,
                author: c.authorId ? { name: c.authorId.name, role: c.authorId.role } : null
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch document', error: error.message });
    }
};

const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await Document.findById(id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        if (req.user.role !== 'ADMIN' && document.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this document' });
        }

        if (document.status === 'APPROVED' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Approved documents can only be deleted by an Administrator.' });
        }

        await Version.deleteMany({ documentId: document._id });
        await Comment.deleteMany({ documentId: document._id });
        await Document.findByIdAndDelete(document._id);

        await logAction('DOCUMENT_DELETED', `Deleted document: ${document.title}`, req.user.id, req);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
    }
};

module.exports = {
    uploadDocument,
    updateDocumentVersion,
    getMyDocuments,
    getAllDocumentsForApprover,
    reviewDocument,
    getDocumentDetails,
    deleteDocument
};
