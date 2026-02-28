/**
 * Dashboard Page
 * Summary cards, recent transactions, pie chart, and trend line chart
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    HiOutlineTrendingUp, HiOutlineTrendingDown,
    HiOutlineCash, HiOutlineSparkles, HiOutlineArrowRight,
    HiOutlineLightBulb
} from 'react-icons/hi';
import api from '../utils/api';

// Category color mapping
const CATEGORY_COLORS = {
    Food: '#ff6b6b',
    Entertainment: '#a855f7',
    Academics: '#3b82f6',
    Transportation: '#f97316',
    Utilities: '#06b6d4',
    Shopping: '#ec4899',
    Others: '#8b8ba3'
};

// Animation variants for staggered card entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(10, 12, 22, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                color: '#f8fafc'
            }}>
                <p style={{ fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>{payload[0].name || ''}</p>
                <p style={{ color: payload[0].color || 'var(--primary-400)', fontSize: '1.1rem', fontWeight: 700 }}>
                    ₹{payload[0].value?.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, transRes] = await Promise.all([
                api.get('/transactions/stats'),
                api.get('/transactions?limit=5')
            ]);
            setStats(statsRes.data.data);
            setRecentTransactions(transRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });
    };

    // Prepare pie chart data
    const pieData = stats?.categoryBreakdown?.map(cat => ({
        name: cat._id,
        value: cat.total,
        color: CATEGORY_COLORS[cat._id] || '#8b8ba3'
    })) || [];

    // Prepare daily trend data
    const trendData = stats?.dailyTrend?.map(d => ({
        day: `Day ${d._id}`,
        amount: d.total
    })) || [];

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: 300, height: 16 }} />
                    </div>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: 130, borderRadius: 20 }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <motion.h1 variants={cardVariants} className="page-title">
                        Dashboard
                    </motion.h1>
                    <motion.p variants={cardVariants} className="page-subtitle" style={{ letterSpacing: '0.2px' }}>
                        Your financial overview at a glance
                    </motion.p>
                </div>
                <motion.div variants={cardVariants}>
                    <Link to="/transactions" className="btn btn-primary">
                        <HiOutlineCash size={18} />
                        Add Transaction
                    </Link>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <motion.div variants={cardVariants} className="stats-grid">
                <motion.div
                    className="stat-card income"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Income</span>
                        <div className="stat-card-icon">
                            <HiOutlineTrendingUp />
                        </div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.totalIncome)}</div>
                    <div className="stat-card-sub">This month</div>
                </motion.div>

                <motion.div
                    className="stat-card expense"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Expenses</span>
                        <div className="stat-card-icon">
                            <HiOutlineTrendingDown />
                        </div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.totalExpense)}</div>
                    <div className="stat-card-sub">This month</div>
                </motion.div>

                <motion.div
                    className="stat-card balance"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Balance</span>
                        <div className="stat-card-icon">
                            <HiOutlineCash />
                        </div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.balance)}</div>
                    <div className="stat-card-sub">Income - Expenses</div>
                </motion.div>

                <motion.div
                    className="stat-card savings"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Savings Rate</span>
                        <div className="stat-card-icon">
                            <HiOutlineSparkles />
                        </div>
                    </div>
                    <div className="stat-card-value">{stats?.savingsRate || 0}%</div>
                    <div className="stat-card-sub">Of total income saved</div>
                </motion.div>
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={cardVariants} className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
                {/* Spending by Category */}
                <div className="glass-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Spending by Category</h3>
                    </div>
                    <div className="chart-container">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <p>No expense data yet</p>
                            </div>
                        )}
                        {/* Category Legend */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                            {pieData.map((cat, i) => (
                                <span key={i} className={`category-badge ${cat.name}`} style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: cat.color, display: 'inline-block'
                                    }}></span>
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Spending Trend */}
                <div className="glass-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Daily Spending Trend</h3>
                    </div>
                    <div className="chart-container">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-400)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--primary-400)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--primary-400)"
                                        strokeWidth={3}
                                        fill="url(#colorAmount)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <p>No spending data to show trends</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Bottom Row: Recent Transactions + Insights */}
            <motion.div variants={cardVariants} className="grid-2">
                {/* Recent Transactions */}
                <div className="glass-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Recent Transactions</h3>
                        <Link to="/transactions" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                            View All <HiOutlineArrowRight />
                        </Link>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div className="transaction-list">
                            {recentTransactions.map((tx) => (
                                <motion.div
                                    key={tx._id}
                                    className="transaction-item"
                                    whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.02)' }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '16px', borderRadius: 0, border: 'none', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}
                                >
                                    <div
                                        className="transaction-icon"
                                        style={{
                                            background: tx.type === 'income'
                                                ? 'rgba(46, 213, 115, 0.15)'
                                                : `${CATEGORY_COLORS[tx.category]}20`,
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
                                    <div className={`transaction-amount ${tx.type}`} style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">💳</div>
                            <h3>No transactions yet</h3>
                            <p>Add your first transaction to get started!</p>
                            <Link to="/transactions" className="btn btn-primary">
                                Add Transaction
                            </Link>
                        </div>
                    )}
                </div>

                {/* AI Insights */}
                <div className="glass-card">
                    <div className="chart-header">
                        <h3 className="chart-title">
                            <HiOutlineLightBulb style={{ color: '#ffa502', marginRight: 8 }} />
                            Smart Insights
                        </h3>
                    </div>
                    {stats?.insights && stats.insights.length > 0 ? (
                        <div className="insights-container">
                            {stats.insights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    className="insight-item"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {insight}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🤖</div>
                            <h3>No insights yet</h3>
                            <p>Add more transactions to unlock AI-powered spending insights</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
