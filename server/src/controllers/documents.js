const prisma = require('../lib/prisma');
const { logAction } = require('../utils/logger');

const uploadDocument = async (req, res) => {
    const { title, description, approverEmail, priority, category } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Create Document record
        const document = await prisma.document.create({
            data: {
                title,
                description,
                approverEmail,
                priority: priority || 'NORMAL',
                category: category || 'GENERAL',
                clientId: req.user.id,
                versions: {
                    create: {
                        versionNum: 1,
                        fileUrl: file.path,
                        fileName: file.originalname,
                    }
                }
            },
            include: { versions: true }
        });

        await logAction('DOCUMENT_UPLOAD', `Uploaded document: ${title}`, req.user.id, req);

        res.status(201).json(document);
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
        const document = await prisma.document.findUnique({
            where: { id },
            include: { versions: { orderBy: { versionNum: 'desc' }, take: 1 } }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.clientId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this document' });
        }

        const nextVersion = document.versions[0].versionNum + 1;

        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                status: 'PENDING', // Reset status on re-upload
                versions: {
                    create: {
                        versionNum: nextVersion,
                        fileUrl: file.path,
                        fileName: file.originalname,
                    }
                }
            },
            include: { versions: true }
        });

        await logAction('DOCUMENT_VERSION_UPDATE', `Uploaded version ${nextVersion} for: ${document.title}`, req.user.id, req);

        res.json(updatedDoc);
    } catch (error) {
        res.status(500).json({ message: 'Version update failed', error: error.message });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { clientId: req.user.id },
            include: { versions: { orderBy: { versionNum: 'desc' } } }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

const getAllDocumentsForApprover = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { approverEmail: req.user.email },
            include: {
                client: { select: { name: true, email: true } },
                versions: { orderBy: { versionNum: 'desc' } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(documents);
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
        const updateData = { status };

        const document = await prisma.document.update({
            where: { id },
            data: {
                status,
                comments: comment ? {
                    create: {
                        text: comment,
                        authorId: req.user.id
                    }
                } : undefined
            },
            include: { comments: { include: { author: { select: { name: true } } } } }
        });

        await logAction(`DOCUMENT_${status}`, `Reviewed document ID: ${id}`, req.user.id, req);

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Review update failed', error: error.message });
    }
};

const getDocumentDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                versions: { orderBy: { versionNum: 'desc' } },
                comments: {
                    include: { author: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                client: { select: { name: true, email: true } }
            }
        });
        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch document', error: error.message });
    }
};

const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await prisma.document.findUnique({ where: { id } });
        if (!document) return res.status(404).json({ message: 'Document not found' });

        if (req.user.role !== 'ADMIN' && document.clientId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this document' });
        }

        if (document.status === 'APPROVED' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Approved documents can only be deleted by an Administrator.' });
        }

        // Delete related records then document
        await prisma.$transaction([
            prisma.version.deleteMany({ where: { documentId: id } }),
            prisma.comment.deleteMany({ where: { documentId: id } }),
            prisma.document.delete({ where: { id } })
        ]);

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
