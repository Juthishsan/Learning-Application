import { useState, useEffect } from 'react';
import { User, Mail, Award, BookOpen, Calendar, Edit3, Camera, Globe, Linkedin, Twitter, Youtube, Facebook, Instagram, Link as LinkIcon, FileText, MapPin, Phone, LogOut, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PersonalizationModal from '../components/PersonalizationModal';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const localUser = JSON.parse(storedUser);
                setUser(localUser);
                
                // Initial inaccurate count
                if (localUser.enrolledCourses) {
                    setEnrolledCount(localUser.enrolledCourses.length);
                }

                try {
                    const userId = localUser.id || localUser._id;
                    
                    const [userRes, coursesRes] = await Promise.all([
                        fetch(`http://localhost:5000/api/users/${userId}`),
                        fetch(`http://localhost:5000/api/users/${userId}/courses`)
                    ]);

                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    if (coursesRes.ok) {
                        const coursesData = await coursesRes.json();
                        // Filter valid courses
                        const validCourses = coursesData.filter(e => e.courseId);
                        setEnrolledCourses(validCourses);
                        setEnrolledCount(validCourses.length);
                    }

                } catch (err) {
                    console.error("Failed to fetch fresh data", err);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        toast.success('Logged out successfully');
    };

    if (!user) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Please log in to view profile.</div>;

    return (
        <div style={{ background: 'transparent', minHeight: '100vh', width: '100%', paddingBottom: '4rem' }}>
            <div className="container" style={{ maxWidth: '1100px', paddingTop: '100px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card" 
                    style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: 'white', borderRadius: '16px' }}
                >
                    {/* Cover Image */}
                    <div style={{ height: '200px', background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', position: 'relative' }}></div>
                    
                    <div style={{ padding: '0 2.5rem 2.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', md: {flexDirection: 'row'}, gap: '1.5rem' }}>
                             {/* Avatar */}
                            <div style={{ 
                                width: '150px', height: '150px', borderRadius: '50%', background: 'white', padding: '6px',
                                marginTop: '-75px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative', zIndex: 10
                            }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#64748b' }}>{user.name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Header Info */}
                            <div style={{ paddingTop: '1rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{user.name}</h1>
                                    <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500, marginBottom: '0.75rem' }}>
                                        {user.preferences?.occupation || 'Student'} {user.location ? `• ${user.location}` : ''}
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                        {user.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <MapPin size={16} /> {user.location}
                                            </span>
                                        )}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={16} /> Joined {new Date(user.createdAt).getFullYear()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => setIsEditProfileOpen(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1' }}>
                                        <Edit3 size={18} /> Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Highlights / Stats */}
                        <div className="card" style={cardStyle}>
                            <h3 style={sectionTitleStyle}>Analytics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{enrolledCount}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Enrolled Courses</div>
                                </div>
                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                                        {user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + 1 : 1}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Day Streak</div>
                                </div>
                            </div>
                        </div>

                         {/* Contact & Social */}
                        <div className="card" style={cardStyle}>
                            <h3 style={sectionTitleStyle}>Contact Information</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={contactRowStyle}>
                                    <div style={iconBoxStyle}><Mail size={18} /></div>
                                    <div>
                                        <div style={labelStyle}>Email</div>
                                        <div style={valueStyle}>{user.email}</div>
                                    </div>
                                </div>
                                {user.phone && (
                                    <div style={contactRowStyle}>
                                        <div style={iconBoxStyle}><Phone size={18} /></div>
                                        <div>
                                            <div style={labelStyle}>Phone</div>
                                            <div style={valueStyle}>{user.phone}</div>
                                        </div>
                                    </div>
                                )}
                                {user.socialLinks?.website && (
                                     <div style={contactRowStyle}>
                                         <div style={iconBoxStyle}><Globe size={18} /></div>
                                         <div>
                                             <div style={labelStyle}>Website</div>
                                             <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ ...valueStyle, color: 'var(--primary)', textDecoration: 'underline' }}>
                                                 {user.socialLinks.website.replace(/^https?:\/\//, '')}
                                             </a>
                                         </div>
                                     </div>
                                )}
                                {user.resume && (
                                    <div style={contactRowStyle}>
                                        <div style={iconBoxStyle}><FileText size={18} /></div>
                                        <div>
                                            <div style={labelStyle}>Resume</div>
                                            <a href={user.resume} target="_blank" rel="noopener noreferrer" style={{ ...valueStyle, color: 'var(--primary)', textDecoration: 'underline' }}>
                                                View Resume
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Icons Row */}
                            {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                                    {user.socialLinks.linkedin && <SocialIcon href={user.socialLinks.linkedin} icon={<Linkedin size={18} />} />}
                                    {user.socialLinks.twitter && <SocialIcon href={user.socialLinks.twitter} icon={<Twitter size={18} />} />}
                                    {user.socialLinks.instagram && <SocialIcon href={user.socialLinks.instagram} icon={<Instagram size={18} />} />}
                                    {user.socialLinks.facebook && <SocialIcon href={user.socialLinks.facebook} icon={<Facebook size={18} />} />}
                                    {user.socialLinks.youtube && <SocialIcon href={user.socialLinks.youtube} icon={<Youtube size={18} />} />}
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="card" style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Skills & Interests</h3>
                                <button onClick={() => setIsPersonalizeOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                    <Edit3 size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {user.preferences?.skills && user.preferences.skills.length > 0 ? (
                                    user.preferences.skills.map(skill => (
                                        <span key={skill} style={{ background: '#f1f5f9', color: '#334155', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No skills selected yet</span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* About Me */}
                        <div className="card" style={cardStyle}>
                            <h3 style={sectionTitleStyle}>About Me</h3>
                            {user.bio ? (
                                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '1rem' }}>{user.bio}</p>
                            ) : (
                                <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                                    Write something about yourself to let people know who you are.
                                    <br/>
                                    <button onClick={() => setIsEditProfileOpen(true)} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer' }}>Add Bio</button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity / Active Courses */}
                        <div className="card" style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Active Courses</h3>
                                <button onClick={() => navigate('/dashboard')} style={{ fontSize: '0.9rem', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                            </div>

                            {enrolledCourses.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {enrolledCourses.slice(0, 3).map((enrollment, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)} className="hover:bg-slate-50">
                                            <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                                {enrollment.courseId?.thumbnail && (enrollment.courseId.thumbnail.startsWith('http') || enrollment.courseId.thumbnail.startsWith('/')) ? (
                                                    <img src={enrollment.courseId.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    (enrollment.courseId?.thumbnail && enrollment.courseId.thumbnail.length < 10) ? enrollment.courseId.thumbnail : '📚'
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{enrollment.courseId?.title}</h4>
                                                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: enrollment.progress === 100 ? '#10b981' : '#4f46e5' }}></div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{enrollment.progress || 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No active courses.
                                </div>
                            )}
                        </div>

                        {/* Account Settings */}
                        <div className="card" style={cardStyle}>
                           <h3 style={sectionTitleStyle}>Account Settings</h3>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button onClick={() => setIsChangePasswordOpen(true)} className="btn" style={settingButtonStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={18} /> Password & Security</div> <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                                </button>
                                <button className="btn" style={settingButtonStyle} onClick={() => toast.success('Notifications settings updated')}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>✓</div> 
                                    Email Notifications <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                                </button>
                                <button onClick={handleLogout} className="btn" style={{ ...settingButtonStyle, color: '#ef4444', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                                    <LogOut size={18} /> Sign Out
                                </button>
                           </div>
                        </div>

                    </div>
                </div>

                {/* Modals */}
                {user && (
                    <PersonalizationModal 
                        isOpen={isPersonalizeOpen} 
                        onClose={() => setIsPersonalizeOpen(false)} 
                        user={user}
                        onUpdate={(updatedUser) => setUser(updatedUser)}
                    />
                )}
                {user && (
                    <EditProfileModal
                        isOpen={isEditProfileOpen}
                        onClose={() => setIsEditProfileOpen(false)}
                        user={user}
                        onUpdate={(updatedUser) => setUser(updatedUser)}
                    />
                )}
                {user && (
                    <ChangePasswordModal
                        isOpen={isChangePasswordOpen}
                        onClose={() => setIsChangePasswordOpen(false)}
                        userId={user._id || user.id}
                    />
                )}
                
                <style jsx>{`
                    .btn-outline:hover { background: #f8fafc; }
                    .hover:bg-slate-50:hover { background: #f8fafc; }
                `}</style>
            </div>
        </div>
    );
};

const SocialIcon = ({ href, icon }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#f1f5f9', color: '#475569', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.color = 'var(--primary)'}} onMouseOut={e => {e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'}}>
        {icon}
    </a>
);

// Styles
const cardStyle = {
    background: 'white', padding: '1.5rem', borderRadius: '16px', 
    border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};
const sectionTitleStyle = {
    fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem'
};
const statBoxStyle = {
    background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', 
    textAlign: 'center', border: '1px solid #e2e8f0'
};
const contactRowStyle = {
    display: 'flex', alignItems: 'center', gap: '1rem'
};
const iconBoxStyle = {
    width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
};
const labelStyle = {
    fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'
};
const valueStyle = {
    fontSize: '0.95rem', color: '#334155', fontWeight: 500
};
const settingButtonStyle = {
    width: '100%', textAlign: 'left', padding: '0.75rem', borderRadius: '8px',
    display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600,
    color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer',
    transition: 'background 0.2s'
};

export default UserProfile;
