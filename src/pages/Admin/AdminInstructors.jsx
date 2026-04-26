
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Plus, Trash2, Search, Mail, BookOpen, User, X, Briefcase, Star, Calendar, Filter, MoreVertical, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const AdminInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
                toast.success('Instructor profile created successfully');
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
            toast.success('Instructor account removed');
            setShowDeleteModal(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove instructor');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    const filteredInstructors = instructors.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem 3.5rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>Instructor Faculty</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Global educator network and expertise management</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search faculty..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', width: '280px', background: 'white', fontWeight: 500, fontSize: '0.95rem', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }} 
                            />
                        </div>
                        <button onClick={() => setIsModalOpen(true)} style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', background: '#4f46e5', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.25)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Plus size={20} /> Add Instructor
                        </button>
                    </div>
                </header>

                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Instructor</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Department / Title</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Expertise</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Onboarded</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInstructors.length > 0 ? filteredInstructors.map((instructor, index) => (
                                <motion.tr 
                                    key={instructor._id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#fcfdfe'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #c7d2fe', overflow: 'hidden', color: '#4338ca', fontWeight: 900, fontSize: '1.2rem' }}>
                                                {instructor.image ? <img src={instructor.image} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : instructor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.1rem' }}>{instructor.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={12} /> {instructor.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ 
                                            background: '#f8fafc', 
                                            color: '#1e293b', 
                                            padding: '0.5rem 1rem', 
                                            borderRadius: '12px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 700,
                                            border: '1px solid #e2e8f0',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Briefcase size={14} color="#6366f1" />
                                            {instructor.designation}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '240px' }}>
                                            {instructor.expertise.slice(0, 2).map((skill, idx) => (
                                                <span key={idx} style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: '10px', border: '1px solid #dcfce7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {instructor.expertise.length > 2 && (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, padding: '3px 5px' }}>+{instructor.expertise.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} color="#94a3b8" />
                                            {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                                            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'}}>
                                                <MoreVertical size={18} />
                                            </button>
                                            <button onClick={() => confirmDelete(instructor._id)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '2.5rem', borderRadius: '32px', background: '#f8fafc', color: '#cbd5e1' }}>
                                            <Briefcase size={48} />
                                        </div>
                                        <p style={{ fontWeight: 800, color: '#64748b', fontSize: '1.2rem' }}>No instructors onboarded yet</p>
                                        <button onClick={() => setIsModalOpen(true)} style={{ marginTop: '1.5rem', background: '#4f46e5', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Register First Instructor</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '32px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Onboard New Instructor</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Create a professional profile and user credentials</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>
                            
                            <form onSubmit={handleCreate} style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Professional Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input placeholder="Dr. Sarah Jenkins" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }} />
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Designation</label>
                                        <div style={{ position: 'relative' }}>
                                            <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input placeholder="Senior Research Scientist" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }} />
                                        </div>
                                    </motion.div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input type="email" placeholder="sarah.j@platform.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }} />
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }} />
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Areas of Expertise (Comma Separated)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Star size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input placeholder="Applied Physics, Quantum Computing, Python" required value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }} />
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: '2.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Professional Biography</label>
                                    <textarea placeholder="Tell us about their academic and professional journey..." required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, outline: 'none', minHeight: '120px', lineHeight: '1.6' }} />
                                </motion.div>
                                
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', border: '2px solid #f1f5f9', color: '#64748b', fontWeight: 800, background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}>Discard</button>
                                    <button type="submit" style={{ flex: 2, padding: '1.1rem', borderRadius: '16px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}>
                                        Finalize Onboarding <ArrowRight size={20} />
                                    </button>
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
                title="Deactivate Instructor"
                message="This will permanently remove the instructor profile and their system access. Associated courses will remain but will require reassignment. Proceed?"
            />
        </div>
    );
};

export default AdminInstructors;
