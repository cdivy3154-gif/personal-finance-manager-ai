/**
 * Layout Component
 * App shell with glassmorphic sidebar and mobile bottom navigation
 */
import React, { useState } from 'react';
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
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/transactions', label: 'Transactions', icon: HiOutlineCreditCard },
    { path: '/budget', label: 'Budget', icon: HiOutlineChartPie },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { path: '/bills', label: 'Split Bills', icon: HiOutlineUserGroup },
    { path: '/goals', label: 'Goals', icon: HiOutlineStar },
];

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="app-layout">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-toggle btn-icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 150,
                    display: 'none',
                }}
            >
                {sidebarOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
            </button>

            {/* Sidebar Overlay for mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
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
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                            onClick={() => setSidebarOpen(false)}
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
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
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
