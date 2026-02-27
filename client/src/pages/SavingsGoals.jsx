/**
 * Savings Goals Page (Phase 4 - Stub)
 * Will be implemented when Phase 4 is activated
 */
import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar } from 'react-icons/hi';

function SavingsGoals() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Savings Goals</h1>
                    <p className="page-subtitle">Set and track your financial goals</p>
                </div>
            </div>

            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <HiOutlineStar />
                    </div>
                    <h3>Coming in Phase 4</h3>
                    <p>
                        Create savings goals, track progress with visual rings, get recommendations
                        to achieve your goals, and celebrate milestones!
                    </p>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        background: 'rgba(108,47,255,0.1)',
                        border: '1px solid rgba(108,47,255,0.2)',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        color: 'var(--primary-300)',
                        marginTop: 8
                    }}>
                        🚧 Under Development
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SavingsGoals;
