import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, LogOut, Settings, GraduationCap, User, IndianRupee } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [active, setActive] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('dashboard')) setActive('dashboard');
        else if (path.includes('courses')) setActive('courses');
        else if (path.includes('instructors')) setActive('instructors');
        else if (path.includes('users')) setActive('users');
        else if (path.includes('earnings')) setActive('earnings');
        else if (path.includes('profile')) setActive('profile');
        else if (path.includes('settings')) setActive('settings');
    }, [location]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = () => {
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
        { name: 'Instructors', path: '/admin/instructors', icon: <GraduationCap size={20} />, id: 'instructors' },
        { name: 'Students', path: '/admin/users', icon: <Users size={20} />, id: 'users' },
        { name: 'Earnings', path: '/admin/earnings', icon: <IndianRupee size={20} />, id: 'earnings' },
        { name: 'Profile', path: '/admin/profile', icon: <User size={20} />, id: 'profile' },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} />, id: 'settings' },
    ];

    return (
        <aside style={{ width: '260px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)' }}>EroSkillUp</span>Admin
                </h2>
            </div>
            
            <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link) => (
                    <Link 
                        key={link.id} 
                        to={link.path}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            padding: '0.75rem 1rem', 
                            borderRadius: '8px', 
                            color: active === link.id ? 'white' : '#94a3b8', 
                            background: active === link.id ? 'var(--primary)' : 'transparent',
                            transition: 'all 0.2s',
                            fontWeight: 500
                        }}
                    >
                        {link.icon}
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.75rem', 
                        color: '#ef4444', 
                        justifyContent: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px'
                    }}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title="Sign Out?"
                message="Are you sure you want to sign out of the Admin Portal?"
                confirmText="Sign Out"
                cancelText="Cancel"
                isDestructive={true}
                icon={LogOut}
            />
        </aside>
    );
};

export default AdminSidebar;
