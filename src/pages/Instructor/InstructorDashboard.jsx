import { motion } from 'framer-motion';
import { BookOpen, Users, IndianRupee, TrendingUp, Star, Plus, Search, Bell, Calendar, ArrowRight, MessageSquare, MoreVertical, FileText, Settings } from 'lucide-react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const StatCard = ({ title, value, icon, color, trend, bg }) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ translateY: -5 }}
        style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '24px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03), 0 4px 6px -2px rgba(0,0,0,0.02)', 
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            transition: 'all 0.3s ease'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: bg, 
                color: color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 8px 16px -4px ${color}20`
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    background: trend.startsWith('+') ? '#dcfce7' : '#fee2e2', 
                    color: trend.startsWith('+') ? '#15803d' : '#b91c1c',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    {trend} <TrendingUp size={12} />
                </div>
            )}
        </div>
        <div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</h3>
        </div>
    </motion.div>
);

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ revenue: 0, students: 0, rating: 0, courses: 0 });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser || {});

        const fetchData = async () => {
            try {
                if (!storedUser) return;

                // 1. Fetch Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                const filtered = allCourses.filter(c => c.instructor === storedUser.name);
                setMyCourses(filtered);

                // 2. Fetch Users to calculate enrollments
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let totalRevenue = 0;
                let uniqueStudentIds = new Set();
                let recent = [];

                allUsers.forEach(u => {
                    if (u.enrolledCourses && u.enrolledCourses.length > 0) {
                        u.enrolledCourses.forEach(enrollment => {
                            const courseIdStr = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            const myCourse = filtered.find(c => c._id === courseIdStr);
                            
                            if (myCourse) {
                                totalRevenue += myCourse.price;
                                uniqueStudentIds.add(u._id);
                                recent.push({
                                    id: u._id + myCourse._id,
                                    studentName: u.name,
                                    courseTitle: myCourse.title,
                                    price: myCourse.price,
                                    date: new Date().toLocaleDateString() // Mock date
                                });
                            }
                        });
                    }
                });

                setStats({
                    revenue: totalRevenue,
                    students: uniqueStudentIds.size,
                    rating: 4.8,
                    courses: filtered.length
                });

                setRecentEnrollments(recent.reverse().slice(0, 5));

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: '#10b981', bg: '#dcfce7', trend: '+12.5%' },
        { title: 'Active Students', value: stats.students, icon: <Users size={24} />, color: '#6366f1', bg: '#e0e7ff', trend: '+5.2%' },
        { title: 'Course Rating', value: stats.rating, icon: <Star size={24} fill="currentColor" />, color: '#f59e0b', bg: '#fef3c7', trend: '+0.2' },
        { title: 'Total Courses', value: stats.courses, icon: <BookOpen size={24} />, color: '#ec4899', bg: '#fce7f3' },
    ];

    return (
        <div style={{ display: 'flex', background: 'transparent', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                {/* Modern Header */}
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Instructor Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: '#4f46e5', fontWeight: 700 }}>{user.name?.split(' ')[0]}</span>! Here's your school's performance.</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search courses or students..." 
                                style={{ 
                                    padding: '0.75rem 1rem 0.75rem 2.75rem', 
                                    borderRadius: '14px', 
                                    border: '1px solid #e2e8f0', 
                                    width: '300px', 
                                    outline: 'none', 
                                    color: '#475569', 
                                    fontSize: '0.95rem',
                                    background: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }} 
                            />
                        </div>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <Bell size={20} color="#64748b" />
                            <div style={{ width: '9px', height: '9px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '10px', right: '10px', border: '2px solid white' }}></div>
                        </div>
                        <div style={{ height: '45px', padding: '0 1rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <Calendar size={18} />
                            <span style={{ fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={dashboardVariants}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}
                >
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Column: Activity & Performance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Recent Enrollments Feed */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Recent Enrollments</h3>
                                <button style={{ color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    View All Students <ArrowRight size={16} />
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentEnrollments.length > 0 ? recentEnrollments.map((item, i) => (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ background: '#f8fafc' }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800, fontSize: '1.1rem' }}>
                                                {item.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{item.studentName}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Joined <span style={{ fontWeight: 600, color: '#4f46e5' }}>{item.courseTitle}</span></p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', display: 'block' }}>+₹{item.price}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{item.date}</span>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 500 }}>No recent enrollments to show.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Course Performance (Mini Chart Style) */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Course Performance</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {myCourses.slice(0, 4).map((course, idx) => (
                                    <div key={idx} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: course.thumbnail?.length < 3 ? '#e0f2fe' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', overflow: 'hidden' }}>
                                                {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                                                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    (course.thumbnail && course.thumbnail.length < 10) ? course.thumbnail : '📚'
                                                )}
                                            </div>
                                            <button style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                                        </div>
                                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h4>
                                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((stats.students / 20) * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                            <span>Enrollment Goal</span>
                                            <span>{Math.round(Math.min((stats.students / 20) * 100, 100))}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Widgets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Quick Actions */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>Quick Actions</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    onClick={() => navigate('/instructor/courses')}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '16px', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#ede9fe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(109, 40, 217, 0.1)' }}>
                                        <Plus size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>New Course</span>
                                </button>
                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '16px', background: '#ecfdf5', border: '1px solid #d1fae5', color: '#059669', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#d1fae5'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(5, 150, 105, 0.1)' }}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Messages</span>
                                </button>
                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fef3c7', color: '#d97706', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef3c7'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fffbeb'}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(217, 119, 6, 0.1)' }}>
                                        <FileText size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Reports</span>
                                </button>
                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '16px', background: '#f0f9ff', border: '1px solid #e0f2fe', color: '#0284c7', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(2, 132, 199, 0.1)' }}>
                                        <Settings size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Pro Tip Card */}
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)' }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <TrendingUp size={20} color="#818cf8" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Boost Engagement</h3>
                                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>Courses with active discussions have 45% higher completion rates. Reply to student messages to stay trending!</p>
                                <button style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                                    Open Discussions
                                </button>
                            </div>
                            {/* Decoration */}
                            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}></div>
                        </div>

                        {/* Student Demographics (Mock Visual) */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>Student Growth</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', paddingBottom: '10px' }}>
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                                        style={{ flex: 1, background: i === 3 ? '#6366f1' : '#e2e8f0', borderRadius: '4px' }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
