import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, IndianRupee, TrendingUp, Star, Plus, Search, Bell, Calendar, ArrowRight, MessageSquare, MoreVertical, FileText, Settings, Video, CheckCircle, Clock, Zap, GraduationCap } from 'lucide-react';
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
        whileHover={{ translateY: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)' }}
        style={{ 
            background: 'white', 
            padding: '1.75rem', 
            borderRadius: '24px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -2px rgba(0,0,0,0.01)', 
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: bg, opacity: 0.4, borderRadius: '50%', filter: 'blur(30px)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '16px', 
                background: bg, 
                color: color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 8px 16px -4px ${color}30`
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{ 
                    padding: '6px 10px', 
                    borderRadius: '10px', 
                    background: trend.startsWith('+') ? '#dcfce7' : '#fee2e2', 
                    color: trend.startsWith('+') ? '#15803d' : '#b91c1c',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {trend} <TrendingUp size={14} />
                </div>
            )}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{value}</h3>
        </div>
    </motion.div>
);

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ revenue: 0, students: 0, enrollments: 0, courses: 0 });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [user, setUser] = useState({});

    const [pendingTasks, setPendingTasks] = useState([]);

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

                // 2. Fetch Users to calculate enrollments
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let totalRevenue = 0;
                let uniqueStudentIds = new Set();
                let recent = [];
                let courseTally = {};
                filtered.forEach(c => courseTally[c._id] = 0);
                let assignmentsToGrade = 0;
                let totalEnrollments = 0;

                allUsers.forEach(u => {
                    if (u.enrolledCourses && u.enrolledCourses.length > 0) {
                        u.enrolledCourses.forEach(enrollment => {
                            const courseIdStr = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            const myCourse = filtered.find(c => c._id === courseIdStr);
                            
                            if (myCourse) {
                                totalRevenue += myCourse.price;
                                uniqueStudentIds.add(u._id);
                                totalEnrollments++;
                                courseTally[courseIdStr] = (courseTally[courseIdStr] || 0) + 1;
                                recent.push({
                                    id: u._id + myCourse._id,
                                    studentName: u.name,
                                    courseTitle: myCourse.title,
                                    price: myCourse.price,
                                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                });

                                if (enrollment.assignments) {
                                    enrollment.assignments.forEach(a => {
                                        if (a.submissionUrl && (a.score === undefined || a.score === null)) {
                                            assignmentsToGrade++;
                                        }
                                    });
                                }
                            }
                        });
                    }
                });

                const updatedCourses = filtered.map(c => ({
                    ...c,
                    enrolledStudents: courseTally[c._id] || 0
                })).sort((a,b) => b.enrolledStudents - a.enrolledStudents);
                setMyCourses(updatedCourses);

                setStats({
                    revenue: totalRevenue,
                    students: uniqueStudentIds.size,
                    enrollments: totalEnrollments,
                    courses: filtered.length
                });

                setRecentEnrollments(recent.reverse().slice(0, 5));

                const dynamicPendingTasks = [];
                if (assignmentsToGrade > 0) {
                    dynamicPendingTasks.push({ title: "Grade Assignments", count: assignmentsToGrade, type: 'assignment', color: '#f59e0b', bg: '#fef3c7' });
                }
                setPendingTasks(dynamicPendingTasks);

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={26} />, color: '#10b981', bg: '#dcfce7', trend: '+12.5%' },
        { title: 'Active Students', value: stats.students, icon: <Users size={26} />, color: '#6366f1', bg: '#e0e7ff', trend: '+8.2%' },
        { title: 'Total Enrollments', value: stats.enrollments, icon: <GraduationCap size={26} />, color: '#f59e0b', bg: '#fef3c7', trend: '+4.1%' },
        { title: 'Published Courses', value: stats.courses, icon: <BookOpen size={26} />, color: '#ec4899', bg: '#fce7f3' },
    ];

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
                {/* Modern Header */}
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>Instructor Hub</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: '#4f46e5', fontWeight: 700 }}>{user.name?.split(' ')[0]}</span>. Here's your teaching footprint.</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search courses, students..." 
                                style={{ 
                                    padding: '0.85rem 1rem 0.85rem 2.85rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0', 
                                    width: '280px', 
                                    outline: 'none', 
                                    color: '#1e293b', 
                                    fontSize: '0.95rem',
                                    background: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#818cf8'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                        <button style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                            <Bell size={20} color="#64748b" />
                            <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '12px', right: '12px', border: '2px solid white' }}></div>
                        </button>
                        <div style={{ height: '48px', padding: '0 1.25rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontWeight: 700, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <Calendar size={18} color="#4f46e5" />
                            <span style={{ fontSize: '0.95rem' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={dashboardVariants}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}
                >
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '2rem' }}>
                    
                    {/* Left Column: Courses & Enrollments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Top Performing Courses */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Top Performing Courses</h3>
                                <button style={{ color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    View All <ArrowRight size={16} />
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {myCourses.slice(0, 3).map((course, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                            <div style={{ width: '80px', height: '60px', borderRadius: '12px', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📚</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', marginBottom: '0.25rem' }}>{course.title}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {course.enrolledStudents || 0} Students</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706' }}><Star size={14} fill="currentColor" /> {course.rating || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{course.price * (course.enrolledStudents || 0)}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Revenue</p>
                                        </div>
                                    </div>
                                ))}
                                {myCourses.length === 0 && (
                                     <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No courses published yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Recent Enrollments</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <AnimatePresence>
                                    {recentEnrollments.length > 0 ? recentEnrollments.map((item, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ scale: 1.01, background: '#f8fafc' }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', transition: 'all 0.2s', cursor: 'default' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>
                                                    {item.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.1rem' }}>{item.studentName}</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Enrolled in <span style={{ fontWeight: 600, color: '#4f46e5' }}>{item.courseTitle}</span></p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}><Plus size={14} strokeWidth={3} />₹{item.price}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{item.date}</span>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                            <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem', margin: '0 auto' }} />
                                            <p style={{ fontWeight: 500 }}>No recent enrollments to show.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Action Center */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Action Center</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    onClick={() => navigate('/instructor/courses')}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', color: 'white', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={24} color="white" />
                                    </div>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>New Course</span>
                                </button>
                                
                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                >
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <Video size={22} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Live Class</span>
                                </button>

                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                >
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <MessageSquare size={22} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Announce</span>
                                </button>
                                
                                <button 
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                >
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <FileText size={22} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Reports</span>
                                </button>
                            </div>
                        </div>

                        {/* Pending Tasks */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Pending Tasks</h3>
                                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{pendingTasks.reduce((a,b)=>a+b.count,0)} To Review</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pendingTasks.map((task, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: task.bg, color: task.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {task.type === 'assignment' ? <FileText size={18} /> : task.type === 'qa' ? <MessageSquare size={18} /> : <CheckCircle size={18} />}
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.2rem' }}>{task.title}</h4>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Needs attention</p>
                                            </div>
                                        </div>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            {task.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                View All Tasks
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
