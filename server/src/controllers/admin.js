const { User, AuditLog, Document, BannedEmail, Version } = require('../models');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json(users.map(u => ({
            id: u._id,
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: u.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json(logs.map(l => ({
            ...l,
            id: l._id,
            user: l.userId ? {
                name: l.userId.name,
                email: l.userId.email,
                role: l.userId.role
            } : null
        })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const docCount = await Document.countDocuments();
        const pendingCount = await Document.countDocuments({ status: 'PENDING' });

        res.json({
            users: userCount,
            documents: docCount,
            pending: pendingCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully. They can register again.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ban the email
        await BannedEmail.create({ email: user.email });

        // Delete ALL accounts associated with this banned email
        await User.deleteMany({ email: user.email });

        res.json({ message: 'Email banned. All accounts permanently deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to ban user', error: error.message });
    }
};

const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find()
            .populate('clientId', 'name email')
            .sort({ updatedAt: -1 })
            .lean();

        const docsWithVersions = await Promise.all(documents.map(async (doc) => {
            const latestVersion = await Version.findOne({ documentId: doc._id }).sort({ versionNum: -1 }).lean();
            return {
                ...doc,
                id: doc._id,
                client: doc.clientId ? { name: doc.clientId.name, email: doc.clientId.email } : null,
                versions: latestVersion ? [{ ...latestVersion, id: latestVersion._id }] : []
            };
        }));

        res.json(docsWithVersions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

module.exports = { getAllUsers, getAuditLogs, getSystemStats, deleteUser, banUser, getAllDocuments };
