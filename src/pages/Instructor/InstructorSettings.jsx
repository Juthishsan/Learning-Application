
import { useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Lock, Bell, Moon, Shield, Save } from 'lucide-react';
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
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Settings</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Security preferences and notification controls</p>
                </header>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Settings Navigation */}
                    <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { id: 'security', label: 'Security & Login', icon: <Shield size={18} /> },
                            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                            { id: 'appearance', label: 'Appearance', icon: <Moon size={18} /> },
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    padding: '1rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    background: activeTab === tab.id ? 'white' : 'transparent', 
                                    color: activeTab === tab.id ? '#4f46e5' : '#64748b', 
                                    borderRadius: '12px', 
                                    fontWeight: 600, 
                                    cursor: 'pointer', 
                                    border: activeTab === tab.id ? '1px solid #e2e8f0' : 'none',
                                    boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        
                        {activeTab === 'security' && (
                            <motionWrapper>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Change Password</h3>
                                <form onSubmit={handleSavePassword} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>Current Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={iconStyle} />
                                            <input type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} style={inputStyle} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={iconStyle} />
                                            <input type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} style={inputStyle} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={iconStyle} />
                                            <input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} style={inputStyle} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <button type="submit" style={buttonStyle}>Update Password</button>
                                </form>
                            </motionWrapper>
                        )}

                        {activeTab === 'notifications' && (
                            <motionWrapper>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Notification Preferences</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {['Email', 'Push', 'SMS'].map((type) => (
                                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div>
                                                <h4 style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{type} Notifications</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Receive updates via {type.toLowerCase()}.</p>
                                            </div>
                                            <div 
                                                onClick={() => toggleNotification(type.toLowerCase())}
                                                style={{ 
                                                    width: '48px', 
                                                    height: '24px', 
                                                    background: notifications[type.toLowerCase()] ? '#4f46e5' : '#cbd5e1', 
                                                    borderRadius: '999px', 
                                                    position: 'relative', 
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    background: 'white', 
                                                    borderRadius: '50%', 
                                                    position: 'absolute', 
                                                    top: '2px', 
                                                    left: notifications[type.toLowerCase()] ? '26px' : '2px', 
                                                    transition: 'left 0.2s' 
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motionWrapper>
                        )}

                        {activeTab === 'appearance' && (
                            <motionWrapper>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Theme Settings</h3>
                                <p style={{ color: '#64748b' }}>Dark mode is automatically enabled based on system preferences for the Instructor Portal to reduce eye strain.</p>
                            </motionWrapper>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const motionWrapper = ({ children }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        {children}
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
);

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', color: '#1e293b' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const buttonStyle = { background: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' };

export default InstructorSettings;
