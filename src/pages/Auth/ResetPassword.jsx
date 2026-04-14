import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../../assets/EroSkillupAcademy.jpg';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        let newErrors = {};
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: formData.password })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                toast.error(data.msg || 'Reset failed');
                setIsLoading(false);
                return;
            }

            toast.success('Password reset successfully!');
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
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
                    padding: '3rem',
                    margin: '1.5rem',
                    position: 'relative'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '64px', height: '64px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', padding: '4px' }}>
                        <img src={Logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Set New Password</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Choose a secure password to protect your account.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.form 
                            key="reset-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : '#94a3b8' }} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 6 characters" 
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: `1px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`, outline: 'none', fontSize: '0.95rem' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem', marginTop: '6px', fontWeight: 500 }}><AlertCircle size={14} /> {errors.password}</div>}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? '#ef4444' : '#94a3b8' }} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password" 
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#e2e8f0'}`, outline: 'none', fontSize: '0.95rem' }}
                                    />
                                </div>
                                {errors.confirmPassword && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem', marginTop: '6px', fontWeight: 500 }}><AlertCircle size={14} /> {errors.confirmPassword}</div>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1, marginTop: '0.5rem' }}
                            >
                                {isLoading ? "Resetting..." : "Update Password"} <ArrowRight size={18} />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div 
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '1rem' }}
                        >
                            <div style={{ width: '56px', height: '56px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Success!</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>Your password has been reset. You'll be redirected to login shortly.</p>
                            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Go to login now</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
