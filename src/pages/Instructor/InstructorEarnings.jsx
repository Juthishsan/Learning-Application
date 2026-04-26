import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { 
    Download, TrendingUp, Search, 
    ArrowUpRight, IndianRupee, CheckCircle, Users, Activity, Layers,
    PieChart, Wallet, Calendar, ArrowRight, Filter, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'];

const InstructorEarnings = () => {
    const [earningsData, setEarningsData] = useState([]);
    const [stats, setStats] = useState({ 
        grossRevenue: 0, 
        platformFee: 0, 
        netPayout: 0,
        pendingClearance: 0 
    });
    const [analyticsData, setAnalyticsData] = useState([]);
    const [courseRevenueData, setCourseRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        const fetchData = async () => {
            try {
                if (!storedUser) return;

                // 1. Fetch All Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                
                // Filter courses belonging to this instructor
                const myCourses = allCourses.filter(c => 
                    c.instructor === storedUser.name || c.instructor === storedUser.username
                );
                const myCourseIds = new Set(myCourses.map(c => c._id));
                const courseMap = {};
                myCourses.forEach(c => { courseMap[c._id] = c; });

                // 2. Fetch All Users (Enrollments)
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let grossTotal = 0;
                const revenueByMonth = {};
                const revenueByCourse = {};
                const recentTransactions = [];

                allUsers.forEach(u => {
                    if (u.enrolledCourses) {
                        u.enrolledCourses.forEach(enroll => {
                            const cId = typeof enroll.courseId === 'object' ? enroll.courseId._id : enroll.courseId;
                            
                            if (myCourseIds.has(cId)) {
                                const course = courseMap[cId];
                                const price = course.price || 0;
                                grossTotal += price;

                                // Date Aggregation
                                const date = new Date(u.createdAt);
                                const month = date.toLocaleString('default', { month: 'short' });
                                
                                if (!revenueByMonth[month]) {
                                    revenueByMonth[month] = { name: month, revenue: 0, net: 0 };
                                }
                                revenueByMonth[month].revenue += price;
                                revenueByMonth[month].net += price * 0.85;

                                // Course Aggregation
                                if (!revenueByCourse[course.title]) {
                                    revenueByCourse[course.title] = { name: course.title, value: 0 };
                                }
                                revenueByCourse[course.title].value += price * 0.85;

                                // Transactions
                                recentTransactions.push({
                                    id: u._id + cId,
                                    studentName: u.name,
                                    courseTitle: course.title,
                                    amount: price,
                                    netAmount: price * 0.85,
                                    date: date,
                                    status: 'Completed'
                                });
                            }
                        });
                    }
                });

                // Formatting and Sorting the Data
                const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const sortedAnalytics = Object.values(revenueByMonth).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));
                
                const sortedCourseRevenue = Object.values(revenueByCourse)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                const sortedTransactions = recentTransactions.sort((a, b) => b.date - a.date);

                setAnalyticsData(sortedAnalytics);
                setCourseRevenueData(sortedCourseRevenue);
                setEarningsData(sortedTransactions);
                setStats({
                    grossRevenue: grossTotal,
                    platformFee: grossTotal * 0.15,
                    netPayout: grossTotal * 0.85,
                    pendingClearance: grossTotal * 0.05 // Mock pending
                });
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch instructor earnings", err);
                toast.error("Financial data sync error");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredTransactions = earningsData.filter(t => 
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportToCSV = () => {
        if (earningsData.length === 0) {
            toast.error("No data to export");
            return;
        }
        const headers = ["Student", "Course", "Gross Amount", "Net Payout (85%)", "Date", "Status"];
        const rows = earningsData.map(t => [
            t.studentName, 
            t.courseTitle, 
            `₹${t.amount.toLocaleString()}`, 
            `₹${t.netAmount.toLocaleString()}`, 
            t.date.toLocaleDateString(), 
            t.status
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `instructor_earnings_statement_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Financial statement exported!");
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <IndianRupee size={48} color="#818cf8" />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem 4rem', overflowX: 'hidden' }}>
                
                {/* Immersive Financial Header */}
                <header style={{ marginBottom: '3.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '2.8rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>Earnings & Revenue</motion.h1>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.6rem' }}>Track your faculty income, payouts, and enrollment revenue</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}><Calendar size={18} /> Last 30 Days</button>
                            <motion.button 
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={exportToCSV}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.8rem', borderRadius: '16px', background: '#0f172a', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.15)', transition: 'all 0.2s' }}
                            >
                                <Download size={18} /> Export Statement
                            </motion.button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        <StatBox title="Gross Revenue" value={stats.grossRevenue} color="#6366f1" bg="rgba(99, 102, 241, 0.1)" icon={<Activity size={20} />} />
                        <StatBox title="Platform Fee (15%)" value={stats.platformFee} color="#f43f5e" bg="rgba(244, 63, 94, 0.1)" icon={<Layers size={20} />} />
                        <StatBox title="Net Payout (85%)" value={stats.netPayout} color="#10b981" bg="rgba(16, 185, 129, 0.1)" icon={<Wallet size={20} />} />
                        <StatBox title="Pending Clearance" value={stats.pendingClearance} color="#f59e0b" bg="rgba(245, 158, 11, 0.1)" icon={<Clock size={20} />} />
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem', marginBottom: '3.5rem' }}>
                    {/* Revenue Area Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>Income Growth</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#818cf8' }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Gross</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Net</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData}>
                                    <defs>
                                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px', fontWeight: 600}} tickFormatter={(v) => `₹${v}`} />
                                    <RechartsTooltip 
                                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', padding: '15px 20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ fontWeight: 800, fontSize: '0.95rem' }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fill="transparent" />
                                    <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Revenue by Course Pie */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ background: '#0f172a', padding: '2.5rem', borderRadius: '32px', color: 'white', display: 'flex', flexDirection: 'column' }}
                    >
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2.5rem' }}>Revenue Share</h3>
                        <div style={{ flex: 1, minHeight: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={courseRevenueData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                                        {courseRevenueData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} 
                                        itemStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue Share']}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                            {courseRevenueData.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>₹{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Transaction History */}
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)' }}>
                    <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: 0 }}>Recent Payouts</h3>
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500, marginTop: '0.3rem' }}>A detailed ledger of all course enrollments and payouts</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search student or course..." 
                                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: 500 }} 
                                />
                            </div>
                            <button style={{ padding: '0.85rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}><Filter size={18} /></button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Learner</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Course Program</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Gross / Net</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Date</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'right', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((t, i) => (
                                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                        <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0f172a', border: '1px solid #e2e8f0' }}>{t.studentName.charAt(0)}</div>
                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.studentName}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#475569' }}>{t.courseTitle}</td>
                                        <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: 800, color: '#0f172a' }}>₹{t.netAmount.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{t.amount.toLocaleString()}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{t.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#dcfce7', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>{t.status}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatBox = ({ title, value, color, bg, icon }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: bg, color: color, padding: '0.6rem', borderRadius: '12px' }}>{icon}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>₹{value.toLocaleString()}</div>
    </motion.div>
);

export default InstructorEarnings;
