/**
 * Budget Page
 * Set monthly budgets per category, view utilization with progress bars and alerts
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlineChevronLeft, HiOutlineChevronRight,
    HiOutlineSave, HiOutlineExclamation
} from 'react-icons/hi';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Entertainment', 'Academics', 'Transportation', 'Utilities', 'Shopping', 'Others'];
const CATEGORY_EMOJIS = {
    Food: '🍕', Entertainment: '🎬', Academics: '📚',
    Transportation: '🚗', Utilities: '💡', Shopping: '🛍️', Others: '📦'
};

function Budget() {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [budget, setBudget] = useState({ totalBudget: 0, categories: {} });
    const [utilization, setUtilization] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ totalBudget: '', categories: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBudgetData();
    }, [month]);

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            const [budgetRes, utilRes] = await Promise.all([
                api.get(`/budget/${month}`),
                api.get(`/budget/${month}/utilization`)
            ]);
            setBudget(budgetRes.data.data);
            setUtilization(utilRes.data.data);
            setForm({
                totalBudget: budgetRes.data.data.totalBudget?.toString() || '',
                categories: { ...budgetRes.data.data.categories }
            });
        } catch (error) {
            console.error('Error fetching budget:', error);
        } finally {
            setLoading(false);
        }
    };

    // Navigate months
    const changeMonth = (direction) => {
        const [y, m] = month.split('-').map(Number);
        const date = new Date(y, m - 1 + direction, 1);
        setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonthDisplay = (monthStr) => {
        const [y, m] = monthStr.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Save budget
    const handleSave = async () => {
        try {
            const payload = {
                totalBudget: parseFloat(form.totalBudget) || 0,
                categories: {}
            };
            CATEGORIES.forEach(cat => {
                payload.categories[cat] = parseFloat(form.categories[cat]) || 0;
            });

            await api.put(`/budget/${month}`, payload);
            toast.success('Budget saved! 💰');
            setEditing(false);
            fetchBudgetData();
        } catch (error) {
            toast.error('Failed to save budget');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const getProgressColor = (status) => {
        switch (status) {
            case 'exceeded': return 'exceeded';
            case 'warning': return 'warning';
            case 'caution': return 'caution';
            default: return 'good';
        }
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <div className="skeleton" style={{ width: 200, height: 28 }} />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16, marginBottom: 12 }} />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Budget</h1>
                    <p className="page-subtitle">Set and track your monthly spending limits</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {editing ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ totalBudget: budget.totalBudget?.toString() || '', categories: { ...budget.categories } }); }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                <HiOutlineSave /> Save Budget
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>
                            Edit Budget
                        </button>
                    )}
                </div>
            </div>

            {/* Month Picker */}
            <div className="month-picker" style={{ marginBottom: 24 }}>
                <button onClick={() => changeMonth(-1)}>
                    <HiOutlineChevronLeft />
                </button>
                <span>{formatMonthDisplay(month)}</span>
                <button onClick={() => changeMonth(1)}>
                    <HiOutlineChevronRight />
                </button>
            </div>

            {/* Alerts */}
            {utilization?.alerts?.map((alert, i) => (
                <motion.div
                    key={i}
                    className={`alert ${alert.type}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <HiOutlineExclamation size={20} />
                    {alert.message}
                </motion.div>
            ))}

            {/* Overall Budget */}
            <motion.div
                className="glass-card"
                style={{ marginBottom: 24 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Overall Budget</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {formatCurrency(utilization?.totalSpent)} of {formatCurrency(utilization?.totalBudget)} spent
                        </p>
                    </div>
                    {editing ? (
                        <input
                            type="number"
                            className="form-input"
                            style={{ width: 150, textAlign: 'right' }}
                            placeholder="Total budget"
                            value={form.totalBudget}
                            onChange={(e) => setForm(f => ({ ...f, totalBudget: e.target.value }))}
                        />
                    ) : (
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--primary-300)'
                        }}>
                            {formatCurrency(budget.totalBudget)}
                        </span>
                    )}
                </div>
                <div className="budget-progress-bar-bg">
                    <motion.div
                        className={`budget-progress-bar ${utilization?.overallPercentage >= 100 ? 'exceeded' : utilization?.overallPercentage >= 80 ? 'warning' : utilization?.overallPercentage >= 60 ? 'caution' : 'good'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(utilization?.overallPercentage || 0, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>
                    {(utilization?.overallPercentage || 0).toFixed(1)}% used
                </p>
            </motion.div>

            {/* Category Budgets */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>
                Category Budgets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CATEGORIES.map((cat, index) => {
                    const catUtil = utilization?.categories?.find(c => c.category === cat);
                    return (
                        <motion.div
                            key={cat}
                            className="glass-card"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{ padding: '16px 20px' }}
                        >
                            <div className="budget-progress">
                                <div className="budget-progress-header">
                                    <span className="budget-progress-label">
                                        <span>{CATEGORY_EMOJIS[cat]}</span>
                                        <span>{cat}</span>
                                        {catUtil?.overBudget && (
                                            <span style={{ color: 'var(--accent-400)', fontSize: '0.7rem', fontWeight: 700 }}>
                                                OVER
                                            </span>
                                        )}
                                    </span>
                                    <span className="budget-progress-values">
                                        {editing ? (
                                            <input
                                                type="number"
                                                className="form-input"
                                                style={{ width: 100, padding: '6px 10px', textAlign: 'right', fontSize: '0.8rem' }}
                                                placeholder="0"
                                                value={form.categories[cat] || ''}
                                                onChange={(e) => setForm(f => ({
                                                    ...f,
                                                    categories: { ...f.categories, [cat]: e.target.value }
                                                }))}
                                            />
                                        ) : (
                                            `${formatCurrency(catUtil?.spent)} / ${formatCurrency(catUtil?.budgetLimit)}`
                                        )}
                                    </span>
                                </div>
                                {!editing && (
                                    <div className="budget-progress-bar-bg">
                                        <motion.div
                                            className={`budget-progress-bar ${getProgressColor(catUtil?.status)}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(catUtil?.percentage || 0, 100)}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.05 }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default Budget;
