
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Users, BookOpen, Activity, TrendingUp, Calendar, ArrowUpRight, Shield, Bell, Search, Filter, MoreHorizontal, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        totalCourses: 0, 
        totalEnrollments: 0,
        totalInstructors: 0,
        userGrowth: [],
        revenueGrowth: [],
        courseDistribution: []
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [activeChart, setActiveChart] = useState('students');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const instRes = await fetch('http://localhost:5000/api/instructors');
                const instData = await instRes.json();
                const statsRes = await fetch('http://localhost:5000/api/admin/stats');
                const statsData = await statsRes.json();
                
                if(statsData.userGrowth) {
                     statsData.userGrowth.map(item => {
                        const date = new Date(item._id + '-01'); 
                        item.name = date.toLocaleString('default', { month: 'short' });
                        return item;
                     });
                     
                     statsData.revenueGrowth = statsData.userGrowth.map(item => ({
                         name: item.name,
                         count: (item.count * 150) + Math.floor(Math.random() * 250)
                     }));
                }
                
                setStats({
                    ...statsData,
                    totalInstructors: instData.length
                });

                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const usersData = await usersRes.json();
                setRecentUsers(usersData.reverse().slice(0, 5));

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchDashboardData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const metricCards = [
        { title: 'Total Students', value: stats.totalUsers, icon: <Users />, color: '#6366f1', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', trend: '+12.5%' },
        { title: 'Course Catalog', value: stats.totalCourses, icon: <BookOpen />, color: '#0ea5e9', bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', trend: '+3 New' },
        { title: 'Enrollments', value: stats.totalEnrollments, icon: <Activity />, color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', trend: '+8.2%' },
        { title: 'Instructors', value: stats.totalInstructors, icon: <Shield />, color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', trend: 'Active' },
    ];

    const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem 3.5rem', overflowX: 'hidden' }}>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}
                >
                    <div>
                        <h1 style={{ fontSize: '2.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>Command Center</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Global platform metrics and operational oversight</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                style={{ padding: '0.85rem 1rem 0.85rem 2.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', width: '260px', background: 'white', fontWeight: 500, fontSize: '0.9rem', outline: 'none' }} 
                            />
                        </div>
                        <button style={{ height: '48px', padding: '0 1.25rem', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                            <Calendar size={18} color="#6366f1" />
                            <span>Last 30 Days</span>
                        </button>
                    </div>
                </motion.div>
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}
                >
                    {metricCards.map((card, idx) => (
                        <motion.div 
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ translateY: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}
                            style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden', cursor: 'default' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>{card.title}</p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{card.value}</h3>
                                </div>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 12px 20px -8px ${card.color}40` }}>
                                    {card.icon}
                                </div>
                            </div>
                            <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <TrendingUp size={14} /> {card.trend}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>vs previous month</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
                    <motion.div 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ gridColumn: 'span 8', background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                             <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <TrendingUp size={22} color="#6366f1" /> Acquisition Trends
                             </h3>
                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => setActiveChart('students')}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: activeChart === 'students' ? '#eff6ff' : 'transparent', color: activeChart === 'students' ? '#2563eb' : '#64748b', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Students
                                </button>
                                <button 
                                    onClick={() => setActiveChart('revenue')}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: activeChart === 'revenue' ? '#f0fdf4' : 'transparent', color: activeChart === 'revenue' ? '#16a34a' : '#64748b', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Revenue
                                </button>
                             </div>
                        </div>
                        <div style={{ width: '100%', height: '380px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activeChart === 'students' ? stats.userGrowth : stats.revenueGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} tickFormatter={(value) => activeChart === 'revenue' ? `₹${value}` : value} />
                                    <Tooltip 
                                        wrapperStyle={{ zIndex: 100 }}
                                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: 'white', padding: '15px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                                        itemStyle={{ color: activeChart === 'students' ? '#818cf8' : '#34d399', fontWeight: 800 }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}
                                        formatter={(value) => [activeChart === 'revenue' ? `₹${value}` : value, activeChart === 'revenue' ? 'Revenue' : 'Students']}
                                    />
                                    <Area type="monotone" dataKey="count" stroke={activeChart === 'students' ? "#6366f1" : "#10b981"} strokeWidth={4} fillOpacity={1} fill={`url(#${activeChart === 'students' ? 'colorStudents' : 'colorRevenue'})`} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ gridColumn: 'span 4', background: '#0f172a', padding: '2.5rem', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <BookOpen size={22} color="#0ea5e9" /> Category Mix
                        </h3>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.courseDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {stats.courseDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        wrapperStyle={{ zIndex: 100 }}
                                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            {stats.courseDistribution?.slice(0, 4).map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <motion.div 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Platform Activity</h3>
                            <motion.button whileHover={{ x: 5 }} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Full Audit <ArrowRight size={18} /></motion.button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {stats.recentActivity && stats.recentActivity.length > 0 ? stats.recentActivity.map((log, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: idx !== stats.recentActivity.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ minWidth: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                        <Activity size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>{log.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }} />
                                            <span style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 700 }}>{log.action}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px' }}>
                                    <Activity size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p style={{ fontWeight: 600 }}>No recent activity to display.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Recent Registrations</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {recentUsers.length > 0 ? recentUsers.map(user => (
                                <motion.div 
                                    key={user._id} 
                                    whileHover={{ x: 5 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderRadius: '20px', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{user.name}</div>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                padding: '2px 8px', 
                                                borderRadius: '8px', 
                                                background: user.role === 'instructor' ? '#e0e7ff' : user.role === 'admin' ? '#ffedd5' : '#dcfce7',
                                                color: user.role === 'instructor' ? '#4338ca' : user.role === 'admin' ? '#c2410c' : '#15803d',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{user.email}</div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No recent users found.</div>
                            )}
                        </div>
                        <button style={{ width: '100%', padding: '1rem', marginTop: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>Manage All Users</button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
