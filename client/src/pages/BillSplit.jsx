import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUsers, HiOutlinePlus, HiOutlineCheck, HiOutlineReceiptTax, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

function BillSplit() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Modal Form State
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [splitType, setSplitType] = useState('equal');
    const [participants, setParticipants] = useState([{ name: 'Me', amountOwed: 0, isPaid: true }, { name: '', amountOwed: 0, isPaid: false }]);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bills');
            setBills(res.data.data);
        } catch (error) {
            toast.error('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    const calculateCustomSplits = () => {
        if (!totalAmount) return;

        // Auto-calculate split amounts based on equal distribution
        if (splitType === 'equal') {
            const activeParticipants = participants.filter(p => p.name.trim() !== '');
            if (activeParticipants.length === 0) return;

            const splitAmt = (parseFloat(totalAmount) / activeParticipants.length).toFixed(2);

            const updatedParticipants = participants.map(p => {
                if (p.name.trim() === '') return p;
                return { ...p, amountOwed: parseFloat(splitAmt) };
            });
            setParticipants(updatedParticipants);
        }
    };

    useEffect(() => {
        calculateCustomSplits();
    }, [totalAmount, splitType, participants.length]);

    const addParticipant = () => {
        setParticipants([...participants, { name: '', amountOwed: 0, isPaid: false }]);
    };

    const updateParticipant = (index, field, value) => {
        const updated = [...participants];
        updated[index][field] = value;
        setParticipants(updated);
    };

    const removeParticipant = (index) => {
        if (index === 0) return; // Cannot remove "Me"
        const updated = participants.filter((_, i) => i !== index);
        setParticipants(updated);
    };

    const handleCreateBill = async (e) => {
        e.preventDefault();

        // Validate custom splits
        const validParticipants = participants.filter(p => p.name.trim() !== '');
        if (validParticipants.length < 2) {
            toast.error('Need at least 2 participants');
            return;
        }

        if (splitType === 'custom') {
            const sum = validParticipants.reduce((acc, curr) => acc + parseFloat(curr.amountOwed || 0), 0);
            if (Math.abs(sum - parseFloat(totalAmount)) > 0.1) {
                toast.error(`Custom amounts must equal total (${sum} != ${totalAmount})`);
                return;
            }
        }

        try {
            const payload = {
                description,
                totalAmount: parseFloat(totalAmount),
                splitType,
                participants: validParticipants
            };

            const res = await api.post('/bills', payload);
            setBills([res.data.data, ...bills]);
            toast.success('Bill split created successfully');
            setShowModal(false);
            resetForm();
        } catch (error) {
            const msg = error.response?.data?.error;
            toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create bill');
        }
    };

    const resetForm = () => {
        setDescription('');
        setTotalAmount('');
        setSplitType('equal');
        setParticipants([{ name: 'Me', amountOwed: 0, isPaid: true }, { name: '', amountOwed: 0, isPaid: false }]);
    };

    const handleSettleParticipant = async (billId, participantName) => {
        try {
            const res = await api.post(`/bills/${billId}/settle`, { participantName });

            // Update local state
            setBills(bills.map(b => b._id === billId ? res.data.data : b));
            toast.success(`${participantName}'s share marked as settled`);
        } catch (error) {
            toast.error('Failed to settle share');
        }
    };

    const handleDeleteBill = async (billId) => {
        if (!window.confirm('Delete this bill split?')) return;
        try {
            await api.delete(`/bills/${billId}`);
            setBills(bills.filter(b => b._id !== billId));
            toast.success('Bill deleted');
        } catch (error) {
            toast.error('Failed to delete bill');
        }
    };

    return (
        <div className="page-container" style={{ padding: '0 20px 100px 20px' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '4px' }}>Bill Split</h1>
                    <p className="page-subtitle" style={{ letterSpacing: '0.2px' }}>Split expenses fairly with roommates and friends</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <HiOutlinePlus size={18} />
                    Create New Split
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading splits...
                </div>
            ) : bills.length === 0 ? (
                <div className="glass-card empty-state" style={{ padding: '48px 24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '50%', marginBottom: '16px' }}>
                        <HiOutlineUsers className="empty-state-icon" style={{ color: 'var(--primary-400)', fontSize: '48px', margin: 0 }} />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Active Splits</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>Create a group expense to start splitting bills with your friends securely.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <HiOutlinePlus size={18} /> Split a Bill Now
                    </button>
                </div>
            ) : (
                <div className="grid-2" style={{ gap: '24px' }}>
                    {bills.map(bill => (
                        <motion.div
                            key={bill._id}
                            className="glass-card-static"
                            style={{ padding: '24px' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                                        {bill.description}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            backgroundColor: bill.status === 'settled' ? 'rgba(46, 213, 115, 0.15)' :
                                                bill.status === 'partially' ? 'rgba(255, 165, 2, 0.15)' : 'rgba(255, 71, 87, 0.15)',
                                            color: bill.status === 'settled' ? 'var(--success-400)' :
                                                bill.status === 'partially' ? '#ffa502' : 'var(--accent-400)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-300)' }}>
                                            ₹{bill.totalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBill(bill._id)}
                                        className="btn-icon"
                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-400)', width: '36px', height: '36px' }}
                                        title="Delete Bill"
                                    >
                                        <HiOutlineTrash size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineUsers /> Participants ({bill.participants.length})
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {bill.participants.map((p, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            background: p.isPaid ? 'rgba(46, 213, 115, 0.05)' : 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            border: p.isPaid ? '1px solid rgba(46, 213, 115, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: p.name === 'Me' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.9rem', fontWeight: 700, color: 'white',
                                                }}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                                                    <p style={{ fontSize: '0.8rem', color: p.isPaid ? 'var(--success-400)' : 'var(--accent-400)', fontWeight: 500, marginTop: '2px' }}>
                                                        {p.isPaid ? 'Settled' : 'Owes'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                                    ₹{p.amountOwed.toFixed(2)}
                                                </span>

                                                {!p.isPaid && (
                                                    <button
                                                        className="btn btn-icon"
                                                        style={{ width: 36, height: 36, borderColor: 'rgba(46, 213, 115, 0.3)', color: 'var(--success-400)', background: 'rgba(46, 213, 115, 0.05)' }}
                                                        onClick={() => handleSettleParticipant(bill._id, p.name)}
                                                        title="Mark as Paid"
                                                    >
                                                        <HiOutlineCheck size={18} />
                                                    </button>
                                                )}
                                                {p.isPaid && (
                                                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-400)', background: 'rgba(46, 213, 115, 0.1)', borderRadius: '50%' }}>
                                                        <HiOutlineCheck size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Bill Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Split New Expense</h2>
                                <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                                    <HiOutlineX />
                                </button>
                            </div>

                            <form onSubmit={handleCreateBill}>
                                <div className="form-group">
                                    <label className="form-label">Expense Description</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Weekend Pizza, Internet Bill"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Total Amount</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                className="form-input"
                                                style={{ paddingLeft: 32 }}
                                                value={totalAmount}
                                                onChange={(e) => setTotalAmount(e.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Split Type</label>
                                        <select
                                            className="form-select"
                                            value={splitType}
                                            onChange={(e) => setSplitType(e.target.value)}
                                        >
                                            <option value="equal">Split Equally</option>
                                            <option value="custom">Custom Amounts</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label className="form-label">Participants</label>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {participants.map((p, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={p.name}
                                                    onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                                                    placeholder="Name"
                                                    disabled={idx === 0}
                                                    required
                                                    style={{ flex: 1, background: idx === 0 ? 'var(--bg-glass)' : undefined, opacity: idx === 0 ? 0.7 : 1 }}
                                                />

                                                <div style={{ position: 'relative', width: '120px' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>$</span>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ paddingLeft: 24 }}
                                                        value={p.amountOwed === 0 ? '' : p.amountOwed}
                                                        onChange={(e) => updateParticipant(idx, 'amountOwed', e.target.value)}
                                                        disabled={splitType === 'equal'}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>

                                                {idx > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-icon"
                                                        style={{ height: 44, width: 44 }}
                                                        onClick={() => removeParticipant(idx)}
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                )}
                                                {idx === 0 && (
                                                    <div style={{ width: 44 }} /> // Spacer for alignment
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addParticipant}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: 'transparent', border: 'none', color: 'var(--primary-400)',
                                            fontSize: '0.85rem', fontWeight: 600, marginTop: '12px', cursor: 'pointer'
                                        }}
                                    >
                                        <HiOutlinePlus size={16} /> Add Friend
                                    </button>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                                    <HiOutlineReceiptTax size={18} />
                                    Split Bill
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BillSplit;
