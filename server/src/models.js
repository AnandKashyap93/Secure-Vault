const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: "CLIENT" },
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: { type: String, default: "PENDING" },
    priority: { type: String, default: "NORMAL" },
    category: { type: String, default: "GENERAL" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approverEmail: { type: String, default: null },
}, { timestamps: true });

const versionSchema = new mongoose.Schema({
    versionNum: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    details: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ip: { type: String, default: null },
    device: { type: String, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

const bannedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const User = mongoose.model('User', userSchema);
const Document = mongoose.model('Document', documentSchema);
const Version = mongoose.model('Version', versionSchema);
const Comment = mongoose.model('Comment', commentSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const BannedEmail = mongoose.model('BannedEmail', bannedEmailSchema);

module.exports = {
    User,
    Document,
    Version,
    Comment,
    AuditLog,
    BannedEmail
};
