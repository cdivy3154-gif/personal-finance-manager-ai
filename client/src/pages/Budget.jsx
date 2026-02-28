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
    const [form, setForm] = useState({ totalBudget: '', categories: { Food: '', Entertainment: '', Academics: '', Transportation: '', Utilities: '', Shopping: '', Others: '' } });
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
            const budgetData = budgetRes.data.data;
            setBudget(budgetData);
            setUtilization(utilRes.data.data);
            // Convert all category values to strings for consistent form handling
            const catStrings = {};
            CATEGORIES.forEach(cat => {
                catStrings[cat] = budgetData.categories?.[cat] ? String(budgetData.categories[cat]) : '';
            });
            setForm({
                totalBudget: budgetData.totalBudget ? String(budgetData.totalBudget) : '',
                categories: catStrings
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
            const categories = {};
            CATEGORIES.forEach(cat => {
                const val = form.categories[cat];
                categories[cat] = val !== '' && val !== undefined ? Number(val) : 0;
            });
            const payload = {
                totalBudget: form.totalBudget !== '' ? Number(form.totalBudget) : 0,
                categories
            };

            console.log('Saving budget payload:', JSON.stringify(payload));
            await api.put(`/budget/${month}`, payload);
            toast.success('Budget saved! 💰');
            setEditing(false);
            fetchBudgetData();
        } catch (error) {
            console.error('Save budget error:', error);
            toast.error('Failed to save budget');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
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
                    <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '4px' }}>Budget</h1>
                    <p className="page-subtitle" style={{ letterSpacing: '0.2px' }}>Set and track your monthly spending limits</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {editing ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => { setEditing(false); const catStrings = {}; CATEGORIES.forEach(cat => { catStrings[cat] = budget.categories?.[cat] ? String(budget.categories[cat]) : ''; }); setForm({ totalBudget: budget.totalBudget ? String(budget.totalBudget) : '', categories: catStrings }); }}>
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
            <div className="month-picker" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 24, fontSize: '1.1rem', fontWeight: 600 }}>
                <button className="btn-icon" onClick={() => changeMonth(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
                    <HiOutlineChevronLeft />
                </button>
                <span style={{ minWidth: '140px', textAlign: 'center' }}>{formatMonthDisplay(month)}</span>
                <button className="btn-icon" onClick={() => changeMonth(1)} style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
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
                    style={{ padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', background: alert.type === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(255,165,2,0.15)', border: `1px solid ${alert.type === 'error' ? 'rgba(255,107,107,0.3)' : 'rgba(255,165,2,0.3)'}`, color: alert.type === 'error' ? '#ff6b6b' : '#ffa502', fontWeight: 500, fontSize: '0.9rem' }}
                >
                    <HiOutlineExclamation size={22} />
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>
                Category Budgets
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
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
                            <div className="budget-progress-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span className="budget-progress-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', display: 'flex' }}>{CATEGORY_EMOJIS[cat]}</span>
                                    <span>{cat}</span>
                                    {catUtil?.overBudget && (
                                        <span style={{ color: 'var(--accent-400)', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', background: 'rgba(255,107,107,0.15)', borderRadius: '12px', minWidth: 'max-content' }}>
                                            OVER
                                        </span>
                                    )}
                                </span>
                                <span className="budget-progress-values" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {editing ? (
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ width: 100, padding: '8px 12px', textAlign: 'right', fontSize: '0.9rem' }}
                                            placeholder="0"
                                            value={form.categories[cat] || ''}
                                            onChange={(e) => setForm(f => ({
                                                ...f,
                                                categories: { ...f.categories, [cat]: e.target.value }
                                            }))}
                                        />
                                    ) : (
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(catUtil?.spent)}</span>
                                    )}
                                    {!editing && ` / ${formatCurrency(catUtil?.budgetLimit)}`}
                                </span>
                            </div>
                            {!editing && (
                                <div className="budget-progress-bar-bg" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        className={`budget-progress-bar ${getProgressColor(catUtil?.status)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(catUtil?.percentage || 0, 100)}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.05 }}
                                        style={{ height: '100%', borderRadius: '4px', background: catUtil?.status === 'exceeded' ? 'var(--accent-400)' : catUtil?.status === 'warning' ? '#f97316' : catUtil?.status === 'caution' ? '#facc15' : 'var(--success-400)' }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default Budget;
