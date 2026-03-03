/**
 * Layout Component
 * Warm sidebar with student personality, mobile bottom nav
 */
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineHome,
    HiOutlineCreditCard,
    HiOutlineChartPie,
    HiOutlineChartBar,
    HiOutlineUserGroup,
    HiOutlineStar,
    HiOutlineMenu,
    HiOutlineX
} from 'react-icons/hi';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, emoji: '🏠' },
    { path: '/transactions', label: 'Transactions', icon: HiOutlineCreditCard, emoji: '💳' },
    { path: '/budget', label: 'Budget', icon: HiOutlineChartPie, emoji: '📊' },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar, emoji: '📈' },
    { path: '/bills', label: 'Split Bills', icon: HiOutlineUserGroup, emoji: '👥' },
    { path: '/goals', label: 'Goals', icon: HiOutlineStar, emoji: '🎯' },
];

// Motivational tips for sidebar footer
const TIPS = [
    "☕ That daily latte adds up to ₹36,500/year!",
    "🎯 Students who track expenses save 2x more.",
    "📚 Small savings today = big freedom tomorrow!",
    "💡 The 50/30/20 rule: Needs/Wants/Savings",
    "🚀 Every rupee tracked is a rupee saved!"
];

function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

    // Get current greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Get page title from route
    const getPageTitle = () => {
        const item = navItems.find(n => n.path === location.pathname);
        return item ? item.label : 'Overview';
    };

    return (
        <div className="app-layout">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-toggle btn-icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 150,
                    display: 'none',
                }}
            >
                {isMobileMenuOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
            </button>

            {/* Sidebar Overlay for mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="sidebar-overlay-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">F</div>
                    <div className="sidebar-brand">
                        <h1>FinTrack</h1>
                        <span>Student Finance</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">Menu</span>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Motivational footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-footer-card">
                        <p>{tip}</p>
                        <span className="version">v2.0 — Made with ❤️</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Top Navbar */}
                <div className="top-bar">
                    <div>
                        <p className="top-bar-greeting">
                            {getGreeting()}, Student 👋
                        </p>
                        <h1 className="top-bar-title">
                            {getPageTitle()}
                        </h1>
                    </div>
                    <div className="top-bar-actions">
                        {/* Student avatar */}
                        <div className="top-bar-avatar">
                            🎓
                        </div>
                    </div>
                </div>

                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Mobile Bottom Navigation — 64px touch targets */}
            <nav className="mobile-nav">
                <div className="mobile-nav-items">
                    {navItems.slice(0, 5).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-toggle { display: flex !important; }
                    .sidebar-overlay { display: block !important; }
                }
            `}</style>
        </div>
    );
}

export default Layout;
