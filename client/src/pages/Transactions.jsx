/**
 * Transactions Page
 * Full CRUD with emoji categories, warm styling, timeline feel
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineX, HiOutlineSparkles
} from 'react-icons/hi';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Entertainment', 'Academics', 'Transportation', 'Utilities', 'Shopping', 'Others'];

const CATEGORY_CONFIG = {
    Food: { emoji: '🍕', color: '#E07A5F' },
    Entertainment: { emoji: '🎮', color: '#9B72CF' },
    Academics: { emoji: '📚', color: '#5B8FB9' },
    Transportation: { emoji: '🚌', color: '#E8A838' },
    Utilities: { emoji: '💡', color: '#5AACA8' },
    Shopping: { emoji: '🛍️', color: '#D4739D' },
    Income: { emoji: '💰', color: '#81B29A' },
    Others: { emoji: '📦', color: '#9B9DB3' }
};

const initialForm = {
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
};

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [filter, setFilter] = useState({ type: '', category: '' });
    const [suggestedCategory, setSuggestedCategory] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ limit: 20, page: pagination.page });
            if (filter.type) params.append('type', filter.type);
            if (filter.category) params.append('category', filter.category);
            const res = await api.get(`/transactions?${params}`);
            setTransactions(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [filter, pagination.page]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleDescriptionChange = async (description) => {
        setForm(prev => ({ ...prev, description }));
        if (description.length > 2 && form.type === 'expense') {
            try {
                const res = await api.get(`/transactions/suggest-category?description=${encodeURIComponent(description)}`);
                if (res.data.category && res.data.category !== 'Others') {
                    setSuggestedCategory(res.data.category);
                } else {
                    setSuggestedCategory(null);
                }
            } catch { setSuggestedCategory(null); }
        } else {
            setSuggestedCategory(null);
        }
    };

    const applySuggestion = () => {
        if (suggestedCategory) {
            setForm(prev => ({ ...prev, category: suggestedCategory }));
            setSuggestedCategory(null);
            toast.success(`Category set to ${suggestedCategory}`, { icon: '🤖' });
        }
    };

    const openModal = (transaction = null) => {
        if (transaction) {
            setEditingId(transaction._id);
            setForm({
                type: transaction.type,
                amount: transaction.amount.toString(),
                category: transaction.category,
                description: transaction.description,
                date: new Date(transaction.date).toISOString().split('T')[0]
            });
        } else {
            setEditingId(null);
            setForm(initialForm);
        }
        setSuggestedCategory(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            amount: parseFloat(form.amount),
            category: form.type === 'income' ? 'Income' : (form.category || 'Others')
        };
        try {
            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
                toast.success('Transaction updated! ✏️');
            } else {
                const res = await api.post('/transactions', payload);
                if (res.data.autoSuggested) {
                    toast.success(`Added & auto-categorized as ${res.data.suggestedCategory}`, { icon: '🤖' });
                } else {
                    toast.success('Transaction added! 🎉');
                }
            }
            setShowModal(false);
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save transaction');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Transaction deleted');
            fetchTransactions();
        } catch { toast.error('Failed to delete'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Track your income and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <HiOutlinePlus size={18} /> Add Transaction
                </button>
            </div>

            {/* Filters — emoji pills */}
            <div className="filter-bar" style={{ gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', scrollbarWidth: 'none' }}>
                <button
                    className={`filter-chip ${filter.type === '' ? 'active' : ''}`}
                    onClick={() => setFilter(f => ({ ...f, type: '' }))}
                >
                    All
                </button>
                <button
                    className={`filter-chip ${filter.type === 'income' ? 'active' : ''}`}
                    onClick={() => setFilter(f => ({ ...f, type: 'income' }))}
                >
                    💰 Income
                </button>
                <button
                    className={`filter-chip ${filter.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setFilter(f => ({ ...f, type: 'expense' }))}
                >
                    💸 Expenses
                </button>
                <div style={{ width: 1, height: 24, background: 'var(--border-light)', margin: '0 4px', alignSelf: 'center' }} />
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-chip ${filter.category === cat ? 'active' : ''}`}
                        onClick={() => setFilter(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                    >
                        {CATEGORY_CONFIG[cat]?.emoji} {cat}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16 }} />
                    ))}
                </div>
            ) : transactions.length > 0 ? (
                <>
                    <div className="transaction-list">
                        <AnimatePresence>
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={tx._id}
                                    className="transaction-item"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ x: 4 }}
                                    style={{ padding: '14px 20px', marginBottom: '6px' }}
                                >
                                    <div
                                        className="transaction-icon"
                                        style={{
                                            background: tx.type === 'income'
                                                ? 'var(--secondary-bg)'
                                                : `${CATEGORY_CONFIG[tx.category]?.color || '#9B9DB3'}12`,
                                            fontSize: '1.3rem',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        {tx.type === 'income' ? '💰' : (CATEGORY_CONFIG[tx.category]?.emoji || '📦')}
                                    </div>
                                    <div className="transaction-info" style={{ flex: 1 }}>
                                        <div className="transaction-desc">{tx.description}</div>
                                        <div className="transaction-meta">
                                            <span className={`category-badge ${tx.category}`}>{tx.category}</span>
                                            <span>·</span>
                                            <span>{formatDate(tx.date)}</span>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${tx.type}`} style={{
                                        fontSize: '1.1rem', fontWeight: 700, marginRight: '12px',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </div>
                                    <div className="transaction-actions" style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn-icon" onClick={() => openModal(tx)} title="Edit" style={{ width: 32, height: 32 }}>
                                            <HiOutlinePencil size={14} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleDelete(tx._id)}
                                            title="Delete"
                                            style={{ color: 'var(--danger)', width: 32, height: 32, borderColor: 'rgba(224, 122, 95, 0.15)' }}
                                        >
                                            <HiOutlineTrash size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            {Array.from({ length: pagination.pages }, (_, i) => (
                                <button
                                    key={i}
                                    className={`filter-chip ${pagination.page === i + 1 ? 'active' : ''}`}
                                    onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-card-static" style={{ padding: '48px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">🐷</div>
                        <h3>No transactions found</h3>
                        <p>Your financial journey starts here! Add your first transaction to begin tracking. 🚀</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <HiOutlinePlus /> Add First Transaction
                        </button>
                    </div>
                </div>
            )}

            {/* FAB for mobile */}
            <button className="fab" onClick={() => openModal()}>
                <HiOutlinePlus />
            </button>

            {/* Add/Edit Modal */}
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
                                <h2 className="modal-title">
                                    {editingId ? 'Edit Transaction' : 'New Transaction'}
                                </h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Type Toggle */}
                                <div className="tabs" style={{ marginBottom: 24 }}>
                                    <button
                                        type="button"
                                        className={`tab ${form.type === 'expense' ? 'active' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
                                    >
                                        💸 Expense
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab ${form.type === 'income' ? 'active' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Income' }))}
                                    >
                                        💰 Income
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0.01"
                                        value={form.amount}
                                        onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                                        required
                                        autoFocus
                                        style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="What was this for?"
                                        value={form.description}
                                        onChange={(e) => handleDescriptionChange(e.target.value)}
                                        required
                                        maxLength={200}
                                    />
                                    {suggestedCategory && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ marginTop: 8 }}
                                        >
                                            <button type="button" className="suggestion-badge" onClick={applySuggestion}>
                                                <HiOutlineSparkles /> AI suggests: {suggestedCategory} — click to apply
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="form-row">
                                    {form.type === 'expense' && (
                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-select"
                                                value={form.category}
                                                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select category</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{CATEGORY_CONFIG[cat]?.emoji} {cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.date}
                                            onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }}>
                                    {editingId ? 'Update Transaction' : 'Add Transaction'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Transactions;
