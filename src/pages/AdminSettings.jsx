import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Sun, Monitor, Save, Shield, Eye, EyeOff } from 'lucide-react';
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

    // Save preferences to local storage whenever they change
    const updateNotifications = (newSettings) => {
        setNotifications(newSettings);
        localStorage.setItem('admin_notifications', JSON.stringify(newSettings));
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('admin_theme', newTheme);
        // Here you could also apply the theme class to the document body if you had dark mode styles
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        background: '#f8fafc',
        fontSize: '0.9rem',
        color: '#1e293b',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '0.5rem'
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

    const TabButton = ({ id, label, icon }) => (
        <button 
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: activeTab === id ? '#4f46e5' : 'transparent',
                color: activeTab === id ? 'white' : '#64748b',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Settings</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage your account and platform preferences</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'white', padding: '0.5rem', borderRadius: '12px', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <TabButton id="security" label="Security" icon={<Shield size={18} />} />
                    <TabButton id="notifications" label="Notifications" icon={<Bell size={18} />} />
                    <TabButton id="appearance" label="Appearance" icon={<Monitor size={18} />} />
                </div>

                <div style={{ maxWidth: '800px' }}>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'security' && (
                            <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Change Password</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Ensure your account is using a long, random password to stay secure.</p>
                                
                                <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>Current Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input 
                                                type={showPassword.current ? "text" : "password"} 
                                                name="currentPassword"
                                                style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} 
                                                value={securityData.currentPassword} 
                                                onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                            >
                                                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={labelStyle}>New Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input 
                                                    type={showPassword.new ? "text" : "password"} 
                                                    name="newPassword"
                                                    style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} 
                                                    value={securityData.newPassword} 
                                                    onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                >
                                                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Confirm New Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input 
                                                    type={showPassword.confirm ? "text" : "password"} 
                                                    name="confirmPassword"
                                                    style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} 
                                                    value={securityData.confirmPassword} 
                                                    onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                >
                                                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn" style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Email Notifications</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[
                                        { id: 'newuser', title: 'New User Signups', desc: 'Get notified when a new student registers.' },
                                        { id: 'purchase', title: 'Course Purchases', desc: 'Get notified when a sale has been made.' },
                                        { id: 'updates', title: 'System Updates', desc: 'Get notified about platform updates and maintenance.' }
                                    ].map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{item.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => updateNotifications({...notifications, [item.id]: !notifications[item.id]})}
                                                style={{ 
                                                    width: '48px', 
                                                    height: '24px', 
                                                    background: notifications[item.id] ? '#4f46e5' : '#cbd5e1', 
                                                    borderRadius: '12px', 
                                                    position: 'relative', 
                                                    transition: 'background 0.2s', 
                                                    border: 'none', 
                                                    cursor: 'pointer' 
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    background: 'white', 
                                                    borderRadius: '50%', 
                                                    position: 'absolute', 
                                                    top: '2px', 
                                                    left: notifications[item.id] ? '26px' : '2px', 
                                                    transition: 'left 0.2s',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Platform Appearance</h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    {[
                                        { id: 'light', name: 'Light Mode', icon: <Sun size={24} />, active: theme === 'light' },
                                        { id: 'dark', name: 'Dark Mode', icon: <Moon size={24} />, active: theme === 'dark' },
                                        { id: 'system', name: 'System Default', icon: <Monitor size={24} />, active: theme === 'system' }
                                    ].map(themeItem => (
                                        <div 
                                            key={themeItem.id}
                                            style={{ 
                                                border: themeItem.active ? '2px solid #4f46e5' : '1px solid #e2e8f0', 
                                                borderRadius: '12px', 
                                                padding: '1.5rem', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'center', 
                                                gap: '1rem', 
                                                cursor: 'pointer',
                                                background: themeItem.active ? '#eef2ff' : 'white',
                                                transition: 'all 0.2s',
                                                opacity: themeItem.active ? 1 : 0.7
                                            }}
                                            onClick={() => updateTheme(themeItem.id)}
                                        >
                                            <div style={{ color: themeItem.active ? '#4f46e5' : '#64748b' }}>{themeItem.icon}</div>
                                            <span style={{ fontWeight: 600, color: themeItem.active ? '#4f46e5' : '#64748b' }}>{themeItem.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
