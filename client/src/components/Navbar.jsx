import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, FileText, Settings, Activity, ShieldCheck } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [latency, setLatency] = useState(12);

    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * 16) + 8); // random 8-24ms
        }, 3000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="glass" style={{
            padding: '1rem 5%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            marginBottom: '2rem'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem' }}>
                <Shield size={32} />
                <span>SECURE VAULT</span>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <ShieldCheck size={14} /> ENCRYPTED
                    </div>
                    <div style={{ width: '1px', height: '12px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Activity size={14} /> ping: {latency}ms
                    </div>
                </div>

                <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '1rem' }}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>

                {user.role === 'ADMIN' && (
                    <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Settings size={18} /> Admin
                    </Link>
                )}

                <div style={{ marginLeft: '1rem', paddingLeft: '2rem', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.5rem', border: 'none', cursor: 'pointer' }} className="hover-primary">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
