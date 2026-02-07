import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Delete", 
    cancelText = "Cancel",
    isDestructive = true
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="card" 
                    style={{ width: '400px', padding: '0', borderRadius: '16px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isDestructive ? '#fee2e2' : '#e0e7ff', color: isDestructive ? '#ef4444' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <AlertTriangle size={24} />
                        </div>
                        
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{title}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>{message}</p>
                    </div>

                    <div style={{ padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', borderRadius: '0 0 16px 16px' }}>
                        <button 
                            onClick={onClose} 
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} 
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={() => { onConfirm(); onClose(); }} 
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: isDestructive ? '#ef4444' : '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            onMouseOver={e => e.currentTarget.style.filter = 'brightness(110%)'} 
                            onMouseOut={e => e.currentTarget.style.filter = 'brightness(100%)'}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
