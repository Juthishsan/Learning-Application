import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.msg || 'Login failed');
        return;
      }

      // Save user data (in a real app, use Context or Redux)
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login Successful!');
      
      if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
      } else if (data.user.role === 'instructor') {
          navigate('/instructor/dashboard');
      } else {
          navigate('/');
      }

    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', position: 'relative', overflow: 'hidden' }}>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
             <BookOpen color="white" size={28} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Please enter your details to sign in.</p>
        </div>

        {error && <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@company.com" 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px 12px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  background: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#1e293b'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••" 
                style={{ 
                  width: '100%', 
                  padding: '12px 48px 12px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  background: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#1e293b'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
              >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
              <input type="checkbox" style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }} /> Remember me
            </label>
            <a href="#" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
              color: 'white', 
              border: 'none', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
              transition: 'transform 0.2s',
              marginTop: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', marginLeft: '4px' }}>Sign up for free</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
