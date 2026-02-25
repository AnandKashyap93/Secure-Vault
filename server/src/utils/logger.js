const prisma = require('../lib/prisma');

const logAction = async (action, details, userId, req) => {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                details,
                userId: userId || null,
                ip: req ? req.ip : null,
                device: req ? req.get('User-Agent') : null,
            },
        });
    } catch (error) {
        console.error('Logging failed:', error);
    }
};

module.exports = { logAction };
