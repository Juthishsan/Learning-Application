
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Trash2, Search, Mail, User, Calendar, Shield, MoreVertical, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users');
            const data = await res.json();
            const students = data.filter(user => user.role === 'student');
            setUsers(students);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
                    setUsers(users.filter(user => user._id !== id));
                    toast.success('User permanently removed');
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to remove user');
                }
            }
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast.error("No students to export.");
            return;
        }

        const headers = ['ID', 'Name', 'Email', 'Role', 'Registration Date'];
        const csvRows = filteredUsers.map(user => {
            return [
                user._id,
                `"${user.name}"`,
                `"${user.email}"`,
                user.role,
                new Date(user.createdAt).toLocaleDateString()
            ].join(',');
        });

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `student_directory_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Student list exported successfully");
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem 3.5rem' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>Student Directory</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Comprehensive list of all platform learners</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search students..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', width: '300px', background: 'white', fontWeight: 500, fontSize: '0.95rem', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }} 
                            />
                        </div>
                        <button style={{ height: '48px', width: '48px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                            <Filter size={18} />
                        </button>
                        <button onClick={handleExport} style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', background: '#0f172a', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}>
                            <Download size={18} /> Export List
                        </button>
                    </div>
                </header>

                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Learner</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Registration Date</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Loading students...</td></tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                                <motion.tr 
                                    key={user._id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#fcfdfe'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569', border: '1px solid #e2e8f0' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>ID: {user._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>
                                            <Mail size={16} color="#94a3b8" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ 
                                            background: '#f0fdf4', 
                                            color: '#16a34a', 
                                            padding: '0.4rem 0.8rem', 
                                            borderRadius: '10px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 800,
                                            border: '1px solid #dcfce7',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                                            Active Student
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                                            <Calendar size={16} color="#94a3b8" />
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'}}>
                                                <MoreVertical size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(user._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '2rem', borderRadius: '32px', background: '#f8fafc', color: '#cbd5e1' }}>
                                            <User size={48} />
                                        </div>
                                        <p style={{ fontWeight: 700, color: '#64748b', fontSize: '1.1rem' }}>No students found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                onConfirm={confirmModal.onConfirm} 
                title={confirmModal.title} 
                message={confirmModal.message} 
            />
        </div>
    );
};

export default AdminUsers;
