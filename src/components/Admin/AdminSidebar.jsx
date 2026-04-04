import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Settings, GraduationCap, User, IndianRupee, ChevronRight, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../Modals/ConfirmModal';
import Logo from '../../assets/EroSkillupAcademy.jpg';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [active, setActive] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('dashboard')) setActive('dashboard');
        else if (path.includes('instructors')) setActive('instructors');
        else if (path.includes('users')) setActive('users');
        else if (path.includes('earnings')) setActive('earnings');
        else if (path.includes('profile')) setActive('profile');
        else if (path.includes('settings')) setActive('settings');

        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser || { name: 'Admin User' }); // Fallback if no user
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
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, id: 'dashboard' },
        { name: 'Instructors', path: '/admin/instructors', icon: GraduationCap, id: 'instructors' },
        { name: 'Students', path: '/admin/users', icon: Users, id: 'users' },
        { name: 'Earnings', path: '/admin/earnings', icon: IndianRupee, id: 'earnings' },
        { name: 'Profile', path: '/admin/profile', icon: User, id: 'profile' },
        { name: 'Settings', path: '/admin/settings', icon: Settings, id: 'settings' },
    ];

    if (!user) return null;

    return (
        <aside style={{ 
            width: '280px', 
            background: '#0f172a', 
            color: 'white', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            position: 'sticky', 
            top: 0,
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            zIndex: 50
        }}>
            {/* Logo Section */}
            <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        height: '45px', 
                        width: '45px', // Square bounds for consistency
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        background: 'white',
                        padding: '4px', // Slight padding if logo touches the borders
                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
                    }}>
                        <img src={Logo} alt="Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>EroSkillUp</h2>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Portal</span>
                    </div>
                </div>
            </div>
            
            {/* Navigation Links */}
            <nav style={{ flex: 1, padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ paddingLeft: '0.75rem', marginBottom: '0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>Main Menu</div>
                {links.map((link) => (
                    <Link 
                        key={link.id} 
                        to={link.path}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.85rem', 
                            padding: '0.85rem 1rem', 
                            borderRadius: '12px', 
                            color: active === link.id ? 'white' : '#94a3b8', 
                            background: active === link.id ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
                            transition: 'all 0.2s ease',
                            fontWeight: active === link.id ? 600 : 500,
                            textDecoration: 'none',
                            position: 'relative'
                        }}
                    >
                        <link.icon size={20} color={active === link.id ? '#fb923c' : '#64748b'} strokeWidth={active === link.id ? 2.5 : 2} />
                        <span style={{ flex: 1 }}>{link.name}</span>
                        {active === link.id && <ChevronRight size={14} color="#fb923c" />}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section: Profile & Logout */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                {/* User Card */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '12px', 
                    marginBottom: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: '#1e293b', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fb923c', 
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: '1px solid rgba(251, 146, 60, 0.2)'
                    }}>
                        {user.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#ea580c', borderRadius: '50%' }}></div>
                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Administrator</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '0.5rem', 
                        padding: '0.75rem', 
                        color: '#fca5a5', 
                        background: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                    <LogOut size={16} /> Sign Out
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
