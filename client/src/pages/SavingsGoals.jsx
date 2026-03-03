/**
 * Savings Goals Page
 * Warm circular progress, confetti-style completion, student-friendly
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineX, HiOutlineTrash
} from 'react-icons/hi';
import api from '../utils/api';

// Category styling
const GOAL_COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#5B8FB9', '#9B72CF', '#D4739D', '#5AACA8'];
const GOAL_EMOJIS = ['🎯', '🏖️', '💻', '📚', '🎮', '🏋️', '✈️', '🎸'];

// Circular progress component
function CircularProgress({ percentage, color, size = 100, strokeWidth = 8 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(61, 64, 91, 0.06)"
                strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            />
        </svg>
    );
}

function SavingsGoals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddFunds, setShowAddFunds] = useState(null);
    const [form, setForm] = useState({ goalName: '', targetAmount: '', deadline: '' });
    const [fundAmount, setFundAmount] = useState('');

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/goals');
            setGoals(res.data.data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals', {
                goalName: form.goalName,
                targetAmount: parseFloat(form.targetAmount),
                deadline: form.deadline || undefined
            });
            toast.success('Goal created! 🎯');
            setShowModal(false);
            setForm({ goalName: '', targetAmount: '', deadline: '' });
            fetchGoals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create goal');
        }
    };

    const handleAddFunds = async (goalId) => {
        try {
            await api.post(`/goals/${goalId}/add-funds`, { amount: parseFloat(fundAmount) });
            toast.success('Funds added! 💰');
            setShowAddFunds(null);
            setFundAmount('');
            fetchGoals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add funds');
        }
    };

    const deleteGoal = async (goalId) => {
        if (!window.confirm('Delete this savings goal?')) return;
        try {
            await api.delete(`/goals/${goalId}`);
            toast.success('Goal deleted');
            fetchGoals();
        } catch { toast.error('Failed to delete'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const getDaysRemaining = (deadline) => {
        if (!deadline) return null;
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Overdue';
        if (diff === 0) return 'Today!';
        return `${diff} days left`;
    };

    if (loading) {
        return (
            <div>
                <div className="page-header"><div className="skeleton" style={{ width: 200, height: 28 }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 20 }} />)}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Savings Goals</h1>
                    <p className="page-subtitle">Track your progress towards financial dreams</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus size={18} /> New Goal
                </button>
            </div>

            {/* Goals Grid */}
            {goals.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                    {goals.map((goal, index) => {
                        const percentage = (goal.targetAmount > 0) ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        const color = GOAL_COLORS[index % GOAL_COLORS.length];
                        const emoji = GOAL_EMOJIS[index % GOAL_EMOJIS.length];
                        const isComplete = percentage >= 100;

                        return (
                            <motion.div
                                key={goal._id}
                                className="glass-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06 }}
                                style={{
                                    padding: '24px',
                                    borderRadius: index % 3 === 0 ? 'var(--radius-2xl)' : index % 3 === 1 ? 'var(--radius-xl)' : 'var(--radius-lg)',
                                    borderTop: `3px solid ${color}`,
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Completed badge */}
                                {isComplete && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                        style={{
                                            position: 'absolute', top: -10, right: -5,
                                            fontSize: '1.5rem', zIndex: 5
                                        }}
                                    >
                                        🎉
                                    </motion.div>
                                )}

                                {/* Delete button */}
                                <button
                                    className="btn-icon"
                                    onClick={() => deleteGoal(goal._id)}
                                    style={{
                                        position: 'absolute', top: 12, right: 12,
                                        width: 28, height: 28, color: 'var(--text-muted)',
                                        borderColor: 'transparent', opacity: 0.5
                                    }}
                                >
                                    <HiOutlineTrash size={14} />
                                </button>

                                {/* Goal emoji */}
                                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{emoji}</div>

                                <h3 style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 700,
                                    fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)'
                                }}>
                                    {goal.goalName}
                                </h3>

                                {/* Circular Progress */}
                                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                                    <CircularProgress percentage={percentage} color={color} size={110} strokeWidth={10} />
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%) rotate(0deg)',
                                        fontFamily: 'var(--font-display)', fontWeight: 700,
                                        fontSize: '1.2rem', color: 'var(--text-primary)'
                                    }}>
                                        {Math.min(Math.round(percentage), 100)}%
                                    </div>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontWeight: 700,
                                        fontSize: '1.25rem', color
                                    }}>
                                        {formatCurrency(goal.currentAmount)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>
                                        {' / '}{formatCurrency(goal.targetAmount)}
                                    </span>
                                </div>

                                {goal.deadline && (
                                    <p style={{
                                        fontSize: '0.75rem', color: 'var(--text-muted)',
                                        marginBottom: 14, fontWeight: 500
                                    }}>
                                        ⏰ {getDaysRemaining(goal.deadline)}
                                    </p>
                                )}

                                {!isComplete && (
                                    <>
                                        {showAddFunds === goal._id ? (
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="₹ Amount"
                                                    value={fundAmount}
                                                    onChange={(e) => setFundAmount(e.target.value)}
                                                    autoFocus
                                                    style={{ width: 120, padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}
                                                />
                                                <button className="btn btn-primary" onClick={() => handleAddFunds(goal._id)} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                                                    Add
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => { setShowAddFunds(null); setFundAmount(''); }} style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                                                    <HiOutlineX />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setShowAddFunds(goal._id)}
                                                style={{ fontSize: '0.85rem', padding: '10px 22px' }}
                                            >
                                                💰 Add Funds
                                            </button>
                                        )}
                                    </>
                                )}

                                {isComplete && (
                                    <p style={{
                                        color: 'var(--secondary)', fontWeight: 700,
                                        fontSize: '0.88rem', marginTop: 8
                                    }}>
                                        🎊 Goal achieved!
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card-static" style={{ padding: '48px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <h3>Set your first savings goal!</h3>
                        <p>Whether it's a new gadget, a trip, or an emergency fund — start saving smart today.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <HiOutlinePlus /> Create First Goal
                        </button>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={() => setShowModal(true)}><HiOutlinePlus /></button>

            {/* Create Goal Modal */}
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
                                <h2 className="modal-title">New Savings Goal</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label className="form-label">Goal Name</label>
                                    <input type="text" className="form-input" placeholder="e.g., New Laptop, Summer Trip" value={form.goalName} onChange={(e) => setForm(f => ({ ...f, goalName: e.target.value }))} required maxLength={50} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Target Amount (₹)</label>
                                        <input type="number" className="form-input" placeholder="0" step="100" value={form.targetAmount} onChange={(e) => setForm(f => ({ ...f, targetAmount: e.target.value }))} required style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Deadline (optional)</label>
                                        <input type="date" className="form-input" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }}>
                                    🎯 Create Goal
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SavingsGoals;
