import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, PlayCircle, Zap } from 'lucide-react';
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
                maxWidth: '1280px', 
                margin: '0 auto', 
                padding: '0 2rem', 
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
        <section style={{ padding: '6rem 2rem', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Why Choose EroSkillUp?</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>We combine cutting-edge technology with expert-led pedagogy to deliver a learning experience that truly works.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[
                        { icon: Award, title: "Industry-Recognized Certificates", desc: "Earn certificates that are valued by top employers worldwide." },
                        { icon: Users, title: "Collaborative Learning", desc: "Join a global community of learners and grow together." },
                        { icon: Zap, title: "AI-Powered Recommendations", desc: "Get personalized course suggestions based on your learning style." }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -10 }}
                            style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: '1.5rem' }}>
                                <feature.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>{feature.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const [trendingCourses, setTrendingCourses] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/courses')
            .then(res => res.json())
            .then(data => setTrendingCourses(data.slice(0, 3)))
            .catch(err => console.error("Failed to load courses", err));
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <Hero />
            
            
            <section style={{ padding: '6rem 2rem', background: 'white' }}>
                 <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
            <Features />
        </div>
    );
};

export default Home;
