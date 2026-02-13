import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Trash2, Search, Mail, User, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users');
            const data = await res.json();
            // Filter only for students
            const students = data.filter(user => user.role === 'student');
            setUsers(students);
        } catch (err) {
            console.error(err);
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
            message: 'Are you sure you want to delete this user? They will no longer be able to access the platform.',
            onConfirm: async () => {
                try {
                    await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
                    setUsers(users.filter(user => user._id !== id));
                    toast.success('User removed');
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to remove user');
                }
            }
        });
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Student Management</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and manage platform students</p>
                </div>

                <div className="card" style={{ overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px', background: 'white' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Name</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined Date</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                <User size={18} color="#64748b" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <span style={{ 
                                            background: user.role === 'admin' ? '#fff7ed' : '#f0fdf4', 
                                            color: user.role === 'admin' ? '#ea580c' : '#16a34a', 
                                            padding: '0.35rem 0.85rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600,
                                            border: `1px solid ${user.role === 'admin' ? '#ffedd5' : '#dcfce7'}`,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {user.role === 'admin' && <Shield size={14} />}
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <button onClick={() => handleDelete(user._id)} style={{ padding: '0.6rem', color: '#ef4444', background: 'white', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove User" onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}} onMouseOut={e => {e.currentTarget.style.background = 'white'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ marginBottom: '1rem', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', background: '#f1f5f9' }}>
                                            <Search size={32} />
                                        </div>
                                        <p style={{ fontWeight: 500 }}>No users found.</p>
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
