const prisma = require('../lib/prisma');

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { name: true, email: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const docCount = await prisma.document.count();
        const pendingCount = await prisma.document.count({ where: { status: 'PENDING' } });

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
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully. They can register again.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ban the email
        await prisma.bannedEmail.create({ data: { email: user.email } });

        // Delete ALL accounts associated with this banned email
        await prisma.user.deleteMany({ where: { email: user.email } });

        res.json({ message: 'Email banned. All accounts permanently deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to ban user', error: error.message });
    }
};

const getAllDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            include: {
                client: { select: { name: true, email: true } },
                versions: { orderBy: { versionNum: 'desc' }, take: 1 }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

module.exports = { getAllUsers, getAuditLogs, getSystemStats, deleteUser, banUser, getAllDocuments };
