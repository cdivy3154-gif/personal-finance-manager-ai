/**
 * BillSplit Page
 * Warm card styling, overlapping avatars, ₹ currency
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineX, HiOutlineTrash,
    HiOutlineCheck, HiOutlineUserAdd
} from 'react-icons/hi';
import api from '../utils/api';

const SPLIT_COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#5B8FB9', '#9B72CF', '#D4739D', '#5AACA8', '#E8A838'];

function BillSplit() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        description: '', totalAmount: '', paidBy: '',
        splitType: 'equal', participants: [{ name: '', share: '' }]
    });

    useEffect(() => { fetchBills(); }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bills');
            setBills(res.data.data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const addParticipant = () => {
        setForm(f => ({ ...f, participants: [...f.participants, { name: '', share: '' }] }));
    };

    const removeParticipant = (index) => {
        setForm(f => ({ ...f, participants: f.participants.filter((_, i) => i !== index) }));
    };

    const updateParticipant = (index, field, value) => {
        setForm(f => {
            const updated = [...f.participants];
            updated[index] = { ...updated[index], [field]: value };
            return { ...f, participants: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                description: form.description,
                totalAmount: parseFloat(form.totalAmount),
                splitType: form.splitType,
                participants: form.participants.filter(p => p.name).map(p => ({
                    name: p.name,
                    amountOwed: p.share ? parseFloat(p.share) : undefined
                }))
            };
            await api.post('/bills', payload);
            toast.success('Bill split created! 🎉');
            setShowModal(false);
            setForm({ description: '', totalAmount: '', paidBy: '', splitType: 'equal', participants: [{ name: '', share: '' }] });
            fetchBills();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create bill');
        }
    };

    const settleBill = async (billId, participantName) => {
        try {
            await api.post(`/bills/${billId}/settle`, { participantName });
            toast.success(`${participantName} settled up! ✅`);
            fetchBills();
        } catch (error) {
            toast.error('Failed to settle');
        }
    };

    const deleteBill = async (billId) => {
        if (!window.confirm('Delete this bill split?')) return;
        try {
            await api.delete(`/bills/${billId}`);
            toast.success('Bill deleted');
            fetchBills();
        } catch { toast.error('Failed to delete'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <div className="skeleton" style={{ width: 200, height: 28 }} />
                </div>
                {[1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ height: 160, borderRadius: 20, marginBottom: 16 }} />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Split Bills</h1>
                    <p className="page-subtitle">Split expenses with friends easily</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus size={18} /> New Bill
                </button>
            </div>

            {/* Bills List */}
            {bills.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
                    {bills.map((bill, index) => (
                        <motion.div
                            key={bill._id}
                            className="glass-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                padding: '22px 24px',
                                borderRadius: index % 2 === 0 ? 'var(--radius-xl)' : 'var(--radius-2xl)',
                                borderTop: `3px solid ${SPLIT_COLORS[index % SPLIT_COLORS.length]}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem',
                                        color: 'var(--text-primary)', marginBottom: 4
                                    }}>
                                        {bill.description}
                                    </h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        Created by <strong style={{ color: 'var(--text-primary)' }}>{bill.createdBy}</strong> • {bill.splitType || 'equal'} split
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700,
                                        color: 'var(--text-primary)', letterSpacing: '-0.01em'
                                    }}>
                                        {formatCurrency(bill.totalAmount)}
                                    </span>
                                    <button
                                        className="btn-icon"
                                        onClick={() => deleteBill(bill._id)}
                                        style={{ width: 28, height: 28, borderColor: 'rgba(224,122,95,0.15)', color: 'var(--danger)' }}
                                    >
                                        <HiOutlineTrash size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Overlapping avatars */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex' }}>
                                    {bill.participants?.slice(0, 5).map((p, i) => (
                                        <div key={i} style={{
                                            width: 34, height: 34, borderRadius: '50%',
                                            background: `${SPLIT_COLORS[i % SPLIT_COLORS.length]}20`,
                                            border: `2px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', fontWeight: 700, color: SPLIT_COLORS[i % SPLIT_COLORS.length],
                                            marginLeft: i > 0 ? '-8px' : '0', zIndex: 5 - i,
                                            boxShadow: '0 0 0 2px var(--bg-card)'
                                        }}>
                                            {p.name?.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                                {bill.participants?.length > 5 && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>
                                        +{bill.participants.length - 5} more
                                    </span>
                                )}
                            </div>

                            {/* Participant details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {bill.participants?.map((p, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 12px', background: 'var(--bg-surface)',
                                        borderRadius: 'var(--radius-sm)', fontSize: '0.85rem'
                                    }}>
                                        <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: SPLIT_COLORS[i % SPLIT_COLORS.length]
                                            }} />
                                            {p.name}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>
                                                {formatCurrency(p.amountOwed)}
                                            </span>
                                            {p.isPaid ? (
                                                <span style={{
                                                    fontSize: '0.68rem', padding: '2px 8px',
                                                    background: 'var(--success-bg)', color: 'var(--secondary)',
                                                    borderRadius: 'var(--radius-pill)', fontWeight: 700
                                                }}>
                                                    PAID ✓
                                                </span>
                                            ) : (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => settleBill(bill._id, p.name)}
                                                    style={{ padding: '4px 12px', fontSize: '0.72rem', borderRadius: 'var(--radius-pill)' }}
                                                >
                                                    Settle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="glass-card-static" style={{ padding: '48px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No bill splits yet!</h3>
                        <p>Split that dinner bill, movie tickets, or shared subscription with your friends.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <HiOutlinePlus /> Create First Split
                        </button>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={() => setShowModal(true)}><HiOutlinePlus /></button>

            {/* Create Bill Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">New Bill Split</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">What's the bill for?</label>
                                    <input type="text" className="form-input" placeholder="Dinner at Zara's" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required maxLength={50} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Total Amount (₹)</label>
                                        <input type="number" className="form-input" placeholder="0" step="0.01" value={form.totalAmount} onChange={(e) => setForm(f => ({ ...f, totalAmount: e.target.value }))} required style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Who Paid?</label>
                                        <input type="text" className="form-input" placeholder="Your name" value={form.paidBy} onChange={(e) => setForm(f => ({ ...f, paidBy: e.target.value }))} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Split Type</label>
                                    <div className="tabs" style={{ marginBottom: 0 }}>
                                        <button type="button" className={`tab ${form.splitType === 'equal' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, splitType: 'equal' }))}>⚖️ Equal</button>
                                        <button type="button" className={`tab ${form.splitType === 'custom' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, splitType: 'custom' }))}>✏️ Custom</button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Participants</label>
                                    {form.participants.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                            <input type="text" className="form-input" placeholder="Name" value={p.name} onChange={(e) => updateParticipant(i, 'name', e.target.value)} required style={{ flex: 1 }} />
                                            {form.splitType === 'custom' && (
                                                <input type="number" className="form-input" placeholder="₹" value={p.share} onChange={(e) => updateParticipant(i, 'share', e.target.value)} style={{ width: 100 }} />
                                            )}
                                            {form.participants.length > 1 && (
                                                <button type="button" className="btn-icon" onClick={() => removeParticipant(i)} style={{ color: 'var(--danger)', width: 32, height: 32 }}>
                                                    <HiOutlineX size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-secondary" onClick={addParticipant} style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                                        <HiOutlineUserAdd /> Add Person
                                    </button>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }}>
                                    Split This Bill
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BillSplit;
