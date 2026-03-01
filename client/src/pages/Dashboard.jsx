/**
 * Dashboard Page
 * Hero balance, asymmetric stat cards, emoji categories, warm charts, timeline transactions
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

// Category config — emoji + warm color
const CATEGORIES = {
    Food: { emoji: '🍕', color: '#E07A5F' },
    Entertainment: { emoji: '🎮', color: '#9B72CF' },
    Academics: { emoji: '📚', color: '#5B8FB9' },
    Transportation: { emoji: '🚌', color: '#E8A838' },
    Utilities: { emoji: '💡', color: '#5AACA8' },
    Shopping: { emoji: '🛍️', color: '#D4739D' },
    Others: { emoji: '📦', color: '#9B9DB3' }
};

// Warm chart colors
const CHART_COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#5B8FB9', '#9B72CF', '#D4739D', '#5AACA8'];

// Animation variants for staggered entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

// Custom tooltip with warm styling
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#FFFFFF',
                border: '1px solid rgba(61, 64, 91, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                boxShadow: '0 8px 24px rgba(61, 64, 91, 0.1)',
                color: '#3D405B'
            }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: '#6B6E8A' }}>
                    {payload[0].name || ''}
                </p>
                <p style={{ color: payload[0].color || '#E07A5F', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    ₹{payload[0].value?.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

// Motivational messages
const MOTIVATIONS = [
    { emoji: '🔥', text: 'Keep tracking! Consistency is the key to financial freedom.' },
    { emoji: '💡', text: 'Tip: Try the 50/30/20 rule — Needs, Wants, Savings.' },
    { emoji: '🎯', text: 'Students who budget save 40% more on average!' },
    { emoji: '☕', text: 'Your daily ₹200 coffee = ₹73,000 per year. Think about it!' },
    { emoji: '🚀', text: 'Every expense tracked brings you closer to your goals.' },
];

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [motivation] = useState(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatCurrencyFull = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });
    };

    // Prepare pie chart data
    const pieData = stats?.categoryBreakdown?.map((cat, i) => ({
        name: cat._id,
        value: cat.total,
        color: CATEGORIES[cat._id]?.color || CHART_COLORS[i % CHART_COLORS.length]
    })) || [];

    // Prepare daily trend data
    const trendData = stats?.dailyTrend?.map(d => ({
        day: `Day ${d._id}`,
        amount: d.total
    })) || [];

    if (loading) {
        return (
            <div>
                {/* Skeleton hero */}
                <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 28 }} />
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />
                    ))}
                </div>
                <div className="grid-2" style={{ marginTop: 28 }}>
                    <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
                    <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Hero Balance — BIG, bold, unmissable */}
            <motion.div variants={cardVariants} className="hero-balance">
                <div className="hero-balance-label">Current Balance</div>
                <div className="hero-balance-amount">
                    {formatCurrency(stats?.balance)}
                </div>
                <div className="hero-balance-sub">
                    <span style={{ color: 'var(--secondary-dark)', fontWeight: 600 }}>
                        +{formatCurrency(stats?.totalIncome)}
                    </span>
                    {' income  ·  '}
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        -{formatCurrency(stats?.totalExpense)}
                    </span>
                    {' spent this month'}
                </div>
            </motion.div>

            {/* Motivational Tip — playful, unexpected */}
            <motion.div variants={cardVariants} className="motivation-tip">
                <span className="motivation-tip-icon">{motivation.emoji}</span>
                <span>{motivation.text}</span>
            </motion.div>

            {/* Quick Stats — asymmetric grid */}
            <motion.div variants={cardVariants} className="stats-grid" style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '18px'
            }}>
                <motion.div
                    className="stat-card income"
                    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Income</span>
                        <div className="stat-card-icon"><HiOutlineTrendingUp /></div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.totalIncome)}</div>
                    <div className="stat-card-sub">This month</div>
                </motion.div>

                <motion.div
                    className="stat-card expense"
                    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Expenses</span>
                        <div className="stat-card-icon"><HiOutlineTrendingDown /></div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.totalExpense)}</div>
                    <div className="stat-card-sub">This month</div>
                </motion.div>

                <motion.div
                    className="stat-card balance"
                    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Balance</span>
                        <div className="stat-card-icon"><HiOutlineCash /></div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats?.balance)}</div>
                    <div className="stat-card-sub">Income − Expenses</div>
                </motion.div>

                <motion.div
                    className="stat-card savings"
                    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                >
                    <div className="stat-card-header">
                        <span className="stat-card-label">Savings Rate</span>
                        <div className="stat-card-icon"><HiOutlineSparkles /></div>
                    </div>
                    <div className="stat-card-value">{stats?.savingsRate || 0}%</div>
                    <div className="stat-card-sub">Of income saved</div>
                </motion.div>
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={cardVariants} className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
                {/* Spending by Category — Donut */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
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
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1000}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🐷</div>
                                <h3>No expenses yet</h3>
                                <p>Your piggy bank is still full! Start tracking to see where your money goes.</p>
                            </div>
                        )}
                        {/* Category Legend — with emojis */}
                        {pieData.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                                {pieData.map((cat, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.78rem',
                                        padding: '5px 12px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '20px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 500
                                    }}>
                                        <span>{CATEGORIES[cat.name]?.emoji || '📦'}</span>
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Spending Trend — warm gradient fill */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">Daily Spending Trend</h3>
                    </div>
                    <div className="chart-container">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorAmountWarm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61, 64, 91, 0.06)" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#9B9DB3' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#9B9DB3' }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ stroke: 'rgba(224, 122, 95, 0.15)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#E07A5F"
                                        strokeWidth={3}
                                        fill="url(#colorAmountWarm)"
                                        dot={{ fill: '#E07A5F', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 6, stroke: '#E07A5F', strokeWidth: 2, fill: '#FFFFFF' }}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📊</div>
                                <h3>No trends yet</h3>
                                <p>Add a few expenses and watch your spending patterns unfold!</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Bottom Row: Recent Transactions + Insights */}
            <motion.div variants={cardVariants} className="grid-2">
                {/* Recent Transactions — with category emojis */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">Recent Transactions</h3>
                        <Link to="/transactions" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px', borderWidth: '1.5px' }}>
                            View All <HiOutlineArrowRight />
                        </Link>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div className="transaction-list">
                            {recentTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx._id}
                                    className="transaction-item"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ x: 4 }}
                                    style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                >
                                    <div
                                        className="transaction-icon"
                                        style={{
                                            background: tx.type === 'income'
                                                ? 'var(--secondary-bg)'
                                                : `${CATEGORIES[tx.category]?.color || '#9B9DB3'}12`,
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '1.3rem'
                                        }}
                                    >
                                        {tx.type === 'income' ? '💰' : (CATEGORIES[tx.category]?.emoji || '📦')}
                                    </div>
                                    <div className="transaction-info">
                                        <div className="transaction-desc">{tx.description}</div>
                                        <div className="transaction-meta">
                                            <span className={`category-badge ${tx.category}`}>{tx.category}</span>
                                            <span>·</span>
                                            <span>{formatDate(tx.date)}</span>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${tx.type}`} style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        fontFamily: "'Outfit', sans-serif"
                                    }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🐷</div>
                            <h3>Your financial journey starts here! 🚀</h3>
                            <p>Add your first transaction to begin tracking your money like a pro.</p>
                            <Link to="/transactions" className="btn btn-primary">
                                Add First Expense
                            </Link>
                        </div>
                    )}
                </div>

                {/* Smart Insights */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
                    <div className="chart-header">
                        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💡</span>
                            Smart Insights
                        </h3>
                    </div>
                    {stats?.insights && stats.insights.length > 0 ? (
                        <div className="insights-container">
                            {stats.insights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    className="insight-item"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📌</span>
                                    <span>{insight}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🤖</div>
                            <h3>Insights are brewing...</h3>
                            <p>Add more transactions to unlock AI-powered spending insights and smart tips!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
