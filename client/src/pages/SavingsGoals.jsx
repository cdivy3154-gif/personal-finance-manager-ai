import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineStar, HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlineCash } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Helper component for circular progress SVG
const CircularProgress = ({ value, max, color, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min((value / max) * 100, 100);
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background circle */}
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="none"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>
            {/* Centered text */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {Math.round(percent)}%
                </span>
            </div>
        </div>
    );
};

function SavingsGoals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Goal Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState('General');

    // Add Funds Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [addAmount, setAddAmount] = useState('');

    const colors = ['#6c2fff', '#06b6d4', '#ec4899', '#2ed573', '#ffa502'];

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/goals');
            setGoals(res.data.data);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const payload = {
                goalName,
                targetAmount: parseFloat(targetAmount),
                deadline,
                category,
                color
            };

            const res = await api.post('/goals', payload);
            setGoals([res.data.data, ...goals]);
            toast.success('Savings goal created!');
            setShowCreateModal(false);
            resetCreateForm();
        } catch (error) {
            const msg = error.response?.data?.error;
            toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create goal');
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/goals/${selectedGoal._id}/add-funds`, { amount: parseFloat(addAmount) });

            // Check if newly completed
            if (res.data.justCompleted) {
                toast.success(`🎉 Congratulations! You achieved your ${selectedGoal.goalName} goal!`, { duration: 5000 });
            } else {
                toast.success('Funds added successfully!');
            }

            setGoals(goals.map(g => g._id === selectedGoal._id ? res.data.data : g));
            setShowAddModal(false);
            setAddAmount('');
            setSelectedGoal(null);
        } catch (error) {
            toast.error('Failed to add funds');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('Delete this savings goal?')) return;
        try {
            await api.delete(`/goals/${id}`);
            setGoals(goals.filter(g => g._id !== id));
            toast.success('Goal deleted');
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const resetCreateForm = () => {
        setGoalName('');
        setTargetAmount('');
        setDeadline('');
        setCategory('General');
    };

    const openAddFunds = (goal) => {
        if (goal.isCompleted) return;
        setSelectedGoal(goal);
        setShowAddModal(true);
    };

    const calculateDaysLeft = (deadlineDate) => {
        const diff = new Date(deadlineDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        return `${days} days left`;
    };

    return (
        <div className="page-container" style={{ padding: '0 20px 100px 20px' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Savings Goals</h1>
                    <p className="page-subtitle">Track your progress towards big purchases and financial targets</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <HiOutlinePlus size={18} />
                    New Goal
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading goals...
                </div>
            ) : goals.length === 0 ? (
                <div className="glass-card empty-state">
                    <HiOutlineStar className="empty-state-icon" style={{ color: 'var(--secondary-400)' }} />
                    <h3>No Active Goals</h3>
                    <p>Setting concrete financial goals makes you 10x more likely to save successfully.</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Set a Goal Now
                    </button>
                </div>
            ) : (
                <div className="stats-grid">
                    {goals.map(goal => (
                        <motion.div
                            key={goal._id}
                            className="glass-card"
                            style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {/* Category indicator line top */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: goal.color, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{goal.goalName}</h3>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        {goal.isCompleted ? (
                                            <span style={{ color: 'var(--success-400)', display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineStar /> Goal Achieved!</span>
                                        ) : (
                                            calculateDaysLeft(goal.deadline)
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteGoal(goal._id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <HiOutlineTrash size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                <CircularProgress
                                    value={goal.currentAmount}
                                    max={goal.targetAmount}
                                    color={goal.isCompleted ? '#2ed573' : goal.color}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.85rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)' }}>Saved</div>
                                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>${goal.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--text-muted)' }}>Target</div>
                                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>${goal.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>

                            <button
                                className="btn"
                                style={{
                                    marginTop: 'auto', width: '100%', justifyContent: 'center',
                                    background: goal.isCompleted ? 'rgba(46, 213, 115, 0.1)' : 'var(--bg-glass-strong)',
                                    color: goal.isCompleted ? 'var(--success-400)' : 'var(--text-primary)',
                                    border: `1px solid ${goal.isCompleted ? 'rgba(46, 213, 115, 0.2)' : 'var(--border-glass)'}`,
                                    cursor: goal.isCompleted ? 'default' : 'pointer'
                                }}
                                disabled={goal.isCompleted}
                                onClick={() => openAddFunds(goal)}
                            >
                                {goal.isCompleted ? 'Completed' : <><HiOutlineCash size={16} /> Add Funds</>}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Goal Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Set New Goal</h2>
                                <button className="modal-close" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGoal}>
                                <div className="form-group">
                                    <label className="form-label">Goal Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={goalName}
                                        onChange={(e) => setGoalName(e.target.value)}
                                        placeholder="e.g., Summer Trip to Bali"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Target Amount</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                type="number"
                                                min="1"
                                                className="form-input"
                                                style={{ paddingLeft: 32 }}
                                                value={targetAmount}
                                                onChange={(e) => setTargetAmount(e.target.value)}
                                                placeholder="1000"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Target Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Travel">Travel</option>
                                        <option value="Gadgets">Gadgets / Tech</option>
                                        <option value="Emergency Fund">Emergency Fund</option>
                                        <option value="Education">Education / Courses</option>
                                        <option value="General">General Savings</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                    <HiOutlineStar size={18} />
                                    Start Saving
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {showAddModal && selectedGoal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal"
                            style={{ maxWidth: 400 }}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Deposit Funds</h2>
                                <button className="modal-close" onClick={() => { setShowAddModal(false); setAddAmount(''); setSelectedGoal(null); }}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Adding to <strong>{selectedGoal.goalName}</strong><br />
                                (${selectedGoal.currentAmount.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()})
                            </div>

                            <form onSubmit={handleAddFunds}>
                                <div className="form-group">
                                    <label className="form-label">Deposit Amount</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text-muted)' }}>$</span>
                                        <input
                                            type="number"
                                            step="1"
                                            min="1"
                                            className="form-input"
                                            style={{ paddingLeft: 32, fontSize: '1.2rem', fontWeight: 600, height: 48 }}
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            placeholder="0"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 48 }}>
                                    Deposit
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SavingsGoals;
