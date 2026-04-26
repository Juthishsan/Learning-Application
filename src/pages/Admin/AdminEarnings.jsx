import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
    Download, TrendingUp, Search, 
    ArrowUpRight, IndianRupee, CheckCircle, Users, Activity, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'];

const AdminEarnings = () => {
    const [earningsData, setEarningsData] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, instructorPayouts: 0, platformProfit: 0 });
    const [analyticsData, setAnalyticsData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch All Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                
                const courseMap = {};
                allCourses.forEach(c => { courseMap[c._id] = c; });

                // 2. Fetch All Users (Enrollments)
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let platformTotal = 0;
                
                const revenueByMonth = {};
                const revenueByCategory = {};
                const instructorMap = {};

                allUsers.forEach(u => {
                    if (u.enrolledCourses) {
                        u.enrolledCourses.forEach(enroll => {
                            const cId = typeof enroll.courseId === 'object' ? enroll.courseId._id : enroll.courseId;
                            const course = courseMap[cId];

                            if (course) {
                                const price = course.price || 0;
                                platformTotal += price;

                                // Date Aggregation
                                const date = new Date(u.createdAt);
                                const month = date.toLocaleString('default', { month: 'short' });
                                
                                if (!revenueByMonth[month]) {
                                    revenueByMonth[month] = { name: month, revenue: 0, payouts: 0 };
                                }
                                revenueByMonth[month].revenue += price;
                                revenueByMonth[month].payouts += price * 0.85;

                                // Category Aggregation
                                const cat = course.category || 'Uncategorized';
                                if (!revenueByCategory[cat]) revenueByCategory[cat] = { name: cat, value: 0 };
                                revenueByCategory[cat].value += price;

                                // Instructor Aggregation
                                if (!instructorMap[course.instructor]) {
                                    instructorMap[course.instructor] = {
                                        name: course.instructor,
                                        revenue: 0,
                                        students: new Set(),
                                        courses: 0
                                    };
                                }
                                instructorMap[course.instructor].revenue += price;
                                instructorMap[course.instructor].students.add(u._id);
                            }
                        });
                    }
                });

                // Formatting and Sorting the Data
                const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const sortedAnalytics = Object.values(revenueByMonth).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));
                
                const sortedCategories = Object.values(revenueByCategory)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // Top 5 Categories

                // Counting total courses per instructor accurately
                allCourses.forEach(c => {
                    if (instructorMap[c.instructor]) {
                        instructorMap[c.instructor].courses += 1;
                    }
                });

                const earningsList = Object.values(instructorMap).map(inst => ({
                    ...inst,
                    students: inst.students.size,
                    paid: inst.revenue * 0.85 
                }));

                setAnalyticsData(sortedAnalytics);
                setCategoryData(sortedCategories);
                setEarningsData(earningsList);
                setStats({
                    totalRevenue: platformTotal,
                    instructorPayouts: platformTotal * 0.85,
                    platformProfit: platformTotal * 0.15
                });
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch admin earnings", err);
                toast.error("Financial data sync error");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredEarnings = earningsData.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <IndianRupee size={48} color="#6366f1" />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
                
                {/* Immersive Financial Header */}
                <header style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>Finance and Analytics</motion.h1>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Centralized oversight of platform liquidity and instructor payouts</p>
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.8rem', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}><Download size={18} /> Export Ledger</button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            background: '#0f172a',
                            borderRadius: '32px',
                            padding: '3rem 3.5rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            gap: '3rem',
                            alignItems: 'center'
                        }}
                    >
                        {/* Abstract glowing backgrounds */}
                        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
                        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />

                        {/* Section 1: Gross Revenue */}
                        <div style={{ paddingRight: '3rem', borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', color: '#94a3b8' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}><IndianRupee size={22} color="#818cf8" /></div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Gross Platform Volume</span>
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1 }}>₹{(stats.totalRevenue || 0).toLocaleString()}</div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                 <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={14} /> +18.4%</span>
                                 <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>monthly run rate</span>
                            </div>
                        </div>

                        {/* Section 2: Instructor Earnings */}
                        <div style={{ padding: '0 1rem', borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', color: '#94a3b8' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}><Users size={22} color="#34d399" /></div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Instructor Payouts</span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white', lineHeight: 1 }}>₹{(stats.instructorPayouts || 0).toLocaleString()}</div>
                            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>85% Revenue Share</span>
                            </div>
                        </div>

                        {/* Section 3: Platform Profit */}
                        <div style={{ paddingLeft: '1rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', color: '#94a3b8' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}><Activity size={22} color="#fbbf24" /></div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Platform Net Fee</span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fbbf24', lineHeight: 1 }}>₹{(stats.platformProfit || 0).toLocaleString()}</div>
                            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>15% Commission Rate</span>
                            </div>
                        </div>

                    </motion.div>
                </header>

                {/* Analytics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
                    
                    {/* Financial Trends Area Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3 }}
                        style={{ gridColumn: 'span 8', background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                             <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Activity size={22} color="#6366f1" /> Revenue vs Payout Analytics
                             </h3>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.length > 0 ? analyticsData : [{name: 'Loading', revenue: 0, payouts: 0}]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} tickFormatter={(value) => `₹${value}`} />
                                    <RechartsTooltip 
                                        wrapperStyle={{ zIndex: 100 }}
                                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', padding: '15px 20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ fontWeight: 800, fontSize: '0.95rem' }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}
                                        formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'revenue' ? 'Gross Revenue' : 'Instructor Payouts']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorGross)" />
                                    <Area type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPayouts)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Category Revenue Distribution */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 }}
                        style={{ gridColumn: 'span 4', background: '#0f172a', padding: '2.5rem', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Layers size={22} color="#818cf8" /> Revenue by Category
                        </h3>
                        
                        {categoryData.length > 0 ? (
                            <>
                                <div style={{ width: '100%', height: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                wrapperStyle={{ zIndex: 100 }}
                                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                                itemStyle={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                            />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                    {categoryData.slice(0, 3).map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{item.name}</span>
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>₹{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', height: '220px', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 600 }}>
                                No revenue data available
                            </div>
                        )}
                    </motion.div>

                </div>

                {/* Instructor Revenue Directory */}
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Instructor Settlements</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem' }}>Individual faculty revenue breakdown and clearance</p>
                        </div>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by faculty name..." 
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: 500 }} 
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Instructor</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Inventory</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Total Learners</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Gross Revenue</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'right', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredEarnings.map((inst, i) => (
                                        <motion.tr 
                                            key={i} 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            transition={{ delay: i * 0.05 }}
                                            style={{ transition: 'background 0.2s' }}
                                        >
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0f172a', border: '1px solid #e2e8f0' }}>{inst.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{inst.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Active Faculty</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ fontWeight: 700, color: '#475569' }}>{inst.courses} Programs</span>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Users size={16} color="#94a3b8" />
                                                    <span style={{ fontWeight: 700, color: '#475569' }}>{inst.students.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: 900, color: '#10b981', fontSize: '1.1rem' }}>₹{inst.revenue.toLocaleString()}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                <button style={{ padding: '0.6rem 1.5rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>Authorize Payout</button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {!loading && filteredEarnings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                            <div style={{ color: '#94a3b8', fontWeight: 600 }}>No faculty members matching your search.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminEarnings;
