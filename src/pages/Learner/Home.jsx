import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, PlayCircle, Zap, Sparkles, Star, Code, Database, Palette, Briefcase, Megaphone, Camera, Target, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import CourseCard from '../../components/Common/CourseCard';

const Hero = () => {
    return (
        <section style={{ 
            padding: '0', 
            position: 'relative', 
            overflow: 'hidden',
            height: '100vh',
            minHeight: '700px',
            display: 'flex',
            alignItems: 'center',
            background: '#0f172a' // Fallback color
        }}>
            
            {/* Background Image Container */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
            }}>
                <img 
                    src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2670&auto=format&fit=crop" 
                    alt="Man working on laptop" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center', 
                    }}
                />
                {/* Gradient Overlay for Text Readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #0f172a 0%, rgba(15, 23, 42, 0.95) 35%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%)'
                }}></div>
            </div>

            <div className="container" style={{ 
                position: 'relative', 
                zIndex: 10,
                width: '100%'
            }}>
                
                {/* Text Content - Focused on the Left */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '650px' }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1rem', 
                        background: 'rgba(99, 102, 241, 0.15)', 
                        color: '#818cf8', 
                        borderRadius: '999px', 
                        fontWeight: 600, 
                        fontSize: '0.875rem', 
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <Zap size={16} fill="#818cf8" /> 
                        <span>Smart Learning Evolved</span>
                    </div>

                    <h1 style={{ 
                        fontSize: '4rem', 
                        lineHeight: '1.1', 
                        fontWeight: 800, 
                        marginBottom: '1.5rem', 
                        color: 'white',
                        letterSpacing: '-1px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        Master New Skills with <br />
                        <span style={{ 
                            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>
                            AI-Driven Precision
                        </span>
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.25rem', 
                        lineHeight: '1.7', 
                        color: '#cbd5e1', 
                        marginBottom: '3rem', 
                        maxWidth: '580px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                        Unlock your potential with personalized learning paths, real-time AI mentorship, and interactive projects designed for the modern world.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/courses" style={{ 
                            padding: '1rem 2.5rem', 
                            fontSize: '1.1rem', 
                            fontWeight: 600, 
                            color: 'white', 
                            background: '#4f46e5', 
                            borderRadius: '12px', 
                            textDecoration: 'none',
                            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #4f46e5'
                        }}>
                            Get Started <ArrowRight size={20} />
                        </Link>
                        <Link to="/about" style={{ 
                            padding: '1rem 2.5rem', 
                            fontSize: '1.1rem', 
                            fontWeight: 600, 
                            color: 'white', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px', 
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <PlayCircle size={20} /> How It Works
                        </Link>
                    </div>

                    <div style={{ marginTop: '5rem', display: 'flex', gap: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <div>
                            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>1k+</h4>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Students</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>50+</h4>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Expert Instructors</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>4.9</h4>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {[1,2,3,4,5].map(i => <div key={i} style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></div>)}
                                <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, marginLeft: '8px' }}>Rating</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                {/* No Right Side Graphic Needed - Image does the work */}

            </div>
        </section>
    );
};

const Features = () => {
    return (
        <section style={{ padding: '8rem 2rem', background: '#f8fafc' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 5rem auto' }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>The EroSkillUp Advantage</div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Why Choose EroSkillUp?</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1.6 }}>We combine cutting-edge technology with expert-led pedagogy to deliver a learning experience that truly works.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {[
                        { icon: Award, title: "Industry-Recognized Certificates", desc: "Earn certificates that are valued by top employers worldwide. Showcase your skills directly on LinkedIn.", color: "#4f46e5", bg: "#e0e7ff" },
                        { icon: Users, title: "Collaborative Learning", desc: "Join a global community of learners. Participate in peer reviews, group projects, and live discussions.", color: "#10b981", bg: "#dcfce7" },
                        { icon: Zap, title: "AI-Powered Recommendations", desc: "Get personalized course suggestions based on your learning style, goals, and current skill gaps.", color: "#f59e0b", bg: "#fef3c7" },
                        { icon: Target, title: "Hands-on Projects", desc: "Build real-world applications and add them to your portfolio to impress potential employers.", color: "#ec4899", bg: "#fce7f3" },
                        { icon: ShieldCheck, title: "Expert Instructors", desc: "Learn directly from industry veterans who have worked at top tech companies and startups.", color: "#8b5cf6", bg: "#ede9fe" },
                        { icon: Globe, title: "Learn Anywhere", desc: "Access your courses on any device. Download lessons for offline viewing during your commute.", color: "#3b82f6", bg: "#dbeafe" },
                        { icon: PlayCircle, title: "Interactive Videos", desc: "Engage with high-quality, interactive video lessons that keep you focused and motivated.", color: "#f43f5e", bg: "#ffe4e6" },
                        { icon: Sparkles, title: "Career Mentorship", desc: "Get 1-on-1 guidance from professionals to help build your resume and ace interviews.", color: "#14b8a6", bg: "#ccfbf1" }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)' }}
                            style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}
                        >
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '1.5rem', boxShadow: `0 8px 16px -4px ${feature.color}40` }}>
                                <feature.icon size={30} strokeWidth={2} />
                            </div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1.05rem' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TopCategories = ({ allCourses = [] }) => {
    const categoryCounts = {};
    allCourses.forEach(course => {
        const cat = course.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const metaData = {
        'Web Development': { icon: <Code size={28} />, color: '#3b82f6', bg: '#eff6ff' },
        'Software Development': { icon: <Code size={28} />, color: '#3b82f6', bg: '#eff6ff' },
        'Data Science': { icon: <Database size={28} />, color: '#10b981', bg: '#dcfce7' },
        'UI/UX Design': { icon: <Palette size={28} />, color: '#f43f5e', bg: '#ffe4e6' },
        'Business': { icon: <Briefcase size={28} />, color: '#f59e0b', bg: '#fef3c7' },
        'Business Strategy': { icon: <Briefcase size={28} />, color: '#f59e0b', bg: '#fef3c7' },
        'Marketing': { icon: <Megaphone size={28} />, color: '#8b5cf6', bg: '#ede9fe' },
        'Digital Marketing': { icon: <Megaphone size={28} />, color: '#8b5cf6', bg: '#ede9fe' },
        'Photography': { icon: <Camera size={28} />, color: '#ec4899', bg: '#fce7f3' },
        'Default': { icon: <Target size={28} />, color: '#6366f1', bg: '#e0e7ff' }
    };

    const categories = Object.keys(categoryCounts)
        .map(cat => ({
            name: cat,
            courses: categoryCounts[cat],
            icon: metaData[cat]?.icon || metaData['Default'].icon,
            color: metaData[cat]?.color || metaData['Default'].color,
            bg: metaData[cat]?.bg || metaData['Default'].bg
        }))
        .sort((a, b) => b.courses - a.courses)
        .slice(0, 5);

    return (
        <section style={{ padding: '8rem 2rem', background: 'white' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Top Categories</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>Explore our extensive library of courses carefully curated into specialized tracks to help you focus on your goals.</p>
                    </div>
                    <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s' }}>
                        Browse All Categories <ArrowRight size={18} />
                    </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {categories.map((cat, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                            style={{ 
                                padding: '2rem', 
                                borderRadius: '24px', 
                                background: 'white', 
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cat.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{cat.name}</h3>
                                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>{cat.courses} Courses</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    return (
        <section style={{ padding: '8rem 2rem', background: '#0f172a', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(236,72,153,0.15) 0%, transparent 50%)', zIndex: 0 }}></div>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#c7d2fe', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', backdropFilter: 'blur(5px)' }}>Success Stories</div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Loved by Learners Worldwide</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1.6 }}>Hear from our community of professionals who have transformed their careers using EroSkillUp.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {[
                        { name: "Priya Sharma", role: "Frontend Developer", img: "https://randomuser.me/api/portraits/women/43.jpg", text: "The React course completely changed how I build web applications. The AI-driven mentorship was like having a senior dev sitting next to me!" },
                        { name: "Rahul Verma", role: "Data Analyst", img: "https://randomuser.me/api/portraits/men/51.jpg", text: "I landed my dream job 2 months after completing the Python path. The personalized recommendations helped me focus exactly on what I needed." },
                        { name: "Anjali Desai", role: "UX Designer", img: "https://randomuser.me/api/portraits/women/40.jpg", text: "The UI/UX bootcamp was incredible. The peer reviews and collaborative projects gave me the portfolio I needed to stand out in interviews." }
                    ].map((t, idx) => (
                        <motion.div key={idx} whileHover={{ y: -10 }} style={{ background: 'rgba(255,255,255,0.03)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '1.5rem' }}>
                                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="#f59e0b" />)}
                            </div>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#e2e8f0', marginBottom: '2.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                <img src={t.img} alt={t.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                                <div>
                                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', marginBottom: '0.15rem' }}>{t.name}</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CallToAction = () => {
    return (
        <section style={{ padding: '8rem 2rem', background: 'white' }}>
            <div className="container">
                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)', borderRadius: '32px', padding: '6rem 3rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)' }}>
                    <div style={{ position: 'absolute', top: '-20%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Ready to Transform Your Career?</h2>
                        <p style={{ fontSize: '1.3rem', color: '#e0e7ff', marginBottom: '3.5rem', lineHeight: 1.6 }}>Join thousands of learners who are already achieving their goals. Get access to expert-led courses, AI mentoring, and a supportive community today.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link to="/courses" style={{ padding: '1.25rem 3rem', background: 'white', color: '#4f46e5', fontWeight: 800, fontSize: '1.1rem', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                Start Learning For Free <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const [trendingCourses, setTrendingCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const userSnapshot = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Fetch All Courses
        fetch('http://localhost:5000/api/courses')
            .then(res => res.json())
            .then(data => {
                setAllCourses(data);
                setTrendingCourses(data.slice(0, 4));
            })
            .catch(err => console.error("Failed to load courses", err));

        // Fetch AI Recommendations
        if (userSnapshot) {
            setAiLoading(true);
            fetch('http://localhost:5000/api/ai/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userSnapshot.id || userSnapshot._id })
            })
            .then(res => res.json())
            .then(data => {
                setRecommendedCourses(data);
                setAiLoading(false);
            })
            .catch(err => {
                console.error("AI fetch failed", err);
                setAiLoading(false);
            });
        }
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <Hero />
            
            {/* AI Personalized Recommendations */}
            {userSnapshot && (
                <section style={{ padding: '6rem 2rem', background: 'linear-gradient(to bottom, #ffffff, #f5f3ff)' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>
                                    <Sparkles size={18} fill="#7c3aed" /> Personalized for You
                                </div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>AI-Powered Matches</h2>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Based on your background, interests, and professional goals.</p>
                            </div>
                        </div>

                        {aiLoading ? (
                            <div style={{ padding: '4rem', textAlign: 'center' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                                <p style={{ color: '#64748b', fontWeight: 500 }}>AI is analyzing your profile...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                {recommendedCourses.length > 0 ? (
                                    recommendedCourses.map(course => (
                                        <div key={course._id} style={{ position: 'relative' }}>
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '15px', 
                                                right: '15px', 
                                                zIndex: 10, 
                                                background: 'rgba(124, 58, 237, 0.9)', 
                                                color: 'white', 
                                                padding: '5px 12px', 
                                                borderRadius: '50px', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 800,
                                                backdropFilter: 'blur(4px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                                            }}>
                                                <Sparkles size={12} fill="white" /> 98% MATCH
                                            </div>
                                            <CourseCard course={course} />
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                                        <h3 style={{ color: '#64748b' }}>Complete your profile to unlock personalized AI recommendations!</h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section style={{ padding: '6rem 2rem', background: 'white' }}>
                 <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Trending Courses</h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Explore our most popular courses liked by students.</p>
                        </div>
                        <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                            View All Courses <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {trendingCourses.length > 0 ? (
                            trendingCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))
                        ) : (
                            <p>Loading trending courses...</p>
                        )}
                    </div>
                 </div>
            </section>
            
            <TopCategories allCourses={allCourses} />
            <Features />
            <Testimonials />
            <CallToAction />
        </div>
    );
};

export default Home;
