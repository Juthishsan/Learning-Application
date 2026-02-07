import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Users, CheckCircle, Award, Video, FileText, Lock, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/courses/${id}`);
                const data = await res.json();
                setCourse(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch course details", err);
                setLoading(false);
            }
        };

        const checkEnrollment = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                try {
                    const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses`);
                    const data = await res.json();
                    const isEnrolledCheck = data.some(enrollment => (enrollment.courseId?._id === id || enrollment.courseId === id));
                    setIsEnrolled(isEnrolledCheck);
                } catch (err) {
                    console.error("Failed to check enrollment");
                }
            }
        };

        fetchCourse();
        checkEnrollment();
    }, [id]);

    const handleEnroll = async () => {
        if (isEnrolled) {
            navigate(`/course-content/${id}`);
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            toast('Please login to enroll!', { icon: '🔒' });
            navigate('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        setEnrolling(true);

        try {
            const res = await fetch('http://localhost:5000/api/users/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, courseId: id })
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Enrolled Successfully!');
                setIsEnrolled(true);
                navigate(`/course-content/${id}`);
            } else {
                toast.error(data.msg || 'Enrollment failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner"></div></div>;
    if (!course) return <div style={{ padding: '4rem', textAlign: 'center' }}>Course not found</div>;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Hero Section */}
            <div style={{ background: '#0f172a', color: 'white', padding: '5rem 0 10rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(14, 165, 233, 0.2), transparent 50%)' }}></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                            <span style={{ color: '#38bdf8' }}>{course.category}</span>
                            <span style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%', opacity: 0.5 }}></span>
                            <span>Last updated Jan 2026</span>
                        </div>
                        
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {course.title}
                        </h1>
                        
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6, maxWidth: '90%' }}>
                            {course.description}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ display: 'flex' }}>
                                    {[1,2,3,4,5].map(star => <Star key={star} size={20} fill="#fbbf24" stroke="#fbbf24" />)}
                                </div>
                                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{course.rating}</span>
                                <span style={{ color: '#94a3b8' }}>(1,240 ratings)</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0' }}>
                                <Users size={20} />
                                <span>4,800 students enrolled</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                {course.instructor.charAt(0)}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.1rem' }}>Created by</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{course.instructor}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section with Sticky Sidebar */}
            <div className="container" style={{ marginTop: '-120px', position: 'relative', zIndex: 10, paddingBottom: '5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                    
                    {/* Left Column: Course Details */}
                    <div>
                        {/* What you'll learn */}
                        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>What you'll learn</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {['Master the core concepts', 'Build real-world projects', 'Understand advanced patterns', 'Get job-ready skills', 'Best practices & Design patterns', 'Deployment & CI/CD'].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '1rem', color: '#334155' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content Preview (Locked) */}
                        <div className="card" style={{ padding: '2.5rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>Course Content</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                <span>{course.content?.length || 0} lessons</span>
                                <span>•</span>
                                <span>12h 30m total length</span>
                            </div>

                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                {course.content && course.content.length > 0 ? (
                                    course.content.map((item, idx) => (
                                        <div key={idx} style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: idx % 2 === 0 ? '#f8fafc' : 'white', opacity: isEnrolled ? 1 : 0.7 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.type === 'video' ? <PlayCircle size={16} color="#64748b" /> : <FileText size={16} color="#64748b" />}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.title}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.type === 'video' ? 'Video' : 'Resource'}</span>
                                                </div>
                                            </div>
                                            
                                            {isEnrolled ? (
                                                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Unlocked</span>
                                            ) : (
                                                <Lock size={16} color="#94a3b8" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No content details available for preview.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Enrollment Card (Sticky) */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' }}>
                            
                            {/* Check if video exists for preview */}
                            <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', height: '180px', background: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PlayCircle size={64} color="white" style={{ opacity: 0.9 }} />
                                <div style={{ position: 'absolute', bottom: '1rem', width: '100%', textAlign: 'center', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>Preview this course</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>₹{course.price}</h2>
                                <span style={{ fontSize: '1.25rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{(course.price * 1.5).toFixed(2)}</span>
                                <span style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700, marginLeft: 'auto' }}>33% OFF</span>
                            </div>
                            
                            <button 
                                onClick={handleEnroll}
                                disabled={enrolling}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    fontSize: '1.1rem', 
                                    fontWeight: 700,
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isEnrolled ? '#10b981' : '#2563eb',
                                    color: 'white',
                                    marginBottom: '1rem',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                }}
                            >
                                {enrolling ? 'Processing...' : (isEnrolled ? 'Go to Course' : 'Enroll Now')}
                            </button>
                            
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>30-Day Money-Back Guarantee</p>
                            
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>This course includes:</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {[
                                        { icon: Video, text: '12.5 hours on-demand video' },
                                        { icon: FileText, text: '15 downloadable resources' },
                                        { icon: Clock, text: 'Full lifetime access' },
                                        { icon: Award, text: 'Certificate of completion' }
                                    ].map((feat, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                            <feat.icon size={18} /> {feat.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <Link to="/contact" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Have questions? Contact Us</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
            @media (max-width: 900px) {
                div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                .container { margin-top: 0 !important; }
            }
            `}</style>
        </div>
    );
};

export default CourseOverview;
