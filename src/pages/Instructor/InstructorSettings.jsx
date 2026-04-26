
import { useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Lock, Bell, Moon, Shield, Save, Mail, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const InstructorSettings = () => {
    const [activeTab, setActiveTab] = useState('security');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false
    });

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error("New passwords don't match");
            return;
        }
        // Call API here
        toast.success("Password updated successfully");
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const toggleNotification = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${!notifications[key] ? 'enabled' : 'disabled'}`);
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem' }}
                >
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Settings</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '1.1rem' }}>Security preferences and notification controls</p>
                </motion.header>

                <div style={{ display: 'flex', gap: '3rem' }}>
                    {/* Settings Navigation */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    >
                        {[
                            { id: 'security', label: 'Security & Login', icon: <Shield size={18} /> },
                            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                            { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> },
                        ].map((tab) => (
                            <motion.button 
                                key={tab.id}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    padding: '1.1rem 1.25rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem', 
                                    background: activeTab === tab.id ? 'white' : 'transparent', 
                                    color: activeTab === tab.id ? '#4f46e5' : '#64748b', 
                                    borderRadius: '16px', 
                                    fontWeight: 700, 
                                    cursor: 'pointer', 
                                    border: 'none',
                                    boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ 
                                    padding: '8px', 
                                    background: activeTab === tab.id ? '#eef2ff' : 'transparent', 
                                    borderRadius: '10px',
                                    color: activeTab === tab.id ? '#4f46e5' : '#94a3b8',
                                    transition: 'all 0.3s'
                                }}>
                                    {tab.icon}
                                </div>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Content Area */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ flex: 1, background: 'white', borderRadius: '24px', padding: '3rem', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}><Lock size={20} /></div>
                                        Security Settings
                                    </h3>
                                    <form onSubmit={handleSavePassword} style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <label style={labelStyle}>Current Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={iconStyle} />
                                                    <input 
                                                        type="password" 
                                                        name="current" 
                                                        value={passwordData.current} 
                                                        onChange={handlePasswordChange} 
                                                        style={inputStyle} 
                                                        placeholder="Enter current password" 
                                                        onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <label style={labelStyle}>New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={iconStyle} />
                                                    <input 
                                                        type="password" 
                                                        name="new" 
                                                        value={passwordData.new} 
                                                        onChange={handlePasswordChange} 
                                                        style={inputStyle} 
                                                        placeholder="Create a strong password" 
                                                        onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <label style={labelStyle}>Confirm New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={iconStyle} />
                                                    <input 
                                                        type="password" 
                                                        name="confirm" 
                                                        value={passwordData.confirm} 
                                                        onChange={handlePasswordChange} 
                                                        style={inputStyle} 
                                                        placeholder="Repeat new password" 
                                                        onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.02, translateY: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit" 
                                            style={buttonStyle}
                                        >
                                            <Save size={18} /> Update Password
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'notifications' && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '12px', color: '#d97706' }}><Bell size={20} /></div>
                                        Notification Preferences
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {[
                                            { id: 'email', label: 'Email Notifications', icon: <Mail size={20} />, desc: 'Receive student questions and course updates.' },
                                            { id: 'push', label: 'Push Notifications', icon: <Bell size={20} />, desc: 'Receive real-time alerts in your browser.' },
                                            { id: 'sms', label: 'SMS Notifications', icon: <Smartphone size={20} />, desc: 'Receive security alerts via text message.' }
                                        ].map((item) => (
                                            <motion.div 
                                                key={item.id} 
                                                layout
                                                style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center', 
                                                    padding: '1.5rem', 
                                                    background: '#f8fafc', 
                                                    borderRadius: '20px',
                                                    border: '1px solid #f1f5f9'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    <div style={{ padding: '10px', background: 'white', borderRadius: '12px', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{item.icon}</div>
                                                    <div>
                                                        <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{item.label}</h4>
                                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.1rem' }}>{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div 
                                                    onClick={() => toggleNotification(item.id)}
                                                    style={{ 
                                                        width: '52px', 
                                                        height: '28px', 
                                                        background: notifications[item.id] ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#e2e8f0', 
                                                        borderRadius: '999px', 
                                                        position: 'relative', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: notifications[item.id] ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                                                    }}
                                                >
                                                    <motion.div 
                                                        animate={{ x: notifications[item.id] ? 26 : 2 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                        style={{ 
                                                            width: '24px', 
                                                            height: '24px', 
                                                            background: 'white', 
                                                            borderRadius: '50%', 
                                                            position: 'absolute', 
                                                            top: '2px',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }} 
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'appearance' && (
                                <motion.div
                                    key="appearance"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: '12px', color: '#7c3aed' }}><Moon size={20} /></div>
                                        Appearance Settings
                                    </h3>
                                    <div style={{ padding: '2.5rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        <div style={{ width: '64px', height: '64px', background: '#eef2ff', borderRadius: '20px', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                            <Monitor size={32} />
                                        </div>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Automatic Theme</h4>
                                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                                            Dark mode is automatically enabled based on your system preferences to reduce eye strain during long teaching sessions.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

const labelStyle = { fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { 
    width: '100%', 
    padding: '0.85rem 1rem 0.85rem 3rem', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0', 
    outline: 'none', 
    fontSize: '0.95rem', 
    color: '#0f172a', 
    background: '#f8fafc',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit'
};
const iconStyle = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const buttonStyle = { 
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
    color: 'white', 
    border: 'none', 
    padding: '1rem 2.5rem', 
    borderRadius: '16px', 
    fontWeight: 700, 
    cursor: 'pointer', 
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.3s'
};

export default InstructorSettings;
