import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Users, BookOpen, Activity, TrendingUp, Calendar, ArrowUpRight, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        totalCourses: 0, 
        totalEnrollments: 0,
        totalInstructors: 0,
        userGrowth: [],
        courseDistribution: []
    });
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Instructors separately
                const instRes = await fetch('http://localhost:5000/api/instructors');
                const instData = await instRes.json();
                
                // Fetch Stats
                const statsRes = await fetch('http://localhost:5000/api/admin/stats');
                const statsData = await statsRes.json();
                
                // Format userGrowth for graph
                if(statsData.userGrowth) {
                     statsData.userGrowth.map(item => {
                        const date = new Date(item._id + '-01'); 
                        item.name = date.toLocaleString('default', { month: 'short' });
                        return item;
                     });
                }
                
                // Update stats with instructor count
                setStats({
                    ...statsData,
                    totalInstructors: instData.length
                });

                // Fetch Recent Users
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const usersData = await usersRes.json();
                setRecentUsers(usersData.reverse().slice(0, 5));

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchDashboardData();
    }, []);

    const cards = [
        { 
            title: 'Total Students', 
            value: stats.totalUsers, 
            icon: <Users size={28} color="#ffffff" />, 
            gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            shadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
            change: '+12%' 
        },
        { 
            title: 'Total Courses', 
            value: stats.totalCourses, 
            icon: <BookOpen size={28} color="#ffffff" />, 
            gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', 
            shadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
            change: '+3 new' 
        },
        { 
            title: 'Active Enrollments', 
            value: stats.totalEnrollments, 
            icon: <Activity size={28} color="#ffffff" />, 
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            shadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
            change: '+5%' 
        },
        { 
            title: 'Instructors', 
            value: stats.totalInstructors, 
            icon: <Shield size={28} color="#ffffff" />, 
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            shadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
            change: 'Active' 
        }
    ];

    const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Welcome back, Administrator</p>
                    </div>
                    <div>
                        <button className="btn" style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            <Calendar size={18} /> Last 30 Days
                        </button>
                    </div>
                </div>
                
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    {cards.map((card, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.title}</p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{card.value}</h3>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: card.shadow }}>
                                    {card.icon}
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                                <span style={{ background: '#ecfdf5', padding: '0.3rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ArrowUpRight size={14} /> {card.change}
                                </span>
                                <span style={{ color: '#94a3b8', fontWeight: 500 }}>from last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                    
                    {/* Growth Chart (Width: 8/12) */}
                    <div style={{ gridColumn: 'span 8', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                             <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>User Growth Analytics</h3>
                             <div style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Year 2024</div>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.userGrowth} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px'}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px'}} />
                                    <Tooltip 
                                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: 'white', padding: '12px' }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Course Popularity Pie Chart (Width: 4/12) */}
                    <div style={{ gridColumn: 'span 4', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Popular Courses</h3>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.courseDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.courseDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} itemStyle={{ color: 'white' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Activity Log & Recent Students */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
                    
                    {/* Recent Activity Log (Width: 7/12) */}
                    <div style={{ gridColumn: 'span 7', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Recent Activity</h3>
                            <button style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {stats.recentActivity && stats.recentActivity.length > 0 ? stats.recentActivity.map((log, idx) => {
                                let iconColor = '#64748b';
                                let bg = '#f1f5f9';
                                if (log.action.includes('USER')) { iconColor = '#6366f1'; bg='#e0e7ff'; }
                                if (log.action.includes('COURSE')) { iconColor = '#0ea5e9'; bg='#e0f2fe'; }
                                if (log.action.includes('CONTENT')) { iconColor = '#10b981'; bg='#dcfce7'; }

                                return (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{log.description}</p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>No recent activity logged yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Students (Width: 5/12) */}
                    <div style={{ gridColumn: 'span 5', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>New Students</h3>
                            <button style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentUsers.length > 0 ? recentUsers.map(user => (
                                <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b', fontSize: '1.1rem' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{user.email}</div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )) : <p style={{ color: '#94a3b8' }}>No recent users</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
