import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { User, Mail, MapPin, Phone, Shield, Clock, Calendar, Edit2, Save, X, Activity, Server, Database, Lock, CheckCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ModalField = ({ label, icon: Icon, name, placeholder, type = "text", value, onChange }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Icon size={18} />
            </div>
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ 
                    width: '100%', 
                    padding: '0.85rem 1rem 0.85rem 3rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    background: '#f8fafc', 
                    color: '#1e293b', 
                    fontSize: '0.95rem', 
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#ea580c'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
            />
        </div>
    </div>
);

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState({
        managedCourses: 0,
        monitoredUsers: 0
    });

    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        bio: '',
        name: '' 
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFormData({
                phone: parsedUser.phone || '',
                location: parsedUser.location || '',
                bio: parsedUser.bio || '',
                name: parsedUser.name || ''
            });
            fetchAdminStats(parsedUser);
            fetchUserProfile(parsedUser.id || parsedUser._id);
        }
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`);
            if (res.ok) {
                const freshUser = await res.json();
                if (freshUser._id && !freshUser.id) freshUser.id = freshUser._id;

                setUser(freshUser);
                setFormData({
                    phone: freshUser.phone || '',
                    location: freshUser.location || '',
                    bio: freshUser.bio || '',
                    name: freshUser.name || ''
                });
                
                localStorage.setItem('user', JSON.stringify(freshUser));
            }
        } catch (err) {
            console.error("Failed to fetch fresh user profile", err);
        }
    };

    const fetchAdminStats = async () => {
        try {
            // Fetch total stats for admin view
            const [coursesRes, usersRes] = await Promise.all([
                fetch('http://localhost:5000/api/courses'),
                fetch('http://localhost:5000/api/users')
            ]);
            
            const courses = await coursesRes.json();
            const users = await usersRes.json();

            setStats({
                managedCourses: courses.length || 0,
                monitoredUsers: users.length || 0
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                name: formData.name
            };

            const userId = user.id || user._id;
            const res = await fetch(`http://localhost:5000/api/users/${userId}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const updatedUserResponse = await res.json();
            
            const newUserState = {
                ...user,
                ...updatedData,
                phone: updatedUserResponse.phone,
                location: updatedUserResponse.location,
                bio: updatedUserResponse.bio,
            };

            localStorage.setItem('user', JSON.stringify(newUserState));
            setUser(newUserState);
            setIsEditing(false);
            toast.success('Admin profile updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        }
    };

    if (!user) return null;

    return (
        <div style={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
                
                {/* Header Banner */}
                <div style={{ 
                    height: '240px', 
                    background: '#0f172a', 
                    position: 'relative', 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 0%, rgba(234, 88, 12, 0.15) 0%, transparent 25%), radial-gradient(circle at 0% 100%, rgba(30, 41, 59, 1) 0%, transparent 50%)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '-100px auto 0', padding: '0 2rem 4rem', position: 'relative' }}>
                    
                    {/* Header Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ 
                                    width: '160px', height: '160px', 
                                    borderRadius: '20px', 
                                    background: 'white', 
                                    padding: '6px',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ 
                                    width: '100%', height: '100%', 
                                    borderRadius: '16px', 
                                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '3.5rem', fontWeight: 800,
                                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                            </motion.div>
                            <div style={{ paddingBottom: '1rem' }}>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ fontSize: '2.5rem', fontWeight: 800, color: user ? 'white' : '#0f172a', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                                >
                                    {user.name}
                                </motion.h1>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <span style={{ 
                                        background: '#ea580c', color: 'white', 
                                        padding: '0.35rem 1rem', borderRadius: '8px', 
                                        fontSize: '0.85rem', fontWeight: 700, 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                                    }}>
                                        <Shield size={14} fill="currentColor" /> SYSTEM ADMINISTRATOR
                                    </span>
                                    <span style={{ 
                                        background: 'rgba(255,255,255,0.1)', color: '#94a3b8', 
                                        padding: '0.35rem 1rem', borderRadius: '8px', 
                                        fontSize: '0.85rem', fontWeight: 600, 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <CheckCircle size={14} color="#10b981" /> Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ paddingBottom: '1rem' }}>
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{ 
                                    background: 'white', color: '#0f172a', 
                                    border: '1px solid #e2e8f0',
                                    padding: '0.75rem 1.5rem', borderRadius: '10px', 
                                    fontWeight: 600, fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        
                        {/* LEFT: Main Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            
                            {/* Contact Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}
                            >
                                <div style={{ padding: '1.25rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <User size={18} color="#64748b" />
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h3>
                                </div>
                                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>EMAIL ADDRESS</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: 500 }}>
                                            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Mail size={16} /></div>
                                            {user.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>PHONE NUMBER</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: 500 }}>
                                            <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}><Phone size={16} /></div>
                                            {user.phone || 'Not Provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>LOCATION</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: 500 }}>
                                            <div style={{ padding: '8px', background: '#fffbeb', borderRadius: '8px', color: '#f59e0b' }}><MapPin size={16} /></div>
                                            {user.location || 'Remote'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>JOINED DATE</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontSize: '1rem', fontWeight: 500 }}>
                                            <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280' }}><Calendar size={16} /></div>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* System Overview */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}
                            >
                                <div style={{ background: '#0f172a', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '5rem', color: 'rgba(255,255,255,0.05)' }}><Shield /></div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>ADMIN LEVEL</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Super Admin</div>
                                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={12} /> Full Access</div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ padding: '10px', background: '#fff7ed', borderRadius: '10px', color: '#ea580c' }}><Users size={20} /></div>
                                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.monitoredUsers}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Users Monitored</div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}><Server size={20} /></div>
                                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.managedCourses}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Courses Managed</div>
                                </div>
                            </motion.div>

                        </div>

                        {/* RIGHT: Activity & Status */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                           
                            {/* Security Status */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card"
                                style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}
                            >
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={18} color="#ea580c" /> System Status
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>System Health</span>
                                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, padding: '2px 8px', background: '#dcffe4', borderRadius: '6px' }}>99.9%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Database</span>
                                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700, padding: '2px 8px', background: '#eff6ff', borderRadius: '6px' }}>Connected</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Last Backup</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>2h ago</span>
                                    </div>
                                </div>
                            </motion.div>

                             {/* Bio / Log */}
                             <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card"
                                style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', flex: 1 }}
                            >
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Admin Notes
                                </h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#475569' }}>
                                    {user.bio || "No administrative notes available."}
                                </p>
                            </motion.div>

                        </div>
                    </div>
                </div>

                {/* EDIT MODAL */}
                <AnimatePresence>
                    {isEditing && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="card"
                                style={{ width: '90%', maxWidth: '550px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                            >
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Update Profile</h2>
                                    <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                                </div>

                                <div style={{ padding: '2rem' }}>
                                    <form id="profile-form" onSubmit={handleSave}>
                                        <ModalField label="Full Name" icon={User} name="name" placeholder="Admin Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        <ModalField label="Phone Number" icon={Phone} name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                        <ModalField label="Location" icon={MapPin} name="location" placeholder="City, Country" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                                        
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Administrative Notes / Bio</label>
                                            <textarea 
                                                value={formData.bio}
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                style={{ 
                                                    width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical'
                                                }}
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div style={{ padding: '1.25rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setIsEditing(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                    <button form="profile-form" type="submit" style={{ padding: '0.75rem 2rem', borderRadius: '10px', background: '#ea580c', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminProfile;
