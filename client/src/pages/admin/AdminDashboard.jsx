import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Users, ScrollText, Database, ShieldAlert, User, ShieldCheck, Mail, Calendar, Trash2, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ users: 0, documents: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [logSearch, setLogSearch] = useState('');
    const [logSearchDate, setLogSearchDate] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);

            let dataRes;
            if (activeTab === 'users') dataRes = await api.get('/admin/users');
            else if (activeTab === 'logs') dataRes = await api.get('/admin/logs');
            else if (activeTab === 'documents') dataRes = await api.get('/admin/documents');

            if (activeTab === 'users') setUsers(dataRes.data);
            else if (activeTab === 'logs') setLogs(dataRes.data);
            else if (activeTab === 'documents') setDocuments(dataRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? They will have to register again.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document? This is permanent.')) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatClick = (tab, filter = 'ALL') => {
        setFilterStatus(filter);
        setActiveTab(tab);
    };

    return (
        <div style={{ padding: '0 5% 5rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Command Centre</h1>
                <p style={{ color: 'var(--text-muted)' }}>System oversight and administrative management</p>
            </header>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div onClick={() => setActiveTab('users')} className="premium-card clickable-stat" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(197, 160, 89, 0.1)', padding: '1rem', borderRadius: '12px' }}><Users color="var(--primary)" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.users}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL USERS</div></div>
                </div>
                <div onClick={() => handleStatClick('documents', 'ALL')} className="premium-card clickable-stat" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px' }}><Database color="var(--success)" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.documents}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOCUMENTS STORED</div></div>
                </div>
                <div onClick={() => handleStatClick('documents', 'PENDING')} className="premium-card clickable-stat" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px' }}><ShieldAlert color="var(--pending)" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.pending}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PENDING APPROVALS</div></div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{ background: 'transparent', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem' }}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    style={{ background: 'transparent', color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'documents' ? '2px solid var(--primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem' }}
                >
                    Document Vault
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    style={{ background: 'transparent', color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'logs' ? '2px solid var(--primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem' }}
                >
                    Audit Trail
                </button>
            </div>

            {/* Sub-Filters / Search for specific tabs */}
            {activeTab === 'logs' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search operative name or action..."
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '100%', marginBottom: 0 }}
                        />
                    </div>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="date"
                            value={logSearchDate}
                            onChange={(e) => setLogSearchDate(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '100%', marginBottom: 0 }}
                        />
                    </div>
                    {(logSearch || logSearchDate) && (
                        <button
                            onClick={() => { setLogSearch(''); setLogSearchDate(''); }}
                            style={{ background: 'transparent', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            )}

            {/* Content Table */}
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            {activeTab === 'users' ? (
                                <>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Role</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Joined</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', textAlign: 'right' }}>Controls</th>
                                </>
                            ) : activeTab === 'documents' ? (
                                <>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Document</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Client</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', textAlign: 'right' }}>Controls</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Action</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Timestamp</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td></tr> : (
                            activeTab === 'users' ? users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ background: 'var(--border)', padding: '0.4rem', borderRadius: '50%' }}><User size={16} /></div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: user.role === 'ADMIN' ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255,255,255,0.05)', color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '4px' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.3rem', marginRight: '0.5rem' }} title="Delete User">
                                            <Trash2 size={16} />
                                        </button>
                                        <button onClick={() => handleBanUser(user.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.3rem' }} title="Ban User Email">
                                            <Ban size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : activeTab === 'documents' ? documents.filter(d => filterStatus === 'ALL' || d.status === filterStatus).map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ background: 'var(--border)', padding: '0.4rem', borderRadius: '8px' }}><ScrollText size={16} /></div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{doc.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.category} • v{doc.versions[0]?.versionNum}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                        {doc.client.name}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.client.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            padding: '0.2rem 0.5rem',
                                            background: doc.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : doc.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: doc.status === 'APPROVED' ? 'var(--success)' : doc.status === 'REJECTED' ? 'var(--danger)' : 'var(--pending)',
                                            borderRadius: '4px'
                                        }}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDeleteDocument(doc.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.3rem' }} title="Delete Document">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : logs.filter(log => {
                                const matchesName = !logSearch ||
                                    (log.user?.name || 'System').toLowerCase().includes(logSearch.toLowerCase()) ||
                                    log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                                    log.details.toLowerCase().includes(logSearch.toLowerCase());
                                const matchesDate = !logSearchDate || new Date(log.createdAt).toLocaleDateString() === new Date(logSearchDate).toLocaleDateString();
                                return matchesName && matchesDate;
                            }).map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <ShieldCheck size={16} color="var(--primary)" />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.details}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                                        {log.user?.name || 'System'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
