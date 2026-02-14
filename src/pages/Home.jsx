import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, PlayCircle, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';

const Hero = () => {
    return (
        <section style={{ 
            padding: '6rem 2rem', 
            position: 'relative', 
            overflow: 'hidden' 
        }}>
            {/* Background decorations */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '0%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>

            <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                
                {/* Text Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1rem', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: '#4f46e5', 
                        borderRadius: '999px', 
                        fontWeight: 600, 
                        fontSize: '0.875rem', 
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <Zap size={16} fill="#4f46e5" /> 
                        <span>Smart Learning Evolved</span>
                    </div>

                    <h1 style={{ 
                        fontSize: '3.75rem', 
                        lineHeight: '1.1', 
                        fontWeight: 800, 
                        marginBottom: '1.5rem', 
                        color: '#0f172a',
                        letterSpacing: '-1px'
                    }}>
                        Master New Skills with <br />
                        <span style={{ 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>
                            AI-Driven Precision
                        </span>
                    </h1>
                    
                    <p style={{ fontSize: '1.125rem', lineHeight: '1.7', color: '#64748b', marginBottom: '3rem', maxWidth: '540px' }}>
                        Unlock your potential with personalized learning paths, real-time AI mentorship, and interactive projects designed for the modern world.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/courses" style={{ 
                            padding: '1rem 2rem', 
                            fontSize: '1rem', 
                            fontWeight: 600, 
                            color: 'white', 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                            borderRadius: '12px', 
                            textDecoration: 'none',
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            Get Started Now <ArrowRight size={18} />
                        </Link>
                        <Link to="/about" style={{ 
                            padding: '1rem 2rem', 
                            fontSize: '1rem', 
                            fontWeight: 600, 
                            color: '#334155', 
                            background: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px', 
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            View Pricing
                        </Link>
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                        <div>
                            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>12k+</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Global Students</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>350+</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Expert Instructors</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>4.9</h4>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                {[1,2,3,4,5].map(i => <div key={i} style={{ width: '6px', height: '6px', background: '#f59e0b', borderRadius: '50%' }}></div>)}
                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginLeft: '6px' }}>Rating</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Hero Graphic / Image */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                    className="hidden-mobile"
                >
                    <div style={{ position: 'relative', width: '100%', maxWidth: '550px', height: '600px' }}>
                        {/* Main Glass Card */}
                        <div style={{ 
                            position: 'absolute', 
                            top: '40px', 
                            right: '20px', 
                            width: '90%', 
                            height: '500px', 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)', 
                            backdropFilter: 'blur(20px)',
                            borderRadius: '2rem', 
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 2
                        }}>
                             {/* Decorative header in card */}
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Learning...</div>
                            </div>
                            
                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}><Award size={24} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>Certificate Earned</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Advanced Interface Design</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Globe size={24} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>Community Joined</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Global Design Network</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><Shield size={24} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>Verified Skill</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>React Architecture Pattern</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                         {/* Background Blob */}
                        <div style={{ position: 'absolute', top: '0', right: '0', width: '100%', height: '100%', background: 'linear-gradient(135deg, #c7d2fe 0%, #fbcfe8 100%)', borderRadius: '3rem', transform: 'rotate(-6deg)' }}></div>
                    </div>
                </motion.div>
            </div>
             <style jsx>{`
            @media (max-width: 900px) {
                .container { grid-template-columns: 1fr !important; }
                .hidden-mobile { display: none !important; }
            }
            `}</style>
        </section>
    );
};

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/courses');
                const data = await res.json();
                setCourses(data.slice(0, 3)); // Only show top 3 on home
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses", err);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <Hero />
            
            <section style={{ padding: '6rem 2rem', background: 'transparent' }}>
                <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Featured Content</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Explore Top Courses</h2>
                        </div>
                        <Link to="/courses" style={{ 
                            color: '#0f172a', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '0.75rem 1.5rem', 
                            background: 'white', 
                            borderRadius: '50px', 
                            textDecoration: 'none', 
                            border: '1px solid #e2e8f0', 
                            transition: 'all 0.2s', 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
                        }}>
                            View all courses <ArrowRight size={18} />
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ flex: 1, height: '400px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }} className="animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {courses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

             {/* Features / Benefits Section */}
             <section style={{ padding: '6rem 2rem', background: 'transparent' }}>
                <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                         <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Why Choose Us?</h2>
                         <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>We provide a comprehensive learning ecosystem designed to help you succeed in the digital age.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                        {[
                            { title: 'Personalized Learning', icon: <Users size={32} color="#4f46e5" />, desc: 'AI adapts the curriculum to your pace and style.' },
                            { title: 'Expert Instruction', icon: <Award size={32} color="#ec4899" />, desc: 'Learn from industry veterans from top companies.' },
                            { title: 'Certification', icon: <Shield size={32} color="#10b981" />, desc: 'Earn recognized badges to boost your LinkedIn profile.' },
                        ].map((item, i) => (
                             <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>{item.title}</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
