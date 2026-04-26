import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Search, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) return;

                // 1. Get My Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                const myCourses = allCourses.filter(c => c.instructor === user.name || c.instructor === user.username);
                const myCourseIds = new Set(myCourses.map(c => c._id));

                // 2. Get All Users
                const usersRes = await fetch('http://localhost:5000/api/admin/users');
                const allUsers = await usersRes.json();

                // 3. Filter Students
                const enrolledStudents = [];

                allUsers.forEach(u => {
                    if (u.enrolledCourses && u.enrolledCourses.length > 0) {
                        u.enrolledCourses.forEach(enrollment => {
                            const courseId = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
                            
                            if (myCourseIds.has(courseId)) {
                                const course = myCourses.find(c => c._id === courseId);
                                enrolledStudents.push({
                                    id: u._id + courseId,
                                    name: u.name,
                                    email: u.email,
                                    course: course.title,
                                    progress: enrollment.progress || 0,
                                    joined: new Date(u.createdAt).toLocaleDateString()
                                });
                            }
                        });
                    }
                });

                setStudents(enrolledStudents);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch students", err);
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const exportToCSV = () => {
        if (students.length === 0) {
            toast.error("No data to export");
            return;
        }
        const headers = ["Name", "Email", "Course", "Progress", "Joined Date"];
        const rows = students.map(s => [s.name, s.email, s.course, `${s.progress}%`, s.joined]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `student_engagement_report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Engagement report exported!");
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem 4rem' }}>
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
                >
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>Student Matrix</h1>
                        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.15rem', fontWeight: 500 }}>Global oversight of learner engagement and academic progression</p>
                    </div>
                </motion.header>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ background: 'white', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}
                >
                    {/* Immersive Toolbar */}
                    <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search student name, email or course..." 
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem 1.25rem 1rem 3.5rem', 
                                    borderRadius: '18px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    background: 'white',
                                    fontSize: '1rem',
                                    color: '#0f172a',
                                    fontWeight: 500,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} 
                                onFocus={(e) => { e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 10px 15px -3px rgba(129, 140, 248, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                            />
                        </div>
                        <div style={{ flex: 1 }}></div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <motion.button 
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={exportToCSV}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    padding: '0.9rem 1.8rem', 
                                    background: '#0f172a', 
                                    border: 'none', 
                                    borderRadius: '16px', 
                                    color: 'white', 
                                    fontWeight: 800, 
                                    cursor: 'pointer', 
                                    fontSize: '0.95rem',
                                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)'
                                }}
                            >
                                <ExternalLink size={18} /> Export Data
                            </motion.button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0' }}>Student Profile</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0' }}>Program Enrollment</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0' }}>Retention Score</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Join Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <p style={{ color: '#64748b', fontWeight: 600 }}>Syncing student database...</p>
                                        </div>
                                    </td></tr>
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, i) => (
                                        <motion.tr 
                                            key={student.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: '1px solid #f1f5f9' }}
                                        >
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.1)' }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1rem' }}>{student.course}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Active Scholar</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '12px', width: '150px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${student.progress}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            style={{ height: '100%', background: student.progress === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '12px' }} 
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: student.progress === 100 ? '#10b981' : '#0f172a', minWidth: '45px' }}>{student.progress}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 700, background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>{student.joined}</span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <div style={{ color: '#94a3b8' }}>
                                            <Search size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                            <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>No scholars matching your criteria.</p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default InstructorStudents;
