
import { motion } from 'framer-motion';
import { BookOpen, Users, IndianRupee, TrendingUp, Star, Plus } from 'lucide-react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div 
        variants={itemVariants}
        style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)', 
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: `${color}15`, 
            color: color, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            {icon}
        </div>
        <div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</h3>
            {trend && <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>{trend} <TrendingUp size={14} /></span>}
        </div>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, borderRadius: '50%' }}></div>
    </motion.div>
);

const InstructorDashboard = () => {
    const [stats, setStats] = useState({ revenue: 0, students: 0, rating: 0, courses: 0 });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
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
                const myCourses = allCourses.filter(c => c.instructor === storedUser.name);

                // 2. Fetch Users to calculate enrollments
                const usersRes = await fetch('http://localhost:5000/api/admin/users'); // Using admin endpoint for now
                const allUsers = await usersRes.json();

                let totalRevenue = 0;
                let uniqueStudentIds = new Set();
                let recent = [];

                allUsers.forEach(u => {
                    if (u.enrolledCourses && u.enrolledCourses.length > 0) {
                        u.enrolledCourses.forEach(enrollment => {
                            // Detailed check for course ID match
                            const courseIdStr = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            const myCourse = myCourses.find(c => c._id === courseIdStr);
                            
                            if (myCourse) {
                                totalRevenue += myCourse.price;
                                uniqueStudentIds.add(u._id);
                                recent.push({
                                    id: u._id + myCourse._id, // Unique Key
                                    studentName: u.name,
                                    courseTitle: myCourse.title,
                                    price: myCourse.price,
                                });
                            }
                        });
                    }
                });

                setStats({
                    revenue: totalRevenue,
                    students: uniqueStudentIds.size,
                    rating: 4.8, // Static for now
                    courses: myCourses.length
                });

                setRecentEnrollments(recent.reverse().slice(0, 5)); // Show newest first

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={28} />, color: '#10b981', trend: '+12.5%' },
        { title: 'Active Students', value: stats.students, icon: <Users size={28} />, color: '#6366f1', trend: '+5.2%' },
        { title: 'Course Rating', value: stats.rating, icon: <Star size={28} fill="currentColor" />, color: '#f59e0b', trend: '+0.2' },
        { title: 'Total Courses', value: stats.courses, icon: <BookOpen size={28} />, color: '#ec4899' },
    ];

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Welcome back, {user.name}!</p>
                    </div>
                    <Link to="/instructor/courses" className="btn btn-primary" style={{ 
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                        padding: '0.9rem 1.5rem', 
                        borderRadius: '12px', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                        color: 'white',
                        textDecoration: 'none'
                    }}>
                        <Plus size={20} /> Manage Courses
                    </Link>
                </header>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={dashboardVariants}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}
                >
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Recent Sales / Activity */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Recent Enrollments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentEnrollments.length > 0 ? recentEnrollments.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                                            {item.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{item.studentName}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Enrolled in {item.courseTitle}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>+₹{item.price}</span>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No enrollments yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats / Mini Chart Placeholder */}
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '16px', padding: '2rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instructor Pro Tip</h3>
                            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>Engage with your students by replying to their Q&A questions. Active instructors earn 20% more on average.</p>
                        </div>
                        <button style={{ 
                            background: 'rgba(255,255,255,0.15)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            color: 'white', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            marginTop: '2rem'
                        }}>
                             View Guidelines
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
