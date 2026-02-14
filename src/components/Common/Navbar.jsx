import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, User, Menu, X, LogOut, Settings, Bell, ChevronDown, ChevronRight, Home, Info, Phone, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../Modals/ConfirmModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Search fetch error", err));
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, courses]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const checkUser = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        else setUser(null);
    }
    
    window.addEventListener('scroll', handleScroll);
    checkUser();

    // Close mobile menu on resize
    window.addEventListener('resize', () => window.innerWidth > 900 && setIsOpen(false));
    
    // Click outside to close profile menu
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', () => {});
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  const handleLogout = () => {
      setShowProfileMenu(false);
      setIsOpen(false);
      setShowLogoutConfirm(true);
  };

  const performLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
      setShowLogoutConfirm(false);
  };


  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false);
        }
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <nav 
        className="fixed w-full z-50 transition-all duration-300"
        style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, 
            padding: scrolled ? '0.75rem 0' : '1.25rem 0', 
            zIndex: 1000, 
            transition: 'all 0.3s ease',
            background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
            boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
        }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
              padding: '8px', 
              borderRadius: '12px', 
              color: 'white', 
              display: 'flex',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' 
          }}>
            <BookOpen size={22} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
            Ero<span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillUp</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
           
           {/* Modern Search Bar */}
           <div ref={searchRef} style={{ 
               position: 'relative', 
               transition: 'all 0.3s ease',
               width: searchFocused ? '320px' : '280px'
           }}>
              <Search size={18} onClick={handleSearch} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? '#4f46e5' : '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} />
              <input 
                type="text" 
                placeholder="Search for courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => setSearchFocused(true)}
                style={{ 
                  width: '100%', 
                  padding: '0.7rem 1rem 0.7rem 2.8rem', 
                  borderRadius: '50px', 
                  border: searchFocused ? '2px solid #4f46e5' : '1px solid #cbd5e1', 
                  backgroundColor: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxShadow: searchFocused ? '0 4px 12px -2px rgba(79, 70, 229, 0.2)' : '0 2px 4px -1px rgba(0,0,0,0.05)',
                  color: '#1e293b'
                }} 
              />

              {/* Search Dropdown */}
              <AnimatePresence>
                {searchFocused && searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '120%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f1f5f9',
                            padding: '0.5rem',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}
                    >
                        {searchResults.length > 0 ? (
                            searchResults.map(course => (
                                <Link 
                                    key={course._id} 
                                    to={`/course/${course._id}`}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchFocused(false);
                                    }}
                                    className="menu-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        transition: 'background 0.2s',
                                        color: '#1e293b'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                                            <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BookOpen size={16} color="#64748b" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{course.category}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                No courses found.
                            </div>
                        )}
                    </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {navLinks.map(link => (
                <Link 
                    key={link.name}
                    to={link.path} 
                    style={{ 
                        fontWeight: 600, 
                        fontSize: '0.95rem',
                        color: location.pathname === link.path ? '#4f46e5' : '#475569',
                        textDecoration: 'none',
                        position: 'relative',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => { if(location.pathname !== link.path) e.target.style.color = '#1e293b'}}
                    onMouseLeave={(e) => { if(location.pathname !== link.path) e.target.style.color = '#475569'}}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <link.icon size={18} strokeWidth={2} />
                        <span>{link.name}</span>
                    </div>
                    {location.pathname === link.path && (
                        <motion.div 
                            layoutId="underline" 
                            style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#4f46e5', borderRadius: '2px' }} 
                        />
                    )}
                </Link>
            ))}
           </div>
        </div>

        {/* Auth Buttons / Profile */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', position: 'relative' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                  </button>

                  <div className="relative" ref={menuRef} style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '4px 6px 4px 6px', borderRadius: '50px', border: '1px solid #e2e8f0', cursor: 'pointer', outline: 'none' }}
                      >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden' }}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={18} />
                            )}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', paddingRight: '4px' }}>{user.name.split(' ')[0]}</span>
                          <ChevronDown size={14} color="#64748b" style={{ marginRight: '8px' }} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                style={{ 
                                    position: 'absolute', 
                                    top: '120%', 
                                    right: 0, 
                                    width: '240px', 
                                    background: 'white', 
                                    borderRadius: '16px', 
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                                    border: '1px solid #f1f5f9',
                                    padding: '0.5rem',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                </div>
                                <Link to="/dashboard" onClick={() => setShowProfileMenu(false)} className="menu-item" style={{ ...menuItemStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Link>
                                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="menu-item" style={{ ...menuItemStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Settings size={16} />
                                    Profile Settings
                                </Link>
                                <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }}></div>
                                <button onClick={handleLogout} className="menu-item" style={{ ...menuItemStyle, color: '#ef4444', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
              </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/login" style={{ fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#1e293b'} onMouseLeave={e => e.target.style.color = '#475569'}>Log in</Link>
              <Link to="/signup" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'white', background: '#1e293b', borderRadius: '12px', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                  Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

       {/* Mobile Menu Overlay */}
       <AnimatePresence>
       {isOpen && (
           <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               style={{ 
                   overflow: 'hidden',
                   background: 'rgba(255, 255, 255, 0.98)', 
                   backdropFilter: 'blur(16px)',
                   borderBottom: '1px solid #e2e8f0',
                   boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                   position: 'absolute',
                   top: '100%', 
                   left: 0, 
                   width: '100%'
               }}
           >
               <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {/* Mobile Search */}
                   <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            placeholder="Search courses..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} 
                        />
                   </div>

                   {navLinks.map(link => (
                       <Link 
                            key={link.name} 
                            to={link.path} 
                            onClick={() => setIsOpen(false)} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem', 
                                fontWeight: 600, 
                                color: location.pathname === link.path ? '#4f46e5' : '#1e293b',
                                background: location.pathname === link.path ? '#eff6ff' : 'transparent',
                                borderRadius: '12px',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    width: '32px', height: '32px', 
                                    borderRadius: '8px', 
                                    background: location.pathname === link.path ? 'white' : '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: location.pathname === link.path ? '#4f46e5' : '#64748b'
                                }}>
                                    <link.icon size={18} />
                                </div>
                                {link.name}
                            </div>
                            <ChevronRight size={16} color="#cbd5e1" />
                        </Link>
                   ))}
                   
                   <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }}></div>
                   
                   {user ? (
                       <>
                           <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><User size={18} /></div>
                               Profile
                           </Link>
                           <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><BookOpen size={18} /></div>
                               Dashboard
                           </Link>
                           <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><LogOut size={18} /></div>
                               Sign Out
                           </button>
                       </>
                   ) : (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                           <Link to="/login" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>Log in</Link>
                           <Link to="/signup" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '12px', background: '#1e293b', fontWeight: 600, color: 'white', textDecoration: 'none' }}>Sign up</Link>
                       </div>
                   )}
               </div>
           </motion.div>
       )}
       </AnimatePresence>

      <style jsx>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: block !important; }
        }
        .menu-item:hover {
            background: #f8fafc;
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={performLogout} 
          title="Sign Out?"
          message="Are you sure you want to leave? You'll need to sign in again to access your courses."
          confirmText="Sign Out"
          cancelText="Cancel"
          isDestructive={true}
          icon={LogOut}
      />

    </nav>
  );
};

const menuItemStyle = {
    display: 'block',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    color: '#475569',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.2s',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontSize: '0.9rem'
};

export default Navbar;
