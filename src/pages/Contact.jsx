import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        const loadingToast = toast.loading('Sending message...');
        
        try {
            const res = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            toast.dismiss(loadingToast);

            if (res.ok) {
                setStatus('success');
                toast.success('Message sent successfully!');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 2000);
            } else {
                setStatus('error');
                toast.error('Failed to send message.');
            }
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            setStatus('error');
            toast.error('Network error. Please try again.');
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ background: '#0f172a', color: 'white', padding: '6rem 0 8rem', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Get in Touch</h1>
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>
                            Have questions about our courses or need career guidance? We're here to help you every step of the way.
                        </p>
                    </motion.div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '100px', height: '100px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '150px', height: '150px', background: 'var(--accent)', opacity: 0.1, borderRadius: '50%' }}></div>
            </div>

            <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* Contact Info Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card" 
                        style={{ padding: '2.5rem', background: '#1e293b', color: 'white', border: 'none' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Contact Information</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Our Location</h5>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        23/1, Veeramamunivar Street,<br /> 
                                        Erode Collectorate,<br />
                                        Erode, Tamil Nadu 638011
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</h5>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>+91 98765 43210</p>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>0424 123456</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</h5>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>info@eroskillup.in</p>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>support@eroskillup.in</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Working Hours</h5>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Mon - Sat: 9:00 AM - 6:00 PM</p>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card" 
                        style={{ padding: '2.5rem' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            Send us a Message <MessageSquare size={24} color="var(--primary)" />
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill up the form and our team will get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.3s' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.3s' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Course Inquiry / Career Guidance"
                                    required
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.3s' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Tell us more about how we can help you..."
                                    required
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.3s', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={status === 'submitting'}
                                style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                            >
                                {status === 'submitting' ? 'Sending...' : <>Send Message <Send size={18} /></>}
                            </button>
                        </form>
                    </motion.div>
                </div>
                
                 {/* Map Section */}
                 <div style={{ marginTop: '4rem', borderRadius: '1rem', overflow: 'hidden', height: '400px', boxShadow: 'var(--shadow-lg)' }}>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15664.87766292796!2d77.7172!3d11.3410!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f4c7729f031%3A0xe67543209587428c!2sErode%20Collectorate%2C%20Erode%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="EroSkillUp Location"
                    ></iframe>
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

export default Contact;
