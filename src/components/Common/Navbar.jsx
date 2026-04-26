import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, User, Menu, X, LogOut, Settings, Bell, ChevronDown, ChevronRight, Home, Info, Phone, LayoutDashboard, ShoppingCart, Calendar, PlayCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../Modals/ConfirmModal';
import Logo from '../../assets/EroSkillupAcademy.jpg';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    try {
        const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
        const data = await res.json();
        setNotifications(data);
    } catch (err) {
        console.error("Error fetching notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
        await fetch(`http://localhost:5000/api/notifications/mark-read/${user.id}`, { method: 'PUT' });
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (err) {
        console.error("Error marking all read:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
        setNotifications(notifications.map(n => n._id === id ? { ...n, unread: false } : n));
    } catch (err) {
        console.error("Error marking read:", err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation(); // Prevent marking as read when clicking delete
    try {
        await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
        setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
        console.error("Error deleting notification:", err);
    }
  };

  const formatTime = (dateString) => {
      if (!dateString) return '';
      const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
      let interval = seconds / 31536000;
      if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
      interval = seconds / 2592000;
      if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
      interval = seconds / 86400;
      if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
      interval = seconds / 3600;
      if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hr ago" : " hrs ago");
      interval = seconds / 60;
      if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " min ago" : " mins ago");
      return "Just now";
  };

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
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchNotifications(parsedUser.id || parsedUser._id);
        } else {
            setUser(null);
            setNotifications([]);
        }
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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src={Logo} alt="EroSkillUp Academy Logo" style={{ height: '42px', objectFit: 'contain', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
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
              <Search size={18} onClick={handleSearch} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? '#4f46e5' : 'var(--text-lighter)', transition: 'color 0.2s', cursor: 'pointer' }} />
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
                  backgroundColor: 'var(--bg-card)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxShadow: searchFocused ? '0 4px 12px -2px rgba(79, 70, 229, 0.2)' : '0 2px 4px -1px rgba(0,0,0,0.05)',
                  color: 'var(--text-main)'
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
                            background: 'var(--bg-card)',
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
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                                            <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BookOpen size={16} color='var(--text-light)' />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{course.category}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
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
                        color: location.pathname === link.path ? '#4f46e5' : 'var(--text-muted)',
                        textDecoration: 'none',
                        position: 'relative',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => { if(location.pathname !== link.path) e.target.style.color = 'var(--text-main)'}}
                    onMouseLeave={(e) => { if(location.pathname !== link.path) e.target.style.color = 'var(--text-muted)'}}
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
                  <Link to="/cart" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-light)', position: 'relative' }}>
                    <ShoppingCart size={20} />
                  </Link>

                  <div ref={notificationRef} style={{ position: 'relative' }}>
                      <button 
                          onClick={() => setShowNotifications(!showNotifications)}
                          style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-light)', position: 'relative', transition: 'all 0.2s', boxShadow: showNotifications ? '0 0 0 2px #e0e7ff' : 'none' }}
                      >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                        )}
                      </button>

                      <AnimatePresence>
                          {showNotifications && (
                              <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                      position: 'absolute',
                                      top: '120%',
                                      right: '-10px',
                                      width: '340px',
                                      background: 'var(--bg-card)',
                                      borderRadius: '16px',
                                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                      border: '1px solid #f1f5f9',
                                      overflow: 'hidden',
                                      zIndex: 100
                                  }}
                              >
                                  <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
                                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-title)' }}>Notifications</h3>
                                      {unreadCount > 0 && (
                                          <span style={{ background: 'var(--primary-light)', color: '#4338ca', padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                                              {unreadCount} new
                                          </span>
                                      )}
                                  </div>
                                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                      {notifications.length > 0 ? (
                                          notifications.map(notif => (
                                              <div key={notif._id} onClick={() => notif.unread && markAsRead(notif._id)} className="notification-item relative group" style={{ 
                                                  padding: '1rem', 
                                                  borderBottom: '1px solid #f8fafc', 
                                                  display: 'flex', 
                                                  gap: '1rem',
                                                  background: notif.unread ? '#f0f9ff' : 'white',
                                                  cursor: 'pointer',
                                                  transition: 'all 0.2s ease',
                                                  alignItems: 'flex-start'
                                              }}>
                                                  <div style={{ 
                                                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                                      background: notif.type === 'course' ? '#e0e7ff' : notif.type === 'assignment' ? '#fef08a' : 'var(--bg-secondary)',
                                                      color: notif.type === 'course' ? '#4f46e5' : notif.type === 'assignment' ? '#ca8a04' : 'var(--text-light)',
                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                      marginTop: '2px'
                                                  }}>
                                                      {notif.type === 'course' ? <PlayCircle size={20} /> : notif.type === 'assignment' ? <Calendar size={20} /> : <Info size={20} />}
                                                  </div>
                                                  <div style={{ flex: 1, paddingRight: '20px' }}>
                                                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{notif.title}</h4>
                                                      <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{notif.message}</p>
                                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-lighter)', fontWeight: 500 }}>{formatTime(notif.createdAt)}</span>
                                                  </div>
                                                  
                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                                                      <button 
                                                          onClick={(e) => deleteNotification(e, notif._id)}
                                                          className="delete-notif-btn"
                                                          style={{ 
                                                              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-light)', padding: '2px', borderRadius: '4px',
                                                              transition: 'all 0.2s', opacity: 0 
                                                          }}
                                                          title="Remove notification"
                                                      >
                                                          <X size={16} />
                                                      </button>
                                                      {notif.unread && (
                                                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginBottom: '8px', opacity: 1, transition: 'opacity 0.2s' }} className="unread-dot" />
                                                      )}
                                                  </div>
                                              </div>
                                          ))
                                      ) : (
                                          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                                              <Bell size={28} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4, color: 'var(--text-lighter)' }} />
                                              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>No new notifications</p>
                                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-lighter)' }}>You're all caught up!</p>
                                          </div>
                                      )}
                                  </div>
                                  <div style={{ padding: '0.85rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', background: 'var(--bg-card)' }}>
                                      <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#3730a3'} onMouseLeave={e => e.target.style.color = '#4f46e5'}>
                                          Mark all as read
                                      </button>
                                  </div>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>

                  <div className="relative" ref={menuRef} style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', padding: '4px 6px 4px 6px', borderRadius: '50px', border: '1px solid #e2e8f0', cursor: 'pointer', outline: 'none' }}
                      >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden' }}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={18} />
                            )}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', paddingRight: '4px' }}>{user?.name?.split(' ')[0] || 'User'}</span>
                          <ChevronDown size={14} color='var(--text-light)' style={{ marginRight: '8px' }} />
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
                                    background: 'var(--bg-card)', 
                                    borderRadius: '16px', 
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                                    border: '1px solid #f1f5f9',
                                    padding: '0.5rem',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{user.email}</div>
                                </div>
                                <Link to="/dashboard" onClick={() => setShowProfileMenu(false)} className="menu-item" style={{ ...menuItemStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Link>
                                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="menu-item" style={{ ...menuItemStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Settings size={16} />
                                    Profile Settings
                                </Link>
                                <div style={{ height: '1px', background: 'var(--bg-secondary)', margin: '0.5rem 0' }}></div>
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
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-main)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Log in</Link>
              <Link to="/signup" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'white', background: 'var(--text-main)', borderRadius: '12px', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                  Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
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
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-lighter)' }} />
                        <input 
                            placeholder="Search courses..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'var(--bg-main)', outline: 'none' }} 
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
                                color: location.pathname === link.path ? '#4f46e5' : 'var(--text-main)',
                                background: location.pathname === link.path ? '#eff6ff' : 'transparent',
                                borderRadius: '12px',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    width: '32px', height: '32px', 
                                    borderRadius: '8px', 
                                    background: location.pathname === link.path ? 'white' : 'var(--bg-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: location.pathname === link.path ? '#4f46e5' : 'var(--text-light)'
                                }}>
                                    <link.icon size={18} />
                                </div>
                                {link.name}
                            </div>
                            <ChevronRight size={16} color='var(--border-light)' />
                        </Link>
                   ))}
                   
                   <div style={{ height: '1px', background: 'var(--bg-secondary)', margin: '0.5rem 0' }}></div>
                   
                   {user ? (
                       <>
                           <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><User size={18} /></div>
                               Profile
                           </Link>
                           <Link to="/cart" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}><ShoppingCart size={18} /></div>
                               Cart
                           </Link>
                           <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><BookOpen size={18} /></div>
                               Dashboard
                           </Link>
                           <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><LogOut size={18} /></div>
                               Sign Out
                           </button>
                       </>
                   ) : (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                           <Link to="/login" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>Log in</Link>
                           <Link to="/signup" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '12px', background: 'var(--text-main)', fontWeight: 600, color: 'white', textDecoration: 'none' }}>Sign up</Link>
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
        .notification-item:hover {
            background: #f8fafc !important;
        }
        .notification-item:hover .delete-notif-btn {
            opacity: 1 !important;
            color: #94a3b8 !important;
        }
        .delete-notif-btn:hover {
            background: #f1f5f9 !important;
            color: #ef4444 !important;
        }
        .notification-item:hover .unread-dot {
            opacity: 0;
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
    color: 'var(--text-muted)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.2s',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontSize: '0.9rem'
};

export default Navbar;
