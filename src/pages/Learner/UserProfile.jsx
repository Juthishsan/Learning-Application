import { useState, useEffect } from 'react';
import { User, Mail, Award, BookOpen, Calendar, Edit3, Camera, Globe, Linkedin, Twitter, Youtube, Facebook, Instagram, Link as LinkIcon, FileText, MapPin, Phone, LogOut, Shield, ChevronRight, Activity, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PersonalizationModal from '../../components/Modals/PersonalizationModal';
import EditProfileModal from '../../components/Modals/EditProfileModal';
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal';
import '../../styles/UserProfile.css';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (!user) return <div className="pro-page" style={{ paddingTop: '100px', textAlign: 'center' }}>Please log in to view profile.</div>;

    return (
        <div className="pro-page">
            <div className="pro-bg-shape pro-shape-1"></div>
            <div className="pro-bg-shape pro-shape-2"></div>

            <div className="pro-container">
                
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pro-hero-card"
                >
                    <div className="pro-hero-banner"></div>
                    
                    <div className="pro-hero-content">
                        <div className="pro-avatar-container">
                            <div className="pro-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <span>{user.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="pro-hero-details">
                            <div>
                                <h1 className="pro-name">{user.name}</h1>
                                <p className="pro-role">
                                    {user.preferences?.occupation || 'Student'} 
                                    {user.location ? ` • ${user.location}` : ''}
                                </p>
                                
                                <div className="pro-meta">
                                    {user.location && (
                                        <span><MapPin size={16} /> {user.location}</span>
                                    )}
                                    <span><Calendar size={16} /> Joined {new Date(user.createdAt).getFullYear()}</span>
                                </div>
                            </div>

                            <div>
                                <button onClick={() => setIsEditProfileOpen(true)} className="pro-edit-btn">
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="pro-grid"
                >
                    
                    {/* Left Column */}
                    <div className="pro-col">
                        
                        {/* Highlights / Analytics */}
                        <motion.div variants={itemVariants} className="pro-card">
                            <h3 className="pro-card-title"><Activity size={20} /> Analytics</h3>
                            <div className="pro-analytics-grid">
                                <div className="pro-stat-box">
                                    <div className="pro-stat-val">{enrolledCount}</div>
                                    <div className="pro-stat-label">Enrolled Courses</div>
                                </div>
                                <div className="pro-stat-box">
                                    <div className="pro-stat-val">
                                        {user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + 1 : 1}
                                    </div>
                                    <div className="pro-stat-label">Day Streak</div>
                                </div>
                            </div>
                        </motion.div>

                         {/* Contact & Social */}
                        <motion.div variants={itemVariants} className="pro-card">
                            <h3 className="pro-card-title"><Mail size={20} /> Contact Information</h3>
                            <div className="pro-contact-list">
                                <div className="pro-contact-item">
                                    <div className="pro-icon-box"><Mail size={18} /></div>
                                    <div>
                                        <div className="pro-contact-label">Email</div>
                                        <div className="pro-contact-val">{user.email}</div>
                                    </div>
                                </div>
                                {user.phone && (
                                    <div className="pro-contact-item">
                                        <div className="pro-icon-box"><Phone size={18} /></div>
                                        <div>
                                            <div className="pro-contact-label">Phone</div>
                                            <div className="pro-contact-val">{user.phone}</div>
                                        </div>
                                    </div>
                                )}
                                {user.socialLinks?.website && (
                                     <div className="pro-contact-item">
                                         <div className="pro-icon-box"><Globe size={18} /></div>
                                         <div>
                                             <div className="pro-contact-label">Website</div>
                                             <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="pro-contact-val pro-link">
                                                 {user.socialLinks.website.replace(/^https?:\/\//, '')}
                                             </a>
                                         </div>
                                     </div>
                                )}
                                {user.resume && (
                                    <div className="pro-contact-item">
                                        <div className="pro-icon-box"><FileText size={18} /></div>
                                        <div>
                                            <div className="pro-contact-label">Resume</div>
                                            <a href={user.resume} target="_blank" rel="noopener noreferrer" className="pro-contact-val pro-link">
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Icons */}
                            {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
                                <div className="pro-social-row">
                                    {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="pro-social-icon"><Linkedin size={20} /></a>}
                                    {user.socialLinks.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="pro-social-icon"><Twitter size={20} /></a>}
                                    {user.socialLinks.instagram && <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="pro-social-icon"><Instagram size={20} /></a>}
                                    {user.socialLinks.facebook && <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="pro-social-icon"><Facebook size={20} /></a>}
                                    {user.socialLinks.youtube && <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="pro-social-icon"><Youtube size={20} /></a>}
                                </div>
                            )}
                        </motion.div>

                        {/* Skills */}
                        <motion.div variants={itemVariants} className="pro-card">
                            <div className="pro-header-actions">
                                <h3 className="pro-card-title" style={{marginBottom: 0}}><Award size={20} /> Skills & Interests</h3>
                                <button onClick={() => setIsPersonalizeOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pro-primary)' }}>
                                    <Edit3 size={18} />
                                </button>
                            </div>
                            <div className="pro-skills-list">
                                {user.preferences?.skills && user.preferences.skills.length > 0 ? (
                                    user.preferences.skills.map(skill => (
                                        <span key={skill} className="pro-skill-tag">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <div className="pro-empty-state" style={{width: '100%', padding: '1rem'}}>No skills selected yet. Click edit to add some!</div>
                                )}
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Column */}
                    <div className="pro-col">
                        
                        {/* About Me */}
                        <motion.div variants={itemVariants} className="pro-card">
                            <h3 className="pro-card-title"><User size={20} /> About Me</h3>
                            {user.bio ? (
                                <p className="pro-about-text">{user.bio}</p>
                            ) : (
                                <div className="pro-empty-state">
                                    Your bio is empty. Write a little bit about yourself to let the community know who you are.
                                    <br/><br/>
                                    <button onClick={() => setIsEditProfileOpen(true)} className="pro-link" style={{background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem'}}>+ Add Bio</button>
                                </div>
                            )}
                        </motion.div>

                        {/* Active Courses */}
                        <motion.div variants={itemVariants} className="pro-card">
                            <div className="pro-header-actions">
                                <h3 className="pro-card-title" style={{marginBottom: 0}}><BookOpen size={20} /> Active Courses</h3>
                                <button onClick={() => navigate('/dashboard')} className="pro-link" style={{background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'}}>View All</button>
                            </div>

                            {enrolledCourses.length > 0 ? (
                                <div className="pro-course-list">
                                    {enrolledCourses.slice(0, 3).map((enrollment, idx) => (
                                        <div key={idx} className="pro-course-item" onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)}>
                                            <div className="pro-course-img">
                                                {enrollment.courseId?.thumbnail && (enrollment.courseId.thumbnail.startsWith('http') || enrollment.courseId.thumbnail.startsWith('/')) ? (
                                                    <img src={enrollment.courseId.thumbnail} alt="" />
                                                ) : (
                                                    (enrollment.courseId?.thumbnail && enrollment.courseId.thumbnail.length < 10) ? enrollment.courseId.thumbnail : '📚'
                                                )}
                                            </div>
                                            <div className="pro-course-info">
                                                <h4 className="pro-course-title">{enrollment.courseId?.title}</h4>
                                                <div className="pro-progress-bar">
                                                    <div className={`pro-progress-fill ${enrollment.progress === 100 ? 'completed' : ''}`} style={{ width: `${enrollment.progress || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <span className="pro-progress-val">{enrollment.progress || 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="pro-empty-state">
                                    You don't have any active courses yet. Time to start learning!
                                </div>
                            )}
                        </motion.div>

                        {/* Account Settings */}
                        <motion.div variants={itemVariants} className="pro-card">
                           <h3 className="pro-card-title"><Shield size={20} /> Account Settings</h3>
                           <div className="pro-settings-list">
                                <button onClick={() => setIsChangePasswordOpen(true)} className="pro-setting-btn">
                                    <Shield size={20} color="#8b5cf6" /> Password & Security <ChevronRight size={18} className="pro-btn-right" />
                                </button>
                                <button className="pro-setting-btn" onClick={() => toast.success('Notifications settings updated')}>
                                    <MessageSquare size={20} color="#10b981" /> Email Notifications <ChevronRight size={18} className="pro-btn-right" />
                                </button>
                                <button onClick={handleLogout} className="pro-setting-btn danger" style={{ marginTop: '0.5rem' }}>
                                    <LogOut size={20} /> Sign Out <ChevronRight size={18} className="pro-btn-right" />
                                </button>
                           </div>
                        </motion.div>

                    </div>
                </motion.div>

                {/* Modals remain exactly the same behavior */}
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
            </div>
        </div>
    );
};

export default UserProfile;
