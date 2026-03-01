/**
 * Analytics Page
 * Warm charts with thick strokes, gradient fills, and brand colors
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import api from '../utils/api';

const CATEGORY_CONFIG = {
    Food: { emoji: '🍕', color: '#E07A5F' },
    Entertainment: { emoji: '🎮', color: '#9B72CF' },
    Academics: { emoji: '📚', color: '#5B8FB9' },
    Transportation: { emoji: '🚌', color: '#E8A838' },
    Utilities: { emoji: '💡', color: '#5AACA8' },
    Shopping: { emoji: '🛍️', color: '#D4739D' },
    Others: { emoji: '📦', color: '#9B9DB3' }
};

const CHART_COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#5B8FB9', '#9B72CF', '#D4739D', '#5AACA8'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// Warm custom tooltip
const WarmTooltip = ({ active, payload, label }) => {
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
                <p style={{ fontWeight: 600, marginBottom: 4, color: '#6B6E8A', fontSize: '0.78rem' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '1rem' }}>
                        {p.name}: ₹{p.value?.toLocaleString('en-IN')}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function Analytics() {
    const [stats, setStats] = useState(null);
    const [budgetComparison, setBudgetComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, budgetRes] = await Promise.all([
                    api.get('/transactions/stats'),
                    api.get(`/budget/${new Date().toISOString().slice(0, 7)}/utilization`)
                ]);
                setStats(statsRes.data.data);
                setBudgetComparison(budgetRes.data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    // Prepare data
    const pieData = stats?.categoryBreakdown?.map((cat, i) => ({
        name: cat._id,
        value: cat.total,
        color: CATEGORY_CONFIG[cat._id]?.color || CHART_COLORS[i % CHART_COLORS.length],
        emoji: CATEGORY_CONFIG[cat._id]?.emoji || '📦'
    })) || [];

    const trendData = stats?.dailyTrend?.map(d => ({
        day: d._id,
        amount: d.total
    })) || [];

    const budgetCompareData = budgetComparison?.categories?.map(c => ({
        category: c.category,
        budget: c.budgetLimit,
        spent: c.spent,
        emoji: CATEGORY_CONFIG[c.category]?.emoji || '📦'
    })).filter(c => c.budget > 0 || c.spent > 0) || [];

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
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Deep dive into your spending patterns</p>
                </div>
            </div>

            {/* View Toggle */}
            <motion.div variants={cardVariants} className="tabs" style={{ maxWidth: 360 }}>
                <button className={`tab ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
                    📊 Overview
                </button>
                <button className={`tab ${activeView === 'trends' ? 'active' : ''}`} onClick={() => setActiveView('trends')}>
                    📈 Trends
                </button>
                <button className={`tab ${activeView === 'budget' ? 'active' : ''}`} onClick={() => setActiveView('budget')}>
                    🎯 Budget
                </button>
            </motion.div>

            {activeView === 'overview' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Spending Breakdown */}
                    <motion.div variants={cardVariants} className="grid-2" style={{ marginBottom: 28 }}>
                        {/* Pie Chart */}
                        <div className="glass-card-static" style={{ padding: 24 }}>
                            <h3 className="chart-title" style={{ marginBottom: 18 }}>Spending Breakdown</h3>
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                                animationDuration={1000}
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<WarmTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                                        {pieData.map((cat, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.78rem', padding: '5px 12px',
                                                background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                                                borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6,
                                                color: 'var(--text-secondary)', fontWeight: 500
                                            }}>
                                                <span>{cat.emoji}</span>{cat.name}: {formatCurrency(cat.value)}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📊</div>
                                    <h3>No data yet</h3>
                                    <p>Add some expenses to see your spending breakdown.</p>
                                </div>
                            )}
                        </div>

                        {/* Top Categories Bar Chart */}
                        <div className="glass-card-static" style={{ padding: 24 }}>
                            <h3 className="chart-title" style={{ marginBottom: 18 }}>Top Categories</h3>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={pieData.slice(0, 6)} layout="vertical" barCategoryGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(61, 64, 91, 0.06)" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9B9DB3' }} />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#3D405B', fontWeight: 500 }} width={100} />
                                        <Tooltip content={<WarmTooltip />} />
                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={1200}>
                                            {pieData.slice(0, 6).map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📈</div>
                                    <h3>Nothing here yet</h3>
                                    <p>Start tracking expenses to discover your top spending categories.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {activeView === 'trends' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Daily Spending Trend */}
                    <motion.div variants={cardVariants} className="glass-card-static" style={{ padding: 24, marginBottom: 28 }}>
                        <h3 className="chart-title" style={{ marginBottom: 18 }}>Daily Spending Trend</h3>
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61, 64, 91, 0.06)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9B9DB3' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9B9DB3' }} />
                                    <Tooltip content={<WarmTooltip />} />
                                    <Area type="monotone" dataKey="amount" stroke="#E07A5F" strokeWidth={3}
                                        fill="url(#colorTrend)"
                                        dot={{ fill: '#E07A5F', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 6, stroke: '#E07A5F', strokeWidth: 2, fill: '#FFFFFF' }}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📉</div>
                                <h3>No trends available</h3>
                                <p>Add more transactions over time to see daily patterns emerge.</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}

            {activeView === 'budget' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Budget vs Actual */}
                    <motion.div variants={cardVariants} className="glass-card-static" style={{ padding: 24 }}>
                        <h3 className="chart-title" style={{ marginBottom: 18 }}>Budget vs Actual Spending</h3>
                        {budgetCompareData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={380}>
                                <BarChart data={budgetCompareData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61, 64, 91, 0.06)" />
                                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#3D405B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9B9DB3' }} />
                                    <Tooltip content={<WarmTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '0.82rem', fontWeight: 500 }} />
                                    <Bar dataKey="budget" name="Budget" fill="#81B29A" radius={[4, 4, 0, 0]} opacity={0.6} animationDuration={1000} />
                                    <Bar dataKey="spent" name="Spent" fill="#E07A5F" radius={[4, 4, 0, 0]} animationDuration={1200} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎯</div>
                                <h3>No budget data</h3>
                                <p>Set up your budget to compare planned vs actual spending.</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default Analytics;
