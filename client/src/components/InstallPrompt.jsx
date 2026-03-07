/**
 * PWA Install Prompt Component
 * Shows a banner when the app can be installed
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDownload, HiOutlineX } from 'react-icons/hi';

function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent browser's default install prompt
            e.preventDefault();
            setDeferredPrompt(e);

            // Only show if user hasn't dismissed recently
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
                setShowBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            setShowBanner(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                        position: 'fixed',
                        bottom: 80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 300,
                        background: 'linear-gradient(135deg, rgba(108,47,255,0.95), rgba(168,85,247,0.95))',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        maxWidth: '420px',
                        width: 'calc(100% - 32px)',
                        boxShadow: '0 8px 32px rgba(108,47,255,0.4)',
                    }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', flexShrink: 0
                    }}>
                        <HiOutlineDownload />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>
                            Install Money Mate
                        </p>
                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            Add to home screen for quick access
                        </p>
                    </div>
                    <button
                        onClick={handleInstall}
                        style={{
                            padding: '8px 16px',
                            background: 'white',
                            color: '#6c2fff',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 28, height: 28,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', cursor: 'pointer', flexShrink: 0
                        }}
                    >
                        <HiOutlineX size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default InstallPrompt;
