
import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { User, Mail, MapPin, Phone, Briefcase, Calendar, MessageSquare, Globe, Github, Linkedin, Twitter, Camera, Edit2, X, Save, CheckCircle, Award, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ModalField = ({ label, icon: Icon, name, placeholder, type = "text", value, onChange }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>
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
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    background: '#f8fafc', 
                    color: '#1e293b', 
                    fontSize: '0.95rem', 
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
            />
        </div>
    </div>
);

const InstructorProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [completion, setCompletion] = useState(0);
    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        rating: 4.8
    });

    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        bio: '',
        occupation: '',
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
                occupation: parsedUser.preferences?.occupation || '',
                website: parsedUser.socialLinks?.website || '',
                github: parsedUser.socialLinks?.github || '',
                linkedin: parsedUser.socialLinks?.linkedin || '',
                twitter: parsedUser.socialLinks?.twitter || ''
            });
            calculateCompletion(parsedUser);
            fetchInstructorStats(parsedUser);
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
                    occupation: freshUser.preferences?.occupation || '',
                    website: freshUser.socialLinks?.website || '',
                    github: freshUser.socialLinks?.github || '',
                    linkedin: freshUser.socialLinks?.linkedin || '',
                    twitter: freshUser.socialLinks?.twitter || ''
                });
                calculateCompletion(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            }
        } catch (err) {
            console.error("Failed to fetch fresh user profile", err);
        }
    };

    const fetchInstructorStats = async (currentUser) => {
        try {
            const res = await fetch('http://localhost:5000/api/courses');
            const courses = await res.json();
            const myCourses = courses.filter(c => c.instructor === currentUser.name || c.instructor === currentUser.username);
            const totalStudents = myCourses.reduce((acc, curr) => acc + (curr.students || 0), 0);
            const avgRating = myCourses.length > 0 
                ? (myCourses.reduce((acc, curr) => acc + (curr.rating || 0), 0) / myCourses.length).toFixed(1) 
                : 4.8;
            setStats({ courses: myCourses.length, students: totalStudents, rating: avgRating });
        } catch (err) {
            console.error("Failed to fetch instructor stats", err);
        }
    };

    const calculateCompletion = (userData) => {
        const fields = ['name', 'email', 'phone', 'location', 'bio'];
        const socialFields = ['website', 'github', 'linkedin', 'twitter'];
        let filled = 0;
        let total = fields.length + 1;
        fields.forEach(field => { if (userData[field]) filled++; });
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
                preferences: { ...user.preferences, occupation: formData.occupation },
                socialLinks: { website: formData.website, github: formData.github, linkedin: formData.linkedin, twitter: formData.twitter }
            };
            const userId = user.id || user._id;
            const res = await fetch(`http://localhost:5000/api/users/${userId}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updatedUserResponse = await res.json();
            const newUserState = { ...user, ...updatedData, phone: updatedUserResponse.phone, location: updatedUserResponse.location, bio: updatedUserResponse.bio, preferences: updatedUserResponse.preferences, socialLinks: updatedUserResponse.socialLinks };
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
                
                {/* Immersive Header */}
                <div style={{ height: '320px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        style={{ position: 'absolute', top: '-10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }}
                    ></motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        style={{ position: 'absolute', bottom: '-20%', left: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)' }}
                    ></motion.div>
                    
                    <div style={{ position: 'absolute', bottom: '120px', left: '3rem', color: 'white' }}>
                        <motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', textShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                        >
                            Instructor Space
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: '1.25rem', opacity: 0.9, fontWeight: 500 }}
                        >
                            Welcome back, {user.name.split(' ')[0]}! Ready to inspire today?
                        </motion.p>
                    </div>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ padding: '0 3rem 4rem 3rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', top: '-80px' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '3rem' }}>
                        
                        {/* LEFT COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <motion.div 
                                variants={itemVariants}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.9)', 
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '32px', 
                                    padding: '3.5rem 2.5rem', 
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset', 
                                    textAlign: 'center', 
                                    border: '1px solid rgba(255,255,255,0.4)'
                                }}
                            >
                                <div style={{ position: 'relative', margin: '0 auto 2rem auto', width: '160px', height: '160px' }}>
                                    <div style={{ 
                                        width: '100%', height: '100%', borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: '3.5rem', fontWeight: 900, color: '#4f46e5', 
                                        border: '8px solid white', 
                                        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.15)' 
                                    }}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            user.name?.charAt(0)
                                        )}
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{ 
                                            position: 'absolute', bottom: '8px', right: '8px', 
                                            background: '#0f172a', color: 'white', border: 'none', 
                                            borderRadius: '50%', width: '48px', height: '48px', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            cursor: 'pointer', boxShadow: '0 10px 15px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <Camera size={20} />
                                    </motion.button>
                                </div>
                                
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{user.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '24px', width: 'fit-content', margin: '0.5rem auto 0 auto', color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {user.preferences?.occupation || 'Expert Instructor'} 
                                    <CheckCircle size={16} fill="#15803d" color="white" />
                                </div>

                                <div style={{ margin: '2.5rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>{stats.courses}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courses</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>{stats.rating}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    {[
                                        { icon: Github, link: user.socialLinks?.github, color: '#24292e' },
                                        { icon: Linkedin, link: user.socialLinks?.linkedin, color: '#0077b5' },
                                        { icon: Twitter, link: user.socialLinks?.twitter, color: '#1da1f2' },
                                        { icon: Globe, link: user.socialLinks?.website, color: '#6366f1' }
                                    ].map((social, idx) => (
                                        <motion.a 
                                            key={idx} 
                                            whileHover={social.link ? { y: -5, scale: 1.05 } : {}}
                                            href={social.link || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ 
                                                width: '52px', height: '52px', borderRadius: '16px', 
                                                background: social.link ? 'white' : '#f8fafc', 
                                                color: social.link ? social.color : '#cbd5e1',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: social.link ? 'pointer' : 'default',
                                                boxShadow: social.link ? '0 10px 15px rgba(0,0,0,0.05)' : 'none',
                                                border: '1px solid #f1f5f9'
                                            }}
                                        >
                                            <social.icon size={22} strokeWidth={2.5} />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '4px', height: '20px', background: '#6366f1', borderRadius: '2px' }}></div>
                                    Quick Contact
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[
                                        { icon: Mail, label: 'Email Address', value: user.email, color: '#3b82f6', bg: '#eff6ff' },
                                        { icon: Phone, label: 'Phone Number', value: user.phone || 'Not provided', color: '#10b981', bg: '#ecfdf5' },
                                        { icon: MapPin, label: 'Location', value: user.location || 'Not provided', color: '#f59e0b', bg: '#fffbeb' },
                                        { icon: Calendar, label: 'Joined Date', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', color: '#6366f1', bg: '#eef2ff' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ padding: '12px', background: item.bg, borderRadius: '14px', color: item.color, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                                <item.icon size={20} />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div>
                            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Public Overview</h1>
                                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Control how students perceive you in the marketplace.</p>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.05, translateY: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsEditing(true)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                        padding: '1rem 2.25rem', borderRadius: '18px', 
                                        background: '#0f172a', color: 'white', border: 'none', 
                                        fontWeight: 700, cursor: 'pointer', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.25)',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <Edit2 size={18} /> Edit Public Profile
                                </motion.button>
                            </motion.div>

                            {/* Profile Completion */}
                            <motion.div 
                                variants={itemVariants}
                                style={{ background: 'white', padding: '2rem', borderRadius: '24px', marginBottom: '3rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '2.5rem', border: '1px solid #f1f5f9' }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Profile Completeness</h4>
                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#4f46e5' }}>{completion}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '7px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completion}%` }}
                                            transition={{ duration: 1.5, ease: 'circOut' }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #ec4899, #f59e0b)', borderRadius: '7px' }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: '#f0fdf4', borderRadius: '18px', color: '#15803d' }}>
                                    <div style={{ padding: '8px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><CheckCircle size={24} /></div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3 }}>
                                        {completion === 100 ? "Verified Profile" : `${100 - completion}% for verification`}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                variants={itemVariants}
                                style={{ background: 'white', borderRadius: '32px', padding: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', marginBottom: '3rem', border: '1px solid #f1f5f9' }}
                            >
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '14px', color: '#4f46e5' }}><Briefcase size={24} /></div>
                                    Expert Biography
                                </h3>
                                <p style={{ color: '#475569', lineHeight: '2', fontSize: '1.15rem', fontWeight: 450 }}>
                                    {user.bio || (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                            Your biography is currently empty. <br/> <a href="#" onClick={(e) => { e.preventDefault(); setIsEditing(true); }} style={{ color: '#4f46e5', fontWeight: 800, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>Introduce yourself →</a>
                                        </span>
                                    )}
                                </p>
                            </motion.div>

                             <motion.div 
                                variants={containerVariants}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
                            >
                                <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '2rem', borderRadius: '28px', color: 'white', boxShadow: '0 20px 30px -10px rgba(16, 185, 129, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Award size={24} /></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, background: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Rated</span>
                                    </div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.rating}</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 600 }}>Avg. Rating</div>
                                </motion.div>

                                <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '2rem', borderRadius: '28px', color: 'white', boxShadow: '0 20px 30px -10px rgba(245, 158, 11, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Users size={24} /></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, background: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Reach</span>
                                    </div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.students}</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 600 }}>Total Students</div>
                                </motion.div>
                                
                                <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', padding: '2rem', borderRadius: '28px', color: 'white', boxShadow: '0 20px 30px -10px rgba(99, 102, 241, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Briefcase size={24} /></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, background: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio</span>
                                    </div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.courses}</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 600 }}>Live Courses</div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* EDIT PROFILE MODAL */}
                <AnimatePresence>
                    {isEditing && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                style={{ width: '95%', maxWidth: '750px', maxHeight: '90vh', background: 'white', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.4)' }}
                            >
                                <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Edit Professional Profile</h2>
                                        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Updates will be visible to students across the platform.</p>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, background: '#fee2e2', color: '#ef4444' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsEditing(false)} 
                                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                                    >
                                        <X size={24} />
                                    </motion.button>
                                </div>

                                <div style={{ padding: '2.5rem', overflowY: 'auto' }}>
                                    <form id="profile-form" onSubmit={handleSave}>
                                        <div style={{ marginBottom: '3rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '10px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                                                Personal Details
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                <ModalField label="Phone Number" icon={Phone} name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                                <ModalField label="Location" icon={MapPin} name="location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                                            </div>
                                            
                                            <ModalField label="Professional Headline" icon={Briefcase} name="occupation" placeholder="e.g. Senior Full Stack Engineer & Instructor" value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
                                            
                                            <div style={{ marginTop: '1rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#475569', marginBottom: '0.6rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Professional Biography</label>
                                                <textarea 
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                    placeholder="Share your experience, achievements, and teaching philosophy..."
                                                    style={{ 
                                                        width: '100%', minHeight: '160px', padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#1e293b', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', lineHeight: '1.6'
                                                    }}
                                                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#f5f3ff', borderRadius: '10px', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={18} /></div>
                                                Online Presence
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                <ModalField label="Website" icon={Globe} name="website" placeholder="https://yourportfolio.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                                                <ModalField label="GitHub" icon={Github} name="github" placeholder="github.com/username" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
                                                <ModalField label="LinkedIn" icon={Linkedin} name="linkedin" placeholder="linkedin.com/in/username" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
                                                <ModalField label="Twitter" icon={Twitter} name="twitter" placeholder="twitter.com/username" value={formData.twitter} onChange={(e) => setFormData({...formData, twitter: e.target.value})} />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', justifyContent: 'flex-end', gap: '1.25rem' }}>
                                    <motion.button 
                                        whileHover={{ background: '#f1f5f9' }}
                                        onClick={() => setIsEditing(false)} 
                                        style={{ padding: '1rem 2rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        Discard
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.05, translateY: -3, boxShadow: '0 15px 30px rgba(79, 70, 229, 0.4)' }}
                                        whileTap={{ scale: 0.95 }}
                                        form="profile-form" type="submit" 
                                        style={{ padding: '1rem 2.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)' }}
                                    >
                                        <Save size={20} /> Update Profile
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default InstructorProfile;
