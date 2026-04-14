import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, ChevronLeft, Send } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../../assets/EroSkillupAcademy.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError("Email address is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                toast.error(data.msg || 'Request failed');
                setIsLoading(false);
                return;
            }

            toast.success('Reset link sent!');
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            toast.error('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    width: '100%', 
                    maxWidth: '440px', 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    padding: '3.5rem',
                    margin: '1.5rem',
                    position: 'relative'
                }}
            >
                <Link 
                    to="/login" 
                    style={{ position: 'absolute', left: '2rem', top: '2rem', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}
                >
                    <ChevronLeft size={18} /> Back to Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
                    <div style={{ width: '64px', height: '64px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', padding: '4px' }}>
                        <img src={Logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Forgot Password?</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
                        {isSubmitted 
                            ? "We've sent recovery instructions to your inbox." 
                            : "Enter your email address and we'll send you a link to reset your password."
                        }
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.form 
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : '#94a3b8' }} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        placeholder="name@company.com" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 16px 12px 48px', 
                                            borderRadius: '12px', 
                                            border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`, 
                                            background: 'white',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            color: '#1e293b'
                                        }}
                                    />
                                </div>
                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', marginTop: '6px', fontWeight: 500 }}>
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                style={{ 
                                    width: '100%', 
                                    padding: '14px', 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontSize: '1rem', 
                                    fontWeight: 700, 
                                    cursor: isLoading ? 'not-allowed' : 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"} <ArrowRight size={18} />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}
                        >
                            <div style={{ width: '56px', height: '56px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Send size={28} />
                            </div>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Check your email</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>We've sent a password reset link to <br/><strong>{email}</strong></p>
                            <button 
                                onClick={() => setIsSubmitted(false)}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Didn't receive the email? Try again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
