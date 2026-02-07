
import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Search, MoreHorizontal, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) return;

                // 1. Get My Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses');
                const allCourses = await coursesRes.json();
                const myCourses = allCourses.filter(c => c.instructor === user.name);
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
                                    id: u._id + courseId, // Unique for this view
                                    name: u.name,
                                    email: u.email,
                                    course: course.title,
                                    progress: enrollment.progress || 0,
                                    joined: new Date(u.createdAt).toLocaleDateString() // Using user join date as proxy if enrollment date missing
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

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>My Students</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track progress and engagement</p>
                    </div>
                </header>

                <div className="card" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                placeholder="Search by name or email..." 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.6rem 1rem 0.6rem 2.5rem', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    background: '#f8fafc',
                                    fontSize: '0.9rem'
                                }} 
                            />
                        </div>
                        <div style={{ flex: 1 }}></div>
                        <button style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>Export CSV</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Course</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Progress</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                            
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</td></tr>
                            ) : students.length > 0 ? (
                                students.map((student, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{student.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{student.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: 500 }}>{student.course}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '100px' }}>
                                                    <div style={{ width: `${student.progress}%`, height: '100%', background: student.progress === 100 ? '#10b981' : '#6366f1', borderRadius: '3px' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{student.joined}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No students enrolled yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default InstructorStudents;
