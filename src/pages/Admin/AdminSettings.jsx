
import { useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Moon, Sun, Monitor, Save, Shield, Eye, EyeOff, Mail, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('security');
    
    const user = JSON.parse(localStorage.getItem('user'));

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('admin_notifications');
        return saved ? JSON.parse(saved) : { newuser: true, purchase: true, updates: false };
    });

    const [theme, setTheme] = useState(() => localStorage.getItem('admin_theme') || 'light');

    const updateNotifications = (newSettings) => {
        setNotifications(newSettings);
        localStorage.setItem('admin_notifications', JSON.stringify(newSettings));
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('admin_theme', newTheme);
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (!user || !user.id) {
            toast.error('User not authenticated');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: securityData.currentPassword,
                    newPassword: securityData.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.msg || 'Failed to update password');
                return;
            }

            toast.success('Password changed successfully');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        }
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem' }}
                >
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>Settings</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '1.1rem' }}>Manage your account and platform preferences</p>
                </motion.div>

                {/* Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        marginBottom: '2.5rem', 
                        background: 'white', 
                        padding: '0.5rem', 
                        borderRadius: '16px', 
                        width: 'fit-content', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.02)',
                        border: '1px solid #f1f5f9'
                    }}
                >
                    {[
                        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                        { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.85rem 1.5rem',
                                borderRadius: '12px',
                                background: activeTab === tab.id ? '#0f172a' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                <div style={{ maxWidth: '850px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'security' && (
                                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Account Security</h3>
                                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Update your password and secure your administrative account.</p>
                                        </div>
                                        <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '14px', color: '#ea580c' }}><Shield size={24} /></div>
                                    </div>
                                    
                                    <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <label style={labelStyle}>Current Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={iconStyle} />
                                                <input 
                                                    type={showPassword.current ? "text" : "password"} 
                                                    name="currentPassword"
                                                    value={securityData.currentPassword} 
                                                    onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} 
                                                    style={inputStyle}
                                                    placeholder="Enter current password"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                    style={eyeButtonStyle}
                                                >
                                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <label style={labelStyle}>New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={iconStyle} />
                                                    <input 
                                                        type={showPassword.new ? "text" : "password"} 
                                                        name="newPassword"
                                                        value={securityData.newPassword} 
                                                        onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} 
                                                        style={inputStyle}
                                                        placeholder="New password"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                        style={eyeButtonStyle}
                                                    >
                                                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <label style={labelStyle}>Confirm New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={iconStyle} />
                                                    <input 
                                                        type={showPassword.confirm ? "text" : "password"} 
                                                        name="confirmPassword"
                                                        value={securityData.confirmPassword} 
                                                        onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} 
                                                        style={inputStyle}
                                                        placeholder="Confirm password"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                        style={eyeButtonStyle}
                                                    >
                                                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                                            <motion.button 
                                                whileHover={{ scale: 1.02, translateY: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit" 
                                                style={buttonStyle}
                                            >
                                                <Save size={18} /> Save Password
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>System Notifications</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Control which events trigger administrative alerts.</p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {[
                                            { id: 'newuser', title: 'New User Signups', desc: 'Get notified when a new student or instructor registers.', icon: <User size={20} />, bg: '#eff6ff', color: '#3b82f6' },
                                            { id: 'purchase', title: 'Course Purchases', desc: 'Real-time alerts for every successful transaction.', icon: <Globe size={20} />, bg: '#ecfdf5', color: '#10b981' },
                                            { id: 'updates', title: 'System Updates', desc: 'Critical maintenance and platform update notifications.', icon: <Bell size={20} />, bg: '#fef2f2', color: '#ef4444' }
                                        ].map(item => (
                                            <motion.div 
                                                key={item.id} 
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
                                                    <div style={{ padding: '10px', background: item.bg, borderRadius: '12px', color: item.color }}>{item.icon}</div>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.2rem' }}>{item.title}</h4>
                                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => updateNotifications({...notifications, [item.id]: !notifications[item.id]})}
                                                    style={{ 
                                                        width: '52px', 
                                                        height: '28px', 
                                                        background: notifications[item.id] ? '#0f172a' : '#e2e8f0', 
                                                        borderRadius: '999px', 
                                                        position: 'relative', 
                                                        transition: 'all 0.3s', 
                                                        border: 'none', 
                                                        cursor: 'pointer' 
                                                    }}
                                                >
                                                    <motion.div 
                                                        animate={{ x: notifications[item.id] ? 26 : 2 }}
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
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Platform Appearance</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Customize the administrative interface to your liking.</p>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                        {[
                                            { id: 'light', name: 'Light Mode', icon: <Sun size={28} />, active: theme === 'light' },
                                            { id: 'dark', name: 'Dark Mode', icon: <Moon size={28} />, active: theme === 'dark' },
                                            { id: 'system', name: 'System', icon: <Monitor size={28} />, active: theme === 'system' }
                                        ].map(themeItem => (
                                            <motion.div 
                                                key={themeItem.id}
                                                whileHover={{ y: -5 }}
                                                style={{ 
                                                    border: themeItem.active ? '2px solid #0f172a' : '1px solid #e2e8f0', 
                                                    borderRadius: '20px', 
                                                    padding: '2rem', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'center', 
                                                    gap: '1.25rem', 
                                                    cursor: 'pointer',
                                                    background: themeItem.active ? '#f8fafc' : 'white',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onClick={() => updateTheme(themeItem.id)}
                                            >
                                                <div style={{ 
                                                    width: '56px', 
                                                    height: '56px', 
                                                    background: themeItem.active ? '#0f172a' : '#f8fafc', 
                                                    borderRadius: '16px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: themeItem.active ? 'white' : '#94a3b8',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    {themeItem.icon}
                                                </div>
                                                <span style={{ fontWeight: 700, color: themeItem.active ? '#0f172a' : '#64748b', fontSize: '1rem' }}>{themeItem.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

const labelStyle = { fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { 
    width: '100%', 
    padding: '1rem 1rem 1rem 3.5rem', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0', 
    outline: 'none', 
    fontSize: '1rem', 
    color: '#0f172a', 
    background: '#f8fafc',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit'
};
const iconStyle = { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const eyeButtonStyle = { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' };
const buttonStyle = { 
    background: '#0f172a', 
    color: 'white', 
    border: 'none', 
    padding: '1.1rem 2.5rem', 
    borderRadius: '16px', 
    fontWeight: 700, 
    cursor: 'pointer', 
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)',
    transition: 'all 0.3s'
};

export default AdminSettings;
