import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Handle the fact that name input has no type="name", so use id or just manually map
    const key = e.target.placeholder === "John Doe" ? "name" : e.target.type;
    setFormData({ ...formData, [key]: e.target.value });
  };
  
  // A cleaner handleChange
  const onNameChange = (e) => setFormData({...formData, name: e.target.value});
  const onEmailChange = (e) => setFormData({...formData, email: e.target.value});
  const onPassChange = (e) => setFormData({...formData, password: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.msg || 'Registration failed');
        return;
      }

      toast.success('Account created! Please log in.');
      navigate('/login');
      
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Abstract Background Shapes */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)', top: '-150px', left: '-100px', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 70%)', bottom: '-100px', right: '-50px', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
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
             <User color="white" size={28} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Create an Account</h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Join thousands of learners today.</p>
        </div>

        {error && <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={onNameChange}
                required
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
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={formData.email}
                onChange={onEmailChange}
                required
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
                placeholder="Create a strong password" 
                value={formData.password}
                onChange={onPassChange}
                required
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
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', marginLeft: '4px' }}>Log in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
