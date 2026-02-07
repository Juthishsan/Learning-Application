import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, User, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const InstructorSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [active, setActive] = useState('dashboard');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('dashboard')) setActive('dashboard');
        else if (path.includes('courses')) setActive('courses');
        else if (path.includes('students')) setActive('students');
        else if (path.includes('earnings')) setActive('earnings');
        else if (path.includes('settings')) setActive('settings');
        else if (path.includes('profile')) setActive('profile');
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', path: '/instructor/dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
        { name: 'My Courses', path: '/instructor/courses', icon: <BookOpen size={20} />, id: 'courses' },
        { name: 'My Students', path: '/instructor/students', icon: <Users size={20} />, id: 'students' },
        { name: 'Profile', path: '/instructor/profile', icon: <User size={20} />, id: 'profile' },
        { name: 'Settings', path: '/instructor/settings', icon: <Settings size={20} />, id: 'settings' },
    ];

    return (
        <aside style={{ 
            width: '280px', 
            background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)', 
            color: 'white', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            position: 'sticky', 
            top: 0,
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
        }}>
            <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.5px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎓</span>
                    </div>
                    Instructor<span style={{ color: '#a5b4fc', fontWeight: 400 }}>Portal</span>
                </h2>
            </div>
            
            <nav style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, letterSpacing: '1px' }}>Menu</div>
                {links.map((link) => (
                    <Link 
                        key={link.id} 
                        to={link.path}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            padding: '1rem 1.25rem', 
                            borderRadius: '12px', 
                            color: active === link.id ? 'white' : '#94a3b8', 
                            background: active === link.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                            backdropFilter: active === link.id ? 'blur(10px)' : 'none',
                            border: active === link.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontWeight: 500,
                            textDecoration: 'none',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {active === link.id && (
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#6366f1', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}></div>
                        )}
                        {link.icon}
                        <span style={{ position: 'relative', zIndex: 1 }}>{link.name}</span>
                    </Link>
                ))}
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.1)' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '1rem', 
                        color: '#f87171', 
                        justifyContent: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default InstructorSidebar;
