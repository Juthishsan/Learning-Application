import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { User, Mail, MapPin, Phone, Briefcase, Calendar, Shield, Globe, Github, Linkedin, Twitter, Camera, Edit2, X, Save, CheckCircle, Award, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Derived state for profile completion
    const [completion, setCompletion] = useState(0);
    const [courseCount, setCourseCount] = useState(0);

    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        bio: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: ''
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
                website: parsedUser.socialLinks?.website || '',
                github: parsedUser.socialLinks?.github || '',
                linkedin: parsedUser.socialLinks?.linkedin || '',
                twitter: parsedUser.socialLinks?.twitter || ''
            });
            calculateCompletion(parsedUser);
            fetchCourseCount(parsedUser);
        }
    }, []);

    const fetchCourseCount = async (currentUser) => {
        try {
            const res = await fetch('http://localhost:5000/api/courses');
            const courses = await res.json();
            
            if (currentUser.role === 'instructor') {
                const myCourses = courses.filter(c => c.instructor === currentUser.name);
                setCourseCount(myCourses.length);
            } else {
                // Admin sees total courses
                setCourseCount(courses.length);
            }
        } catch (err) {
            console.error("Failed to fetch courses count", err);
        }
    };

    const calculateCompletion = (userData) => {
        const fields = ['name', 'email', 'phone', 'location', 'bio'];
        const socialFields = ['website', 'github', 'linkedin', 'twitter'];
        
        let filled = 0;
        let total = fields.length + 1; // +1 for at least one social link

        fields.forEach(field => {
            if (userData[field]) filled++;
        });

        const hasSocial = socialFields.some(field => userData.socialLinks?.[field]);
        if (hasSocial) filled++;

        setCompletion(Math.round((filled / total) * 100));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const updatedData = {
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                socialLinks: {
                    website: formData.website,
                    github: formData.github,
                    linkedin: formData.linkedin,
                    twitter: formData.twitter
                }
            };

            const res = await fetch(`http://localhost:5000/api/users/${user.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!res.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUserResponse = await res.json();
            
            // The backend returns the raw Mongoose document, which has _id, not id.
            // We need to map it back to the format our frontend expects (id instead of _id), 
            // OR ensure we mix it with existing user data correctly.
            // The auth response gave us { id, name, email, role, ... }. 
            // The users route gives us { _id, name, email, role, ... }.
            
            const newUserState = {
                ...user,
                ...updatedData, // Optimistic update or use response
                // If we want to be strict with the response:
                phone: updatedUserResponse.phone,
                location: updatedUserResponse.location,
                bio: updatedUserResponse.bio,
                socialLinks: updatedUserResponse.socialLinks
            };

            localStorage.setItem('user', JSON.stringify(newUserState));
            setUser(newUserState);
            calculateCompletion(newUserState);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        }
    };

    if (!user) return null;

    const ModalField = ({ label, icon: Icon, name, placeholder, type = "text" }) => (
        <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                    <Icon size={18} />
                </div>
                <input 
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={(e) => setFormData({...formData, [name]: e.target.value})}
                    placeholder={placeholder}
                    style={{ 
                        width: '100%', 
                        padding: '0.85rem 1rem 0.85rem 3rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0', 
                        outline: 'none', 
                        background: '#f8fafc', 
                        color: '#1e293b', 
                        fontSize: '0.95rem', 
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                />
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
                
                {/* Immersive Header */}
                <div style={{ height: '280px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Circles */}
                    <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }}></div>
                </div>

                <div style={{ padding: '0 3rem 4rem 3rem', maxWidth: '1280px', margin: '0 auto', position: 'relative', top: '-100px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 2.5fr', gap: '2.5rem' }}>
                        
                        {/* LEFT COLUMN: Sticky Profile Card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="card" 
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.8)', 
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '24px', 
                                    padding: '3rem 2rem', 
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset', 
                                    textAlign: 'center', 
                                    position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.4)'
                                }}
                            >
                                <div style={{ position: 'relative', margin: '0 auto 1.5rem auto', width: '140px', height: '140px' }}>
                                    <div style={{ 
                                        width: '100%', height: '100%', borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: '3rem', fontWeight: 800, color: '#4f46e5', 
                                        border: '6px solid white', 
                                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)' 
                                    }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <button style={{ 
                                        position: 'absolute', bottom: '5px', right: '5px', 
                                        background: '#0f172a', color: 'white', border: 'none', 
                                        borderRadius: '50%', width: '42px', height: '42px', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Camera size={18} />
                                    </button>
                                </div>
                                
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>{user.name}</h2>
                                <p style={{ color: '#64748b', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem 0.75rem', borderRadius: '20px', width: 'fit-content', margin: '0.5rem auto 0 auto' }}>
                                    {user.designation || user.role} 
                                    {user.role === 'admin' && <Shield size={16} fill="#4f46e5" color="#4f46e5" />}
                                </p>

                                {/* Stats Widget */}
                                <div style={{ margin: '2rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{courseCount}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Courses</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>4.9</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Rating</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    {[
                                        { icon: Github, link: user.socialLinks?.github, color: '#24292e' },
                                        { icon: Linkedin, link: user.socialLinks?.linkedin, color: '#0077b5' },
                                        { icon: Twitter, link: user.socialLinks?.twitter, color: '#1da1f2' },
                                        { icon: Globe, link: user.socialLinks?.website, color: '#fbbf24' }
                                    ].map((social, idx) => (
                                        <a 
                                            key={idx} 
                                            href={social.link || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ 
                                                width: '44px', height: '44px', borderRadius: '12px', 
                                                background: social.link ? 'white' : '#f1f5f9', 
                                                color: social.link ? social.color : '#cbd5e1',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                cursor: social.link ? 'pointer' : 'default',
                                                boxShadow: social.link ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                                border: '1px solid #f1f5f9'
                                            }}
                                            onMouseOver={e => social.link && (e.currentTarget.style.transform = 'translateY(-3px)')}
                                            onMouseOut={e => social.link && (e.currentTarget.style.transform = 'translateY(0)')}
                                        >
                                            <social.icon size={22} strokeWidth={2} />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.5 }}
                                className="card"
                                style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                            >
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '4px', height: '18px', background: '#e11d48', borderRadius: '2px' }}></div>
                                    Contact Information
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[
                                        { icon: Mail, label: 'Email Address', value: user.email, color: '#3b82f6', bg: '#eff6ff' },
                                        { icon: Phone, label: 'Phone Number', value: user.phone || 'Not provided', color: '#10b981', bg: '#ecfdf5' },
                                        { icon: MapPin, label: 'Location', value: user.location || 'Not provided', color: '#f59e0b', bg: '#fffbeb' },
                                        { icon: Calendar, label: 'Joined Date', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', color: '#6366f1', bg: '#eef2ff' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '10px', background: item.bg, borderRadius: '12px', color: item.color, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                                                <item.icon size={18} />
                                            </div>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1e293b', marginTop: '2px' }}>{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: Bio and Activity */}
                        <div style={{ paddingTop: '8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Overview</h1>
                                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back to your personal dashboard.</p>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                                        background: '#0f172a', color: 'white', border: 'none', 
                                        fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                                        transition: 'all 0.2s ease', fontSize: '0.95rem'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(15, 23, 42, 0.4)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.3)'; }}
                                >
                                    <Edit2 size={18} /> Edit Profile
                                </button>
                            </div>

                            {/* Profile Completion Bar - Enhanced */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', marginBottom: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '2rem' }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Setup Progress</h4>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5' }}>{completion}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completion}%` }}
                                            transition={{ duration: 1.2, ease: 'circOut' }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #ec4899)', borderRadius: '5px' }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '12px', color: '#15803d' }}>
                                    <CheckCircle size={24} />
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>
                                        {completion === 100 ? "Profile Complete!" : `${100 - completion}% to go!`}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card" 
                                style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}><Briefcase size={22} /></div>
                                    About {user.name.split(' ')[0]}
                                </h3>
                                <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                    {user.bio || (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                            No biography provided yet. <br/> <a href="#" onClick={(e) => { e.preventDefault(); setIsEditing(true); }} style={{ color: '#4f46e5', fontWeight: 600 }}>Add a bio</a> to introduce yourself.
                                        </span>
                                    )}
                                </p>
                            </motion.div>

                            {/* Additional Info / Skills could go here */}
                             <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}
                            >
                                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1.5rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><Award size={20} /></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Top 5%</span>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>8</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Certifications Earned</div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '1.5rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><Star size={20} /></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Elite</span>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>4.9/5</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Instructor Rating</div>
                                </div>
                                
                                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', padding: '1.5rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><Users size={20} /></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Growing</span>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{courseCount}</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Courses</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* EDIT PROFILE MODAL */}
                <AnimatePresence>
                    {isEditing && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="card"
                                style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', background: 'white', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.3)' }}
                            >
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Edit Profile</h2>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Update your personal information</p>
                                    </div>
                                    <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b';}} onMouseOut={e => {e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b';}}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                                    <form id="profile-form" onSubmit={handleSave}>
                                        <div style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <div style={{ width: '24px', height: '24px', background: '#eff6ff', borderRadius: '6px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} /></div>
                                                Personal Details
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <ModalField label="Phone Number" icon={Phone} name="phone" placeholder="+1 (555) 000-0000" />
                                                <ModalField label="Location" icon={MapPin} name="location" placeholder="San Francisco, CA" />
                                            </div>
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Short Biography</label>
                                                <textarea 
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                    placeholder="Tell us about your experience..."
                                                    style={{ 
                                                        width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                                                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                                />
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', textAlign: 'right' }}>Max 500 characters</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <div style={{ width: '24px', height: '24px', background: '#f5f3ff', borderRadius: '6px', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={14} /></div>
                                                Social Presence
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <ModalField label="Website" icon={Globe} name="website" placeholder="https://yourportfolio.com" />
                                                <ModalField label="GitHub" icon={Github} name="github" placeholder="github.com/username" />
                                                <ModalField label="LinkedIn" icon={Linkedin} name="linkedin" placeholder="linkedin.com/in/username" />
                                                <ModalField label="Twitter" icon={Twitter} name="twitter" placeholder="twitter.com/username" />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setIsEditing(false)} style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>Cancel</button>
                                    <button form="profile-form" type="submit" style={{ padding: '0.85rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(79, 70, 229, 0.4)'}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)'}}>
                                        <Save size={18} /> Save Details
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
