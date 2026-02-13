import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for logged-in user explicitly on mount and on route change
  // Note: For a real app, use Context to update immediately on login without reload
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Simple checking of local storage
    const checkUser = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        else setUser(null);
    }
    
    window.addEventListener('scroll', handleScroll);
    checkUser(); // Check initially

    // Listen for storage changes (though this only works across tabs usually)
    // We can also just listen to location changes as a proxy for "something might have happened"
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]); // Re-run check on location change

  const handleLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Mentors', path: '/mentors' },
    { name: 'Enterprise', path: '/enterprise' },
  ];

  if (user) {
      navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-md py-3' : 'bg-transparent py-5'}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: scrolled ? '1rem 0' : '1.5rem 0', zIndex: 1000, transition: 'all 0.3s ease' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-main)' }}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
            <BookOpen size={24} />
          </div>
          <span>Ero<span className="text-gradient">SkillUp</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
           {/* Search Bar - only show on desktop */}
           <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem 1rem 0.6rem 2.4rem', 
                  borderRadius: '50px', 
                  border: '1px solid #e2e8f0', 
                  backgroundColor: 'var(--bg-card)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }} 
              />
           </div>

           <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={{ fontWeight: 500, color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)' }}>Home</Link>
            <Link to="/courses" style={{ fontWeight: 500, color: location.pathname === '/courses' ? 'var(--primary)' : 'var(--text-main)' }}>Courses</Link>
            
            <Link to="/about" style={{ fontWeight: 500, color: location.pathname === '/about' ? 'var(--primary)' : 'var(--text-main)' }}>About Us</Link>
            <Link to="/contact" style={{ fontWeight: 500, color: location.pathname === '/contact' ? 'var(--primary)' : 'var(--text-main)' }}>Contact</Link>
            {user && (
                <Link to="/dashboard" style={{ fontWeight: 500, color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-main)' }}>Dashboard</Link>
            )}
           </div>
        </div>

        {/* Auth Buttons / Profile */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <User size={18} />
                      </div>
                      <span>{user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <LogOut size={18} />
                  </button>
              </div>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Log in</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>Join for Free</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

       {/* Mobile Menu */}
       {isOpen && (
           <div style={{ 
               position: 'absolute', top: '100%', left: 0, width: '100%', 
               background: 'var(--bg-card)', padding: '1rem', 
               boxShadow: 'var(--shadow-lg)', borderTop: '1px solid #e2e8f0',
               display: 'flex', flexDirection: 'column', gap: '1rem' 
           }}>
               {navLinks.map(link => (
                   <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>{link.name}</Link>
               ))}
               <hr style={{ borderColor: '#e2e8f0' }}/>
               {user ? (
                   <>
                       <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> Profile</Link>
                       <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}><LogOut size={18} /> Logout</button>
                   </>
               ) : (
                   <>
                       <Link to="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                       <Link to="/signup" onClick={() => setIsOpen(false)}>Signup</Link>
                   </>
               )}
           </div>
       )}

      <style jsx>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
