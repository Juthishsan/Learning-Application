
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, User, IndianRupee, TrendingUp, Star, Plus, Search, Bell, Calendar, ArrowRight, MessageSquare, MoreVertical, FileText, Settings, Video, CheckCircle, Clock, Zap, GraduationCap, Brain, Activity, RefreshCw, Target, Info, ShieldCheck, BarChart2, MousePointer2, Sparkles } from 'lucide-react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AnnounceModal from '../../components/Modals/AnnounceModal';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const StatCard = ({ title, value, icon, color, trend, bg }) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ translateY: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
        style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '28px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', 
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default'
        }}
    >
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: bg, opacity: 0.3, borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '18px', 
                background: bg, 
                color: color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 12px 20px -8px ${color}40`
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '12px', 
                    background: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2', 
                    color: trend.startsWith('+') ? '#15803d' : '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    {trend} <TrendingUp size={14} />
                </div>
            )}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{value}</h3>
        </div>
    </motion.div>
);

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ revenue: 0, students: 0, enrollments: 0, courses: 0 });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [revenueAnalytics, setRevenueAnalytics] = useState([]);
    const [user, setUser] = useState({});
    const [showAnnounceModal, setShowAnnounceModal] = useState(false);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [insights, setInsights] = useState(null);
    const [isInsightsLoading, setIsInsightsLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser || {});

        const fetchData = async () => {
            try {
                if (!storedUser) return;
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                const filtered = allCourses.filter(c => c.instructor === storedUser.name || c.instructor === storedUser.username);
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let totalRevenue = 0;
                let uniqueStudentIds = new Set();
                let recent = [];
                let courseTally = {};
                filtered.forEach(c => courseTally[c._id] = 0);
                let courseGradesPending = {};
                let totalEnrollments = 0;
                let revenueByMonth = {};

                allUsers.forEach(u => {
                    if (u.enrolledCourses && u.enrolledCourses.length > 0) {
                        u.enrolledCourses.forEach(enrollment => {
                            const courseIdStr = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            const myCourse = filtered.find(c => c._id === courseIdStr);
                            if (myCourse) {
                                totalRevenue += myCourse.price * 0.85; // Instructor's 85% cut
                                uniqueStudentIds.add(u._id);
                                totalEnrollments++;
                                courseTally[courseIdStr] = (courseTally[courseIdStr] || 0) + 1;
                                
                                // Aggregate analytics
                                const date = new Date(u.createdAt);
                                const month = date.toLocaleString('default', { month: 'short' });
                                if (!revenueByMonth[month]) {
                                    revenueByMonth[month] = { name: month, revenue: 0, enrollments: 0 };
                                }
                                revenueByMonth[month].revenue += myCourse.price * 0.85;
                                revenueByMonth[month].enrollments += 1;

                                recent.push({
                                    id: u._id + myCourse._id,
                                    studentName: u.name,
                                    courseTitle: myCourse.title,
                                    price: myCourse.price * 0.85,
                                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                });
                                if (enrollment.assignments) {
                                    enrollment.assignments.forEach(a => {
                                        if (a.submissionUrl && (a.score === undefined || a.score === null)) {
                                            courseGradesPending[courseIdStr] = (courseGradesPending[courseIdStr] || 0) + 1;
                                        }
                                    });
                                }
                            }
                        });
                    }
                });

                const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const sortedAnalytics = Object.values(revenueByMonth).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));
                setRevenueAnalytics(sortedAnalytics);

                const updatedCourses = filtered.map(c => ({
                    ...c,
                    enrolledStudents: courseTally[c._id] || 0
                })).sort((a,b) => b.enrolledStudents - a.enrolledStudents);
                setMyCourses(updatedCourses);

                setStats({ revenue: totalRevenue, students: uniqueStudentIds.size, enrollments: totalEnrollments, courses: filtered.length });
                setRecentEnrollments(recent.reverse().slice(0, 5));

                const dynamicPendingTasks = [];
                Object.keys(courseGradesPending).forEach(courseIdStr => {
                    const myCourse = filtered.find(c => c._id === courseIdStr);
                    if (myCourse) {
                        dynamicPendingTasks.push({ title: `Grade Assignments - ${myCourse.title}`, count: courseGradesPending[courseIdStr], type: 'assignment', color: '#f59e0b', bg: '#fef3c7', courseId: courseIdStr });
                    }
                });
                setPendingTasks(dynamicPendingTasks);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            }
        };

        fetchData();
        if (storedUser) fetchInstructorInsights(storedUser.id || storedUser._id);
    }, []);

    const fetchInstructorInsights = async (userId) => {
        setIsInsightsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/ai/instructor-insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (res.ok) setInsights(data);
        } catch (err) {
            console.error("Failed to fetch AI instructor insights");
        } finally {
            setIsInsightsLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={28} />, color: '#10b981', bg: '#dcfce7', trend: '+14.2%' },
        { title: 'Active Students', value: stats.students, icon: <Users size={28} />, color: '#6366f1', bg: '#e0e7ff', trend: '+9.1%' },
        { title: 'Total Enrollments', value: stats.enrollments, icon: <GraduationCap size={28} />, color: '#f59e0b', bg: '#fef3c7', trend: '+6.4%' },
        { title: 'Published Courses', value: stats.courses, icon: <BookOpen size={28} />, color: '#ec4899', bg: '#fce7f3' },
    ];

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem 4rem', overflowY: 'auto' }}>
                {/* Modern Header */}
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
                >
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: '1.15rem', fontWeight: 500 }}>Welcome back, <span style={{ color: '#4f46e5', fontWeight: 800 }}>{user.name?.split(' ')[0]}</span>. Ready to inspire today?</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search everything..." 
                                style={{ 
                                    padding: '1rem 1.25rem 1rem 3.25rem', 
                                    borderRadius: '20px', 
                                    border: '1px solid #e2e8f0', 
                                    width: '320px', 
                                    outline: 'none', 
                                    color: '#0f172a', 
                                    fontSize: '0.95rem',
                                    background: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: 500
                                }}
                                onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 10px 15px -3px rgba(129, 140, 248, 0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; }}
                            />
                        </div>
                        <div style={{ height: '54px', padding: '0 1.5rem', borderRadius: '20px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontWeight: 800, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', fontSize: '0.95rem' }}>
                            <Calendar size={18} color="#4f46e5" />
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </motion.header>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={dashboardVariants}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3.5rem' }}
                >
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </motion.div>

                {/* Modern Analytics Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '3.5rem' }}>
                    
                    {/* Financial Trends Area Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.15 }}
                        style={{ gridColumn: 'span 8', background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                             <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <TrendingUp size={22} color="#10b981" /> Revenue Analytics (85% Share)
                             </h3>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueAnalytics.length > 0 ? revenueAnalytics : [{name: 'Loading', revenue: 0}]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} dy={15} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} tickFormatter={(value) => `₹${value}`} />
                                    <RechartsTooltip 
                                        wrapperStyle={{ zIndex: 100 }}
                                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', padding: '15px 20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}
                                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Instructor Net Revenue']}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Enrollment Bar Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }}
                        style={{ gridColumn: 'span 4', background: '#0f172a', padding: '2.5rem', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Users size={22} color="#818cf8" /> Enrollment Velocity
                        </h3>
                        
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueAnalytics.length > 0 ? revenueAnalytics : [{name: 'Loading', enrollments: 0}]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} />
                                    <RechartsTooltip 
                                        wrapperStyle={{ zIndex: 100 }}
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}
                                        formatter={(value) => [value, 'New Enrollments']}
                                    />
                                    <Bar dataKey="enrollments" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* AI STRATEGIC INSIGHTS HERO SECTION */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                        borderRadius: '40px',
                        padding: '3.5rem',
                        color: 'white',
                        marginBottom: '3.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: '-100px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ 
                                    padding: '16px', 
                                    background: 'rgba(255,255,255,0.1)', 
                                    borderRadius: '22px', 
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                                    color: '#818cf8'
                                }}>
                                    <Sparkles size={36} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>Strategic AI Insights</h2>
                                    <div style={{ fontSize: '1rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem', fontWeight: 600 }}>
                                        <Brain size={18} fill="#a5b4fc" /> Real-time Performance Intelligence
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isInsightsLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '3rem 0' }}>
                                <RefreshCw size={40} className="animate-spin text-indigo-400" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <p style={{ color: '#f8fafc', fontSize: '1.35rem', fontWeight: 800 }}>Generating Your Strategy...</p>
                                    <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Analyzing engagement patterns across {stats.courses} active courses.</p>
                                </div>
                            </div>
                        ) : insights ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                    <motion.div whileHover={{ y: -5 }} style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                        <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <Activity size={16} /> Market Engagement
                                        </div>
                                        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#cbd5e1', margin: 0, fontWeight: 450 }}>{insights.engagementOverview}</p>
                                    </motion.div>

                                    <motion.div whileHover={{ y: -5 }} style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                        <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <MousePointer2 size={16} /> Content Hooks
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {insights.contentAnalysis.highEngagement.map((item, i) => (
                                                <span key={i} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>{item}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Higher retention in these specific modules.</div>
                                    </motion.div>

                                    <motion.div whileHover={{ y: -5 }} style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                        <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <Target size={16} /> Course Health
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>{insights.assessmentHealth.difficultyRating}</span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Difficulty Balance</span>
                                        </div>
                                        <p style={{ fontSize: '1.05rem', color: '#e2e8f0', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>"{insights.assessmentHealth.observation}"</p>
                                    </motion.div>
                                </div>

                                <div style={{ background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.05))', borderRadius: '32px', padding: '2.5rem', border: '1px solid rgba(79, 70, 229, 0.3)', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                                    <div style={{ flex: 1.5 }}>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c7d2fe', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Zap size={22} fill="#c7d2fe" /> Content Strategy
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {insights.strategicAdvice.map((tip, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6 }}>
                                                    <div style={{ width: '8px', height: '8px', background: '#818cf8', borderRadius: '50%', marginTop: '8px', flexShrink: 0, boxShadow: '0 0 10px #818cf8' }} /> 
                                                    <span>{tip}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#a5b4fc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Target size={16} /> North Star Metric</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.7 }}>{insights.nextSteps}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', color: '#64748b', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <BarChart2 size={56} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Publish your first course to activate strategic AI analytics.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
                    
                    {/* Left Column: Courses & Enrollments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        
                        <motion.div variants={itemVariants} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Top Performing Courses</h3>
                                <motion.button whileHover={{ x: 5 }} onClick={() => navigate('/instructor/courses')} style={{ color: '#4f46e5', fontWeight: 800, background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Analytics <ArrowRight size={18} />
                                </motion.button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {myCourses.slice(0, 3).map((course, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', gap: '1.5rem', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                            <div style={{ width: '100px', height: '75px', borderRadius: '16px', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📚</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.4rem' }}>{course.title}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><Users size={16} /> {course.enrolledStudents || 0} Students</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700 }}><Star size={16} fill="currentColor" /> {course.rating || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981' }}>₹{(course.price * (course.enrolledStudents || 0)).toLocaleString()}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {myCourses.length === 0 && (
                                     <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>No courses published yet.</div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Recent Enrollments</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <AnimatePresence>
                                    {recentEnrollments.length > 0 ? recentEnrollments.map((item, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ scale: 1.01, background: '#f8fafc' }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #f1f5f9', transition: 'all 0.2s', cursor: 'default' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 900, fontSize: '1.4rem', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)' }}>
                                                    {item.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.15rem', marginBottom: '0.2rem' }}>{item.studentName}</p>
                                                    <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>Joined <span style={{ fontWeight: 700, color: '#4f46e5' }}>{item.courseTitle}</span></p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}><Plus size={16} strokeWidth={3} />₹{item.price.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, background: '#f1f5f9', padding: '4px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{item.date}</span>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1' }}>
                                            <Users size={48} style={{ opacity: 0.2, marginBottom: '1.5rem', margin: '0 auto' }} />
                                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No recent enrollments yet.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Actions & Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        
                        <motion.div variants={itemVariants} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem', letterSpacing: '-0.02em' }}>Action Center</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <ActionButton icon={<Plus />} label="New Course" color="#4f46e5" bg="linear-gradient(135deg, #6366f1, #4f46e5)" onClick={() => navigate('/instructor/courses')} />
                                <ActionButton icon={<Users />} label="My Students" color="#ec4899" bg="linear-gradient(135deg, #f472b6, #ec4899)" onClick={() => navigate('/instructor/students')} />
                                <ActionButton icon={<MessageSquare />} label="Announce" color="#10b981" bg="linear-gradient(135deg, #34d399, #10b981)" onClick={() => setShowAnnounceModal(true)} />
                                <ActionButton icon={<User />} label="My Profile" color="#f59e0b" bg="linear-gradient(135deg, #fbbf24, #f59e0b)" onClick={() => navigate('/instructor/profile')} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>To-Do List</h3>
                                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 900 }}>{pendingTasks.reduce((a,b)=>a+b.count,0)} Priority</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {pendingTasks.map((task, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        whileHover={{ x: 5 }}
                                        onClick={() => task.courseId && navigate(`/instructor/courses/${task.courseId}`, { state: { tab: 'gradebook' } })}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: task.bg, color: task.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                                {task.type === 'assignment' ? <FileText size={20} /> : <CheckCircle size={20} />}
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem' }}>{task.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><Clock size={14} /> Critical Review</p>
                                            </div>
                                        </div>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            {task.count}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <button style={{ width: '100%', padding: '1rem', marginTop: '2rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#64748b', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                Full Task Audit
                            </button>
                        </motion.div>

                    </div>
                </div>
            </main>

            <AnnounceModal isOpen={showAnnounceModal} onClose={() => setShowAnnounceModal(false)} user={user} />
        </div>
    );
};

const ActionButton = ({ icon, label, color, bg, onClick }) => (
    <motion.button 
        whileHover={{ translateY: -5, boxShadow: `0 15px 30px -5px ${color}40` }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1.75rem', borderRadius: '24px', background: bg, border: 'none', color: 'white', cursor: 'pointer', boxShadow: `0 10px 15px -3px ${color}25` }}
    >
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{label}</span>
    </motion.button>
);

export default InstructorDashboard;
