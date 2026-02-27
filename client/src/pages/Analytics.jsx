/**
 * Analytics Page
 * Monthly/weekly breakdowns, category pie chart, expense trends, budget vs actual
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area, LineChart, Line
} from 'recharts';
import {
    HiOutlineChevronLeft, HiOutlineChevronRight,
    HiOutlineLightBulb
} from 'react-icons/hi';
import api from '../utils/api';

const CATEGORY_COLORS = {
    Food: '#ff6b6b', Entertainment: '#a855f7', Academics: '#3b82f6',
    Transportation: '#f97316', Utilities: '#06b6d4', Shopping: '#ec4899',
    Others: '#8b8ba3'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#1a1a3a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.8rem',
            }}>
                <p style={{ color: '#f0f0ff', fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ color: entry.color }}>
                        {entry.name}: ${entry.value?.toFixed(2)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function Analytics() {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [stats, setStats] = useState(null);
    const [utilization, setUtilization] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [month]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [y, m] = month.split('-');
            const [statsRes, utilRes] = await Promise.all([
                api.get(`/transactions/stats?month=${m}&year=${y}`),
                api.get(`/budget/${month}/utilization`)
            ]);
            setStats(statsRes.data.data);
            setUtilization(utilRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (direction) => {
        const [y, m] = month.split('-').map(Number);
        const date = new Date(y, m - 1 + direction, 1);
        setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonthDisplay = (monthStr) => {
        const [y, m] = monthStr.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    // Prepare data
    const pieData = stats?.categoryBreakdown?.map(cat => ({
        name: cat._id,
        value: cat.total,
        count: cat.count,
        color: CATEGORY_COLORS[cat._id] || '#8b8ba3'
    })) || [];

    const dailyTrendData = stats?.dailyTrend?.map(d => ({
        day: d._id,
        amount: d.total
    })) || [];

    // Budget vs Actual comparison data
    const budgetVsActual = utilization?.categories?.filter(c => c.budgetLimit > 0).map(c => ({
        name: c.category,
        budget: c.budgetLimit,
        actual: c.spent,
        fill: CATEGORY_COLORS[c.category] || '#8b8ba3'
    })) || [];

    // Monthly trend data
    const monthlyTrendData = (() => {
        if (!stats?.monthlyTrend) return [];
        const map = {};
        stats.monthlyTrend.forEach(item => {
            const key = `${MONTHS[item._id.month - 1]}`;
            if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
            if (item._id.type === 'income') map[key].income = item.total;
            if (item._id.type === 'expense') map[key].expense = item.total;
        });
        return Object.values(map);
    })();

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <div className="skeleton" style={{ width: 200, height: 28 }} />
                </div>
                <div className="grid-2">
                    <div className="skeleton" style={{ height: 350, borderRadius: 20 }} />
                    <div className="skeleton" style={{ height: 350, borderRadius: 20 }} />
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Deep dive into your spending patterns</p>
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

            {/* Tab Navigation */}
            <div className="tabs">
                {['overview', 'trends', 'budget'].map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Summary Row */}
                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        <div className="stat-card income">
                            <span className="stat-card-label">Income</span>
                            <div className="stat-card-value">{formatCurrency(stats?.totalIncome)}</div>
                        </div>
                        <div className="stat-card expense">
                            <span className="stat-card-label">Expenses</span>
                            <div className="stat-card-value">{formatCurrency(stats?.totalExpense)}</div>
                        </div>
                        <div className="stat-card balance">
                            <span className="stat-card-label">Net</span>
                            <div className="stat-card-value">{formatCurrency(stats?.balance)}</div>
                        </div>
                        <div className="stat-card savings">
                            <span className="stat-card-label">Transactions</span>
                            <div className="stat-card-value">{stats?.transactionCount || 0}</div>
                        </div>
                    </div>

                    <div className="grid-2">
                        {/* Category Breakdown Pie */}
                        <div className="glass-card">
                            <h3 className="chart-title" style={{ marginBottom: 16 }}>Spending Distribution</h3>
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={95}
                                                paddingAngle={3}
                                                dataKey="value"
                                                animationDuration={800}
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                        {pieData.map((cat, i) => {
                                            const total = pieData.reduce((s, c) => s + c.value, 0);
                                            const pct = ((cat.value / total) * 100).toFixed(1);
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{
                                                            width: 10, height: 10, borderRadius: '50%',
                                                            background: cat.color, display: 'inline-block'
                                                        }} />
                                                        <span style={{ fontSize: '0.85rem' }}>{cat.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
                                                        <span style={{ fontWeight: 600 }}>{formatCurrency(cat.value)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <p>No expense data for this month</p>
                                </div>
                            )}
                        </div>

                        {/* Daily Spending */}
                        <div className="glass-card">
                            <h3 className="chart-title" style={{ marginBottom: 16 }}>Daily Spending</h3>
                            {dailyTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={380}>
                                    <AreaChart data={dailyTrendData}>
                                        <defs>
                                            <linearGradient id="colorDailyAnalytics" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6c2fff" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6c2fff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            name="Spending"
                                            stroke="#6c2fff"
                                            strokeWidth={2}
                                            fill="url(#colorDailyAnalytics)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">
                                    <p>No data to display</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights */}
                    {stats?.insights && stats.insights.length > 0 && (
                        <div className="glass-card" style={{ marginTop: 24 }}>
                            <h3 className="chart-title" style={{ marginBottom: 16 }}>
                                <HiOutlineLightBulb style={{ color: '#ffa502', marginRight: 8 }} />
                                AI Insights
                            </h3>
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
                        </div>
                    )}
                </motion.div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3 className="chart-title" style={{ marginBottom: 16 }}>Income vs Expenses (Last 6 Months)</h3>
                        {monthlyTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={monthlyTrendData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#2ed573" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="expense" name="Expenses" fill="#ff4757" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <p>Not enough data for trends yet. Keep tracking!</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card">
                        <h3 className="chart-title" style={{ marginBottom: 16 }}>Spending Flow (Last 6 Months)</h3>
                        {monthlyTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        name="Income"
                                        stroke="#2ed573"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#2ed573', r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        name="Expenses"
                                        stroke="#ff4757"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#ff4757', r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <p>Track for a few months to see trends</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Budget Tab */}
            {activeTab === 'budget' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-card">
                        <h3 className="chart-title" style={{ marginBottom: 16 }}>Budget vs Actual Spending</h3>
                        {budgetVsActual.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={budgetVsActual} layout="vertical" barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="budget" name="Budget" fill="rgba(108,47,255,0.4)" radius={[0, 6, 6, 0]} />
                                    <Bar dataKey="actual" name="Actual" fill="#a855f7" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📊</div>
                                <h3>No budget set</h3>
                                <p>Set up your budget to see how your spending compares</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default Analytics;
