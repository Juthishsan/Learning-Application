import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Plus, Trash2, Search, Mail, BookOpen, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: '',
        designation: '', 
        bio: '', 
        expertise: '', 
        image: ''
    });

    const fetchInstructors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/instructors');
            const data = await res.json();
            setInstructors(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/instructors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                toast.success('Instructor and user account added');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', designation: '', bio: '', expertise: '', image: '' });
                fetchInstructors();
            } else {
                const data = await response.json();
                toast.error(data.msg || 'Failed to add instructor');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error adding instructor');
        }
    };

    const confirmDelete = (id) => {
        setSelectedId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            await fetch(`http://localhost:5000/api/instructors/${selectedId}`, { method: 'DELETE' });
            setInstructors(instructors.filter(inst => inst._id !== selectedId));
            toast.success('Instructor removed');
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove instructor');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const labelStyle = {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '0.5rem',
        display: 'block'
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Instructor Management</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage course instructors and their details</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn" style={{ background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)', transition: 'transform 0.2s', border: 'none' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Plus size={20} /> Add New Instructor
                    </button>
                </div>

                <div className="card" style={{ overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px', background: 'white' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Info</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expertise</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined Date</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.length > 0 ? instructors.map(instructor => (
                                <tr key={instructor._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', color: '#4f46e5', fontWeight: 700 }}>
                                                {instructor.image ? <img src={instructor.image} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : instructor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{instructor.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} />
                                            {instructor.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <span style={{ 
                                            background: '#f1f5f9', 
                                            color: '#475569', 
                                            padding: '0.35rem 0.85rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {instructor.designation}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                                            {instructor.expertise.slice(0, 2).map((skill, idx) => (
                                                <span key={idx} style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {instructor.expertise.length > 2 && (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+{instructor.expertise.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                                        {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <button onClick={() => confirmDelete(instructor._id)} style={{ padding: '0.6rem', color: '#ef4444', background: 'white', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Instructor" onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}} onMouseOut={e => {e.currentTarget.style.background = 'white'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ marginBottom: '1rem', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', background: '#f1f5f9' }}>
                                            <Search size={32} />
                                        </div>
                                        <p style={{ fontWeight: 500 }}>No instructors found. Click "Add New Instructor" to create one.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="card" 
                            style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Add New Instructor</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', cursor: 'pointer', border: 'none' }}><X size={20} /></button>
                            </div>
                            
                            <form onSubmit={handleCreate} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input placeholder="e.g. Dr. Emily Chen" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Email Address</label>
                                        <input type="email" placeholder="email@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Password</label>
                                        <input type="password" placeholder="Create password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Designation / Title</label>
                                    <input placeholder="e.g. Senior Data Scientist" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Expertise (comma separated)</label>
                                    <input placeholder="Python, Machine Learning, AI" required value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Profile Image URL (Optional)</label>
                                    <input placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bio</label>
                                    <textarea placeholder="Brief professional biography..." required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ flex: 1, border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, background: 'white' }}>Cancel</button>
                                    <button type="submit" className="btn" style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600 }}>Save Instructor</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Remove Instructor"
                message="Are you sure you want to remove this instructor? This might affect courses they are assigned to."
            />
        </div>
    );
};

export default AdminInstructors;
