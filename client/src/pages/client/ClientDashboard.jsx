import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Upload, FileText, CheckCircle, XCircle, Clock, ChevronRight, Plus, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', description: '', approverEmail: '', priority: 'NORMAL', category: 'GENERAL', file: null });
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents/my-documents');
            setDocuments(res.data);
        } catch (err) {
            console.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const res = await api.get(`/documents/${id}`);
            setSelectedDoc(res.data);
        } catch (err) {
            console.error('Failed to fetch document details');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document? This action is permanent and deleting this file will remove all history and approvals associated with it.')) return;
        try {
            await api.delete(`/documents/${id}`);
            setSelectedDoc(null);
            fetchDocuments();
        } catch (err) {
            alert('Failed to delete document');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('approverEmail', uploadData.approverEmail);
        formData.append('priority', uploadData.priority);
        formData.append('category', uploadData.category);
        formData.append('document', uploadData.file);

        try {
            await api.post('/documents/upload', formData);
            setUploadData({ title: '', description: '', approverEmail: '', priority: 'NORMAL', category: 'GENERAL', file: null });
            setShowUpload(false);
            fetchDocuments();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={18} color="var(--success)" />;
            case 'REJECTED': return <XCircle size={18} color="var(--danger)" />;
            default: return <Clock size={18} color="var(--pending)" />;
        }
    };

    return (
        <div style={{ padding: '0 5% 5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Vault</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Securely upload and track your document approvals</p>
                </div>
                <button onClick={() => setShowUpload(true)} className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> New Upload
                </button>
            </header>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="premium-card glass"
                            style={{ width: '100%', maxWidth: '500px' }}
                        >
                            <h3>Upload Document</h3>
                            <form onSubmit={handleUpload} style={{ marginTop: '1.5rem' }}>
                                <div className="input-group">
                                    <label>Document Title</label>
                                    <input required value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} placeholder="e.g. Q1 Contract" />
                                </div>
                                <div className="input-group">
                                    <label>Approver Operational Email</label>
                                    <input type="email" required value={uploadData.approverEmail} onChange={e => setUploadData({ ...uploadData, approverEmail: e.target.value })} placeholder="approver@company.com" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Priority Level</label>
                                        <select value={uploadData.priority} onChange={e => setUploadData({ ...uploadData, priority: e.target.value })}>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent (Critical)</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Document Category</label>
                                        <select value={uploadData.category} onChange={e => setUploadData({ ...uploadData, category: e.target.value })}>
                                            <option value="GENERAL">General</option>
                                            <option value="LEGAL">Legal Contract</option>
                                            <option value="FINANCE">Financial / Invoice</option>
                                            <option value="TECHNICAL">Technical Spec</option>
                                            <option value="OTHERS">Others</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Internal Notes (Optional)</label>
                                    <textarea value={uploadData.description} onChange={e => setUploadData({ ...uploadData, description: e.target.value })} placeholder="Context for the reviewer..." rows="3" />
                                </div>
                                <div className="input-group">
                                    <label>File (PDF, DOCX, Images)</label>
                                    <input type="file" required onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setShowUpload(false)} style={{ flex: 1, background: 'var(--border)', color: '#fff' }}>Cancel</button>
                                    <button type="submit" className="premium-btn" style={{ flex: 2 }}>Upload to Vault</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Details Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="premium-card glass"
                            style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>{selectedDoc.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }}>
                                    {getStatusIcon(selectedDoc.status)}
                                    {selectedDoc.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>LATEST VERSION</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-all' }}>
                                            <FileText size={16} color="var(--primary)" /> <span>{selectedDoc.versions[0]?.fileName}</span>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DESCRIPTION</h4>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedDoc.description || 'No description provided.'}</p>

                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>APPROVING AUTHORITY</h4>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedDoc.approverEmail}</p>
                                </div>

                                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>COMMENTS & HISTORY</h4>
                                    {selectedDoc.comments?.length > 0 ? (
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {selectedDoc.comments.map(comment => (
                                                <div key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{comment.author.name}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No comments yet.</p>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href={`http://localhost:5000/${selectedDoc.versions[0]?.fileUrl}`} target="_blank" rel="noreferrer" className="premium-btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ExternalLink size={16} /> View File
                                    </a>
                                    <button
                                        onClick={() => handleDelete(selectedDoc.id)}
                                        disabled={selectedDoc.status === 'APPROVED'}
                                        className="premium-btn"
                                        style={{
                                            background: selectedDoc.status === 'APPROVED' ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
                                            color: selectedDoc.status === 'APPROVED' ? 'var(--text-muted)' : 'var(--danger)',
                                            border: selectedDoc.status === 'APPROVED' ? '1px solid var(--border)' : '1px solid var(--danger)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: selectedDoc.status === 'APPROVED' ? 'not-allowed' : 'pointer',
                                            opacity: selectedDoc.status === 'APPROVED' ? 0.6 : 1
                                        }}
                                        title={selectedDoc.status === 'APPROVED' ? "Approved documents are permanently locked and cannot be deleted." : "Delete Document"}
                                    >
                                        <Trash2 size={16} /> {selectedDoc.status === 'APPROVED' ? 'Locked (Approved)' : 'Delete Document'}
                                    </button>
                                </div>
                                <button onClick={() => setSelectedDoc(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? <p>Loading vault...</p> : documents.map(doc => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={doc.id}
                        className="premium-card"
                        style={{ padding: '1.5rem', border: '1px solid var(--border)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <FileText size={24} color="var(--primary)" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
                                {getStatusIcon(doc.status)}
                                {doc.status}
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '0.2rem' }}>{doc.title}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}>{doc.category}</span>
                            {doc.priority !== 'NORMAL' && (
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '12px', border: `1px solid ${doc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b'}`, color: doc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b' }}>{doc.priority}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '3em' }}>{doc.description || 'No internal notes provided'}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v{doc.versions[0]?.versionNum || 1} • {new Date(doc.updatedAt).toLocaleDateString()}</span>
                            <button onClick={() => handleViewDetails(doc.id)} style={{ color: 'var(--primary)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}>
                                Details <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {!loading && documents.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Upload size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Your vault is empty. Start by uploading a document.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
