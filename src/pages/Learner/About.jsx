import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Globe, Award, Briefcase, CheckCircle } from 'lucide-react';

const About = () => {
    const features = [
        { icon: <Globe size={24} />, title: "Global Opportunities", desc: "Unique combination of IT skills and Japanese language training to open international career paths." },
        { icon: <Briefcase size={24} />, title: "Career Coaching", desc: "Dedicated support for placement, resume building, and interview preparation." },
        { icon: <Award size={24} />, title: "Expert Instructors", desc: "Learn from industry professionals with real-world experience." },
        { icon: <BookOpen size={24} />, title: "Practical Learning", desc: "Project-based curriculum ensuring hands-on experience with latest technologies." }
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Hero Section */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '6rem 0' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                            We Are <span className="text-gradient">EroSkillUp</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: '1.8' }}>
                            Bridging the gap between talent and technology. We are an educational institution dedicated to empowering individuals with cutting-edge IT skills and language proficiency to shape the future workforce.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <Target size={28} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Our Mission</h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                            To empower individuals and organizations through comprehensive skills development. We aim to bridge the skills gap by providing accessible, relevant, and high-quality training programs that foster innovation and career growth.
                        </p>
                    </div>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem' }}>
                            <Users size={28} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Who We Are</h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                            Based in Erode, Tamil Nadu, we are a premier academy offering a diverse range of courses from Full Stack Development to Japanese Language proficiency. We believe in holistic education that prepares you for the global market.
                        </p>
                    </div>
                </div>
            </div>

            {/* Essential Features */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Why Choose EroSkillUp?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We provide everything you need to succeed in the tech industry.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {features.map((feature, idx) => (
                            <div key={idx} className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Highlight */}
            <section style={{ background: '#f1f5f9', padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Our Specialized Tracks</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                We don't just teach code; we build careers. Explore our diverse range of specialized programs designed for the modern industry.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    'Full Stack Development', 'Japanese Language N5-N3', 
                                    'Mobile App Development', 'UI/UX Design', 
                                    'DevOps Engineering', 'Software Testing'
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                                        <CheckCircle size={18} color="var(--primary)" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                             <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-lg)' }}>
                                 <img 
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Team working" 
                                    style={{ width: '100%', borderRadius: '0.5rem' }} 
                                 />
                                 <div style={{ background: 'var(--primary)', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '-2rem', marginLeft: '2rem', position: 'relative', width: '80%' }}>
                                     <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>"Education is the passport to the future, for tomorrow belongs to those who prepare for it."</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
             <style jsx>{`
            @media (max-width: 900px) {
                div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
            }
            `}</style>
        </div>
    );
};

export default About;
