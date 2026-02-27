/**
 * Layout Component
 * App shell with glassmorphic sidebar and mobile bottom navigation
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
    HiOutlineX,
    HiOutlineMoon,
    HiOutlineSun
} from 'react-icons/hi';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/transactions', label: 'Transactions', icon: HiOutlineCreditCard },
    { path: '/budget', label: 'Budget', icon: HiOutlineChartPie },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { path: '/bills', label: 'Split Bills', icon: HiOutlineUserGroup },
    { path: '/goals', label: 'Goals', icon: HiOutlineStar },
];

function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Dark Mode State
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark'; // default to dark
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 99,
                            display: 'none',
                        }}
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

                <div className="sidebar-footer">
                    <div className="sidebar-footer-card">
                        <p>🎓 Made for students</p>
                        <span className="version">v1.0.0 • Phase 2</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Top Navbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Welcome back, Student 👋</p>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '4px' }}>Overview</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            className="btn-icon"
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
                        </button>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'white', boxShadow: 'var(--shadow-glow)', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}>
                            S
                        </div>
                    </div>
                </div>
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Mobile Bottom Navigation */}
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
