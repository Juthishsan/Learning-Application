import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: '#0f172a', color: '#cbd5e1', paddingTop: '4rem', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid #334155' }}>
                    
                    {/* Brand Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                                <BookOpen size={24} />
                            </div>
                            <span>Ero<span className="text-gradient">SkillUp</span></span>
                        </div>
                        <p style={{ lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
                            Bridging the gap between talent and technology. Empowering the future workforce with cutting-edge IT skills and Japanese language proficiency.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'background 0.3s' }} className="social-icon">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Home', 'Courses', 'About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(item => (
                                <li key={item}>
                                    <Link 
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                                        style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}
                                        onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                                        onMouseOut={(e) => e.target.style.color = '#cbd5e1'}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Our Courses</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Full Stack Development', 'Japanese Language', 'Data Science', 'UI/UX Design', 'Digital Marketing'].map(item => (
                                <li key={item}>
                                    <Link to="/courses" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem' }}>{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Contact Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                                <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>23/1, Veeramamunivar Street, Erode Collectorate, Erode - 638011</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>
                                <Phone size={18} color="var(--primary)" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>
                                <Mail size={18} color="var(--primary)" />
                                <span>info@eroskillup.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        © {new Date().getFullYear()} EroSkillUp Academy. All rights reserved.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> for Learners
                    </p>
                </div>
            </div>
            
            <style jsx>{`
                .social-icon:hover {
                    background: var(--primary) !important;
                }
            `}</style>
        </footer>
    );
};

export default Footer;
