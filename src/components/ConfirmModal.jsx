import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Delete", 
    cancelText = "Cancel",
    isDestructive = true,
    icon: Icon = AlertTriangle
}) => {
    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ 
                            background: 'white', 
                            padding: '2rem', 
                            borderRadius: '24px', 
                            maxWidth: '420px', 
                            width: '90%', 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                            border: '1px solid rgba(255,255,255,0.5)' 
                        }}
                    >
                        <div style={{ 
                            width: '64px', height: '64px', 
                            background: isDestructive ? '#fee2e2' : '#e0e7ff', 
                            borderRadius: '20px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            margin: '0 auto 1.5rem', 
                            color: isDestructive ? '#ef4444' : '#4f46e5' 
                        }}>
                            <Icon size={32} strokeWidth={2.5} />
                        </div>
                        
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{title}</h3>
                            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>{message}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button 
                                onClick={onClose}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '14px', 
                                    background: '#f1f5f9', 
                                    color: '#475569', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => e.target.style.background = '#e2e8f0'}
                                onMouseOut={e => e.target.style.background = '#f1f5f9'}
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={() => { onConfirm(); onClose(); }}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '14px', 
                                    background: isDestructive ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                                    color: 'white', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: isDestructive ? '0 4px 12px -2px rgba(239, 68, 68, 0.3)' : '0 4px 12px -2px rgba(79, 70, 229, 0.3)'
                                }}
                                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmModal;
