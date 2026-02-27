/**
 * App Component
 * Main routing setup with Layout wrapper
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import BillSplit from './pages/BillSplit';
import SavingsGoals from './pages/SavingsGoals';

function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: 'toast-custom',
                    style: {
                        background: 'rgba(10, 12, 22, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '0.9rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    },
                }}
            />
            <InstallPrompt />
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/bills" element={<BillSplit />} />
                    <Route path="/goals" element={<SavingsGoals />} />
                </Routes>
            </Layout>
        </>
    );
}

export default App;
