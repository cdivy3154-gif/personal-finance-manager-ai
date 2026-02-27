/**
 * Transactions Page
 * Full CRUD for income/expense with filters, modal form, and smart auto-categorization
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineX, HiOutlineTrendingUp, HiOutlineTrendingDown,
    HiOutlineSparkles, HiOutlineSearch
} from 'react-icons/hi';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Entertainment', 'Academics', 'Transportation', 'Utilities', 'Shopping', 'Others'];
const CATEGORY_COLORS = {
    Food: '#ff6b6b', Entertainment: '#a855f7', Academics: '#3b82f6',
    Transportation: '#f97316', Utilities: '#06b6d4', Shopping: '#ec4899',
    Income: '#2ed573', Others: '#8b8ba3'
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

    // Fetch transactions
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

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Smart category suggestion on description change
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
            } catch {
                // Silently fail suggestion
            }
        } else {
            setSuggestedCategory(null);
        }
    };

    // Apply suggested category
    const applySuggestion = () => {
        if (suggestedCategory) {
            setForm(prev => ({ ...prev, category: suggestedCategory }));
            setSuggestedCategory(null);
            toast.success(`Category set to ${suggestedCategory}`, { icon: '🤖' });
        }
    };

    // Open modal for new/edit
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

    // Submit form
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

    // Delete transaction
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Transaction deleted');
            fetchTransactions();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
                    <HiOutlinePlus /> Add Transaction
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
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
                <span style={{ width: 1, height: 24, background: 'var(--border-glass)', margin: '0 4px' }} />
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-chip ${filter.category === cat ? 'active' : ''}`}
                        onClick={() => setFilter(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                    >
                        {cat}
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div
                                        className="transaction-icon"
                                        style={{
                                            background: tx.type === 'income'
                                                ? 'rgba(46,213,115,0.15)'
                                                : `${CATEGORY_COLORS[tx.category] || '#8b8ba3'}20`,
                                            color: tx.type === 'income'
                                                ? '#2ed573'
                                                : CATEGORY_COLORS[tx.category] || '#8b8ba3'
                                        }}
                                    >
                                        {tx.type === 'income' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                                    </div>
                                    <div className="transaction-info">
                                        <div className="transaction-desc">{tx.description}</div>
                                        <div className="transaction-meta">
                                            <span className={`category-badge ${tx.category}`}>{tx.category}</span>
                                            <span>•</span>
                                            <span>{formatDate(tx.date)}</span>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${tx.type}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </div>
                                    <div className="transaction-actions">
                                        <button className="btn-icon" onClick={() => openModal(tx)} title="Edit">
                                            <HiOutlinePencil size={16} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleDelete(tx._id)}
                                            title="Delete"
                                            style={{ color: 'var(--accent-400)' }}
                                        >
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
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
                <div className="glass-card">
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <h3>No transactions found</h3>
                        <p>Start tracking your finances by adding your first transaction</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <HiOutlinePlus /> Add Transaction
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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
                                <div className="tabs" style={{ marginBottom: 20 }}>
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

                                {/* Amount */}
                                <div className="form-group">
                                    <label className="form-label">Amount ($)</label>
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
                                    />
                                </div>

                                {/* Description */}
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
                                    {/* AI Suggestion Badge */}
                                    {suggestedCategory && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ marginTop: 8 }}
                                        >
                                            <button
                                                type="button"
                                                className="suggestion-badge"
                                                onClick={applySuggestion}
                                            >
                                                <HiOutlineSparkles /> AI suggests: {suggestedCategory} — click to apply
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="form-row">
                                    {/* Category (for expenses only) */}
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
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Date */}
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

                                {/* Submit */}
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
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
