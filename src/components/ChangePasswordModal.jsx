import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, Save, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({ isOpen, onClose, userId }) => {
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        
        if (formData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Password updated successfully');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
                onClose();
            } else {
                toast.error(data.msg || 'Failed to update password');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card"
                style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}><Key size={20} /></div>
                        Change Password
                    </h2>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Current Password */}
                        <div>
                            <label style={labelStyle}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showCurrent ? "text" : "password"} 
                                    name="currentPassword" 
                                    value={formData.currentPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="Enter current password"
                                    required 
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={toggleStyle}>
                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showNew ? "text" : "password"} 
                                    name="newPassword" 
                                    value={formData.newPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="Enter new password"
                                    required 
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} style={toggleStyle}>
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showConfirm ? "text" : "password"} 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="Confirm new password"
                                    required 
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={toggleStyle}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569' }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {loading ? 'Updating...' : <>Update Password <Save size={18} /></>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// Styles
const labelStyle = {
    display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '10px', 
    border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem',
    transition: 'border-color 0.2s', background: '#f8fafc'
};

const toggleStyle = {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0
};

export default ChangePasswordModal;
