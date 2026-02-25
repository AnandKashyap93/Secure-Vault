import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FileText, CheckCircle, XCircle, Clock, ChevronRight, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ApproverDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [comment, setComment] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents/all');
            setDocuments(res.data);
        } catch (err) {
            console.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status) => {
        try {
            await api.patch(`/documents/review/${selectedDoc.id}`, { status, comment });
            setSelectedDoc(null);
            setComment('');
            fetchDocuments();
        } catch (err) {
            alert('Review failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'var(--success)';
            case 'REJECTED': return 'var(--danger)';
            default: return 'var(--pending)';
        }
    };

    return (
        <div style={{ padding: '0 5% 5rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Approval Queue</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review and manage pending document requests</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['ALL', 'NORMAL', 'HIGH', 'URGENT'].map(level => (
                    <button
                        key={level}
                        onClick={() => setFilterPriority(level)}
                        style={{
                            background: filterPriority === level ? (level === 'URGENT' ? 'var(--danger)' : level === 'HIGH' ? '#f59e0b' : 'var(--primary)') : 'rgba(255,255,255,0.05)',
                            color: filterPriority === level ? '#fff' : 'var(--text-muted)',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            border: `1px solid ${filterPriority === level ? 'transparent' : 'var(--border)'}`,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {level === 'ALL' ? 'All Priorities' : level}
                    </button>
                ))}
            </div>

            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Document</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Meta</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Update</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td></tr> : documents.filter(doc => filterPriority === 'ALL' || doc.priority === filterPriority).map(doc => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                                            <FileText size={20} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v{doc.versions[0]?.versionNum}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}>{doc.category}</span>
                                        {doc.priority !== 'NORMAL' && (
                                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '12px', border: `1px solid ${doc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b'}`, color: doc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b' }}>{doc.priority}</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={16} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.9rem' }}>{doc.client.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: `${getStatusColor(doc.status)}22`, color: getStatusColor(doc.status), border: `1px solid ${getStatusColor(doc.status)}44` }}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {new Date(doc.updatedAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <button onClick={() => setSelectedDoc(doc)} className="premium-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="premium-card glass"
                            style={{ width: '100%', maxWidth: '700px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
                        >
                            <div style={{ borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Document Details</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}>CATEGORY: {selectedDoc.category}</span>
                                    {selectedDoc.priority !== 'NORMAL' && (
                                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', border: `1px solid ${selectedDoc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b'}`, color: selectedDoc.priority === 'URGENT' ? 'var(--danger)' : '#f59e0b', fontWeight: 600 }}>PRIORITY: {selectedDoc.priority}</span>
                                    )}
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>FILE NAME</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} /> <span>{selectedDoc.versions[0].fileName}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>INTERNAL NOTES:</p>
                                    <p>{selectedDoc.description || 'No notes provided by client.'}</p>
                                </div>
                                <a href={`http://localhost:5000/${selectedDoc.versions[0].fileUrl}`} target="_blank" rel="noreferrer" className="premium-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#fff', color: '#000' }}>
                                    <ExternalLink size={18} /> View Original
                                </a>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Take Action</h3>
                                <div className="input-group">
                                    <label>Approver Comments</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Provide feedback to the client..."
                                        rows="6"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button onClick={() => handleReview('REJECTED')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Reject</button>
                                    <button onClick={() => handleReview('APPROVED')} className="premium-btn" style={{ flex: 1, background: 'var(--success)', color: '#fff' }}>Approve</button>
                                </div>
                                <button onClick={() => setSelectedDoc(null)} style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}>Close Review</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApproverDashboard;
