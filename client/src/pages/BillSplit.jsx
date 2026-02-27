/**
 * Bill Split Page (Phase 3 - Stub)
 * Will be implemented when Phase 3 is activated
 */
import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUserGroup } from 'react-icons/hi';

function BillSplit() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Split Bills</h1>
                    <p className="page-subtitle">Split expenses with your roommates</p>
                </div>
            </div>

            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <HiOutlineUserGroup />
                    </div>
                    <h3>Coming in Phase 3</h3>
                    <p>
                        Bill splitting with roommates, equal/custom splits, settlement tracking,
                        and payment reminders — all coming soon!
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

export default BillSplit;
