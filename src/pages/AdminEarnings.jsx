
import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Download, TrendingUp, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminEarnings = () => {
    const [earningsData, setEarningsData] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, pendingPayouts: 0, completedPayouts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch All Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                
                // Map Course ID -> Course Obj (with instructor name/price)
                const courseMap = {};
                const instructorMap = {}; // Name -> { revenue, students set, courses count }

                allCourses.forEach(c => {
                    courseMap[c._id] = c;
                    if (!instructorMap[c.instructor]) {
                        instructorMap[c.instructor] = {
                            name: c.instructor,
                            revenue: 0,
                            students: new Set(),
                            courses: 0
                        };
                    }
                    instructorMap[c.instructor].courses += 1;
                });

                // 2. Fetch All Users (Enrollments)
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                let platformTotal = 0;

                allUsers.forEach(u => {
                    if (u.enrolledCourses) {
                        u.enrolledCourses.forEach(enrollment => {
                            const cId = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            const course = courseMap[cId];

                            if (course) {
                                const price = course.price || 0;
                                platformTotal += price;
                                
                                // Credit Instructor
                                if (instructorMap[course.instructor]) {
                                    instructorMap[course.instructor].revenue += price;
                                    instructorMap[course.instructor].students.add(u._id);
                                }
                            }
                        });
                    }
                });

                // Convert Map to Array
                const earningsList = Object.values(instructorMap).map(inst => ({
                    ...inst,
                    students: inst.students.size,
                    pending: inst.revenue * 0.1, // Mock pending (e.g., 10% kept as platform fee or pending clearance)
                    paid: inst.revenue * 0.9 // Mock paid
                }));

                setEarningsData(earningsList);
                setStats({
                    totalRevenue: platformTotal,
                    pendingPayouts: platformTotal * 0.1, // Mock
                    completedPayouts: platformTotal * 0.9 // Mock
                });
                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch admin earnings", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Financial Overview</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Monitor platform revenue and instructor payouts</p>
                    </div>
                    <button style={{ 
                        padding: '0.75rem 1.25rem', 
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: '#475569', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}>
                        <Download size={18} /> Export Report
                    </button>
                </header>

                {/* Platform Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px', boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.3)' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 500 }}>Total Platform Revenue</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>₹{stats.totalRevenue.toLocaleString()}</h2>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', width: '100%' }}>
                            <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Pending Payouts</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>₹{stats.pendingPayouts.toLocaleString()}</h2>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#f59e0b', background: '#fffbeb', padding: '0.25rem 0.75rem', borderRadius: '999px', width: 'fit-content', fontWeight: 600 }}>Processing</span>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Completed Payouts</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>₹{stats.completedPayouts.toLocaleString()}</h2>
                        </div>
                         <span style={{ fontSize: '0.85rem', color: '#10b981', background: '#f0fdf4', padding: '0.25rem 0.75rem', borderRadius: '999px', width: 'fit-content', fontWeight: 600 }}>All time</span>
                    </div>
                </div>

                {/* Instructor Table */}
                <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Instructor Earnings</h3>
                        <div style={{ position: 'relative', width: '250px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input placeholder="Search instructors..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>INSTRUCTOR</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>COURSES</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>STUDENTS</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>TOTAL REVENUE</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading financials...</td></tr> : 
                             earningsData.length > 0 ? earningsData.map((inst, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#1e293b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                {inst.name.charAt(0)}
                                            </div>
                                            {inst.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{inst.courses}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{inst.students}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₹{inst.revenue.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Manage Payout</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No earnings data found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminEarnings;
