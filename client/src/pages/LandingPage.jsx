import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}>
            {/* Hero Section */}
            <section className="section hero-gradient" style={{ height: '100vh', overflow: 'hidden' }}>
                <motion.div
                    style={{ y: yHero, opacity: opacityHero, textAlign: 'center', zIndex: 2 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <motion.span
                        style={{ color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '1rem', display: 'block' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Enterprise Document Security
                    </motion.span>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1, marginBottom: '1.5rem', maxWidth: '1000px' }}>
                        The Future of <span className="reveal-text">Secure Collaboration</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Protect your most sensitive workflows with a vault designed for the highest standard of institutional integrity.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Begin Integration <ArrowRight size={18} />
                        </Link>
                        <a href="#narrative" style={{ padding: '0.8rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                            Explore Workflow
                        </a>
                    </div>
                </motion.div>

                {/* Hero Background Visual */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        maxWidth: '1200px',
                        aspectRatio: '16/9',
                        backgroundImage: `url('/assets/hero_vault.png')`,
                        backgroundSize: 'cover',

                        borderRadius: '20px 20px 0 0',
                        boxShadow: '0 -20px 100px rgba(59, 130, 246, 0.2)',
                        zIndex: 1
                    }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                />
            </section>

            {/* Narrative Section - The Journey of a Document */}
            <section id="narrative" className="section" style={{ display: 'block', padding: '10rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Engineered for Integrity</h2>
                        <p style={{ color: 'var(--text-muted)' }}>A seamless journey from ingestion to finalized approval.</p>
                    </div>

                    {/* Step 1: Ingestion */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '10rem' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Zap size={16} color="var(--primary)" />
                                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>STAGE 01</span>
                            </div>
                            <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Secure Ingestion</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                Documents are processed through an isolated environment where they are scanned, encrypted, and indexed within your private vault.
                            </p>
                            <ul style={{ listStyle: 'none' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <CheckCircle size={20} color="var(--primary)" /> Zero-knowledge encryption at rest
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <CheckCircle size={20} color="var(--primary)" /> Advanced integrity checksums
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div
                            style={{
                                aspectRatio: '1/1',
                                backgroundImage: `url('/assets/document_flow.png')`,
                                backgroundSize: 'cover',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)'
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        />
                    </div>

                    {/* Step 2: Protocol Logic */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <motion.div
                            style={{
                                width: '100%',
                                aspectRatio: '4/3',
                                background: 'linear-gradient(135deg, var(--bg-card), #0f172a)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Shield size={120} color="var(--primary)" style={{ opacity: 0.2 }} />
                                <motion.div
                                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Lock size={64} color="var(--primary)" />
                                </motion.div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Shield size={16} color="var(--primary)" />
                                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>STAGE 02</span>
                            </div>
                            <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Immutable Audit Trails</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                Every interaction, comment, and version change is recorded in a cryptographically signed audit log. Accountability is woven into the fabric of the system.
                            </p>
                            <ul style={{ listStyle: 'none' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <CheckCircle size={20} color="var(--primary)" /> Chain of custody preservation
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <CheckCircle size={20} color="var(--primary)" /> Multi-role authorization protocols
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
                <motion.div
                    style={{ textAlign: 'center' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Ready to secure your future?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Join the institutions that trust Secure Vault for their mission-critical documentation needs.
                    </p>
                    <Link to="/register" className="premium-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Get Started Now
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>&copy; 2026 Secure Vault Technologies. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Protocol</a>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Security Whitepaper</a>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Institutional Terms</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
