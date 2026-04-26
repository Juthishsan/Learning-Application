import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
    Plus, Trash2, Edit, Search, X as XIcon, BookOpen, Users, 
    TrendingUp, Filter, MoreHorizontal, Download, LayoutGrid, 
    List, ArrowUpRight, CheckCircle, AlertCircle, FileText, Video,
    Image as ImageIcon, Upload, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCourses = () => {
    const COURSE_CATEGORIES = [
        "Full Stack Development",
        "Mobile App Development",
        "DevOps Engineering",
        "Software Testing",
        "UI/UX Design",
        "Digital Marketing",
        "Node.js & MongoDB Development",
        "iOS App Development",
        "Java Development",
        "React.js Development",
        "Python Development",
        "Angular Development",
        "Android App Development",
        "PHP & MySQL Development",
        "Data Analytics"
    ];

    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // table or grid
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '', description: '', instructor: '', price: '', category: '', thumbnail: '📚'
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/courses');
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

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
        fetchCourses();
        fetchInstructors();
    }, []);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone and will delete all associated content.',
            onConfirm: async () => {
                try {
                    await fetch(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' });
                    setCourses(courses.filter(course => course._id !== id));
                    toast.success('Course deleted');
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete course');
                }
            }
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to create course');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', instructor: '', price: '', category: '', thumbnail: '📚' });
            fetchCourses();
            toast.success('Course created successfully!');
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Failed to create course');
        }
    };

    const [contentModalOpen, setContentModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [contentTitle, setContentTitle] = useState('');
    const [contentType, setContentType] = useState('pdf');

    const handleOpenContentModal = (course) => {
        setSelectedCourse(course);
        setContentModalOpen(true);
    };

    const handleUploadContent = async (e) => {
        e.preventDefault();
        if (!uploadFile || !selectedCourse) return;

        const uploadData = new FormData();
        uploadData.append('file', uploadFile);
        uploadData.append('title', contentTitle);
        uploadData.append('type', contentType);

        setUploading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/content`, {
                method: 'POST',
                body: uploadData
            });

            if (res.ok) {
                const updatedContent = await res.json();
                const updatedCourse = { ...selectedCourse, content: updatedContent };
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                setSelectedCourse(updatedCourse);
                toast.success('Content uploaded successfully');
                setUploadFile(null);
                setContentTitle('');
            } else {
                toast.error('Upload failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteContent = (contentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Content',
            message: 'Are you sure you want to remove this content file?',
            onConfirm: async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/content/${contentId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        const updatedContent = await res.json();
                        const updatedCourse = { ...selectedCourse, content: updatedContent };
                        setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                        setSelectedCourse(updatedCourse);
                        toast.success('Content deleted');
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Delete failed');
                }
            }
        });
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleEdit = (course) => {
        setEditingId(course._id);
        setFormData({
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            price: course.price,
            category: course.category,
            thumbnail: course.thumbnail || '📚'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/courses/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to update course');
            setIsEditModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', description: '', instructor: '', price: '', category: '', thumbnail: '📚' });
            fetchCourses();
            toast.success('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        }
    };

    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Courses', value: courses.length, icon: BookOpen, color: '#6366f1' },
        { label: 'Active Students', value: courses.reduce((acc, c) => acc + (c.students || 0), 0), icon: Users, color: '#10b981' },
        { label: 'Avg. Course Price', value: `₹${(courses.reduce((acc, c) => acc + Number(c.price), 0) / (courses.length || 1)).toFixed(2)}`, icon: TrendingUp, color: '#f59e0b' }
    ];

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Plus size={48} color="#6366f1" />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
                
                {/* Executive Header */}
                <header style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                                Course Catalog
                            </motion.h1>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Architect the future of learning on the platform</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}><Download size={18} /> Export</button>
                            <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.8rem', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}><Plus size={20} /> Create Course</button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {stats.map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ background: `${stat.color}15`, color: stat.color, width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={28} /></div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{stat.value}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </header>

                {/* Filter & View Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                        <input 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by title, instructor or category..." 
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: 500, outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} 
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'white', padding: '0.4rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <button onClick={() => setViewMode('table')} style={{ padding: '0.6rem', borderRadius: '10px', border: 'none', background: viewMode === 'table' ? '#f1f5f9' : 'transparent', color: viewMode === 'table' ? '#0f172a' : '#94a3b8', cursor: 'pointer' }}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '0.6rem', borderRadius: '10px', border: 'none', background: viewMode === 'grid' ? '#f1f5f9' : 'transparent', color: viewMode === 'grid' ? '#0f172a' : '#94a3b8', cursor: 'pointer' }}><LayoutGrid size={20} /></button>
                    </div>
                </div>

                {/* Main Content View */}
                {viewMode === 'table' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Course Identifier</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Lead Instructor</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Category</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Investment</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'right', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredCourses.map((course, idx) => (
                                        <motion.tr 
                                            key={course._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            style={{ transition: 'background 0.2s' }}
                                        >
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid #e2e8f0' }}>{course.thumbnail || '📚'}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{course.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                                            <FileText size={12} /> {course.content?.length || 0} Modules
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{course.instructor.charAt(0)}</div>
                                                    <span style={{ fontWeight: 600, color: '#475569' }}>{course.instructor}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #dbeafe' }}>{course.category}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>₹{course.price}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleOpenContentModal(course)} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} /> Content</button>
                                                    <button onClick={() => handleEdit(course)} style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(course._id)} style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'white', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredCourses.map((course, idx) => (
                            <motion.div key={course._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>{course.thumbnail || '📚'}</div>
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-block', marginBottom: '1rem' }}>{course.category}</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.3 }}>{course.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>{course.instructor.charAt(0)}</div>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{course.instructor}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>₹{course.price}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEdit(course)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(course._id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Premium Content Management Modal */}
            <AnimatePresence>
                {contentModalOpen && selectedCourse && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ width: '100%', maxWidth: '700px', background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Knowledge Assets</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem' }}>{selectedCourse.title}</p>
                                </div>
                                <button onClick={() => setContentModalOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={20} /></button>
                            </div>

                            <div style={{ padding: '2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                {/* Upload Zone */}
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={18} /> Add New Resource</h3>
                                    <form onSubmit={handleUploadContent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <input required value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="Resource Title (e.g., Introduction to Architecture)" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem', fontWeight: 500 }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                            <select value={contentType} onChange={e => setContentType(e.target.value)} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem', fontWeight: 700 }}>
                                                <option value="pdf">PDF</option>
                                                <option value="video">Video</option>
                                                <option value="image">Image</option>
                                            </select>
                                            <div style={{ position: 'relative' }}>
                                                <input type="file" onChange={e => setUploadFile(e.target.files[0])} required style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
                                                <div style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '14px', background: 'white', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>{uploadFile ? uploadFile.name : 'Select File'}</div>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={uploading} style={{ padding: '1rem', borderRadius: '14px', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>{uploading ? 'Processing...' : 'Upload Resource'}</button>
                                    </form>
                                </div>

                                {/* Asset List */}
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>Course Curriculum</h3>
                                {selectedCourse.content && selectedCourse.content.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {selectedCourse.content.map((item, i) => (
                                            <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '20px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.type === 'video' ? '#fef2f2' : '#eff6ff', color: item.type === 'video' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.type === 'video' ? <Video size={20} /> : <FileText size={20} />}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{item.type}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}><Eye size={18} /></button>
                                                    <button onClick={() => handleDeleteContent(item._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>No assets found in this course.</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Create/Edit Modal */}
            <AnimatePresence>
                {(isModalOpen || isEditModalOpen) && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                             <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{isEditModalOpen ? 'Edit Program' : 'New Program'}</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem' }}>Define the parameters of your learning track</p>
                                </div>
                                <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={20} /></button>
                            </div>
                            
                            <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Program Title</label>
                                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Modern Full Stack Engineering" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Faculty Lead</label>
                                        <select required value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>
                                            <option value="" disabled>Select Faculty</option>
                                            {instructors.map(inst => <option key={inst._id} value={inst.name}>{inst.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Track Category</label>
                                        <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>
                                            <option value="" disabled>Select Track</option>
                                            {COURSE_CATEGORIES.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Enrollment Fee (₹)</label>
                                        <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 900 }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Symbol / Emoji</label>
                                        <input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="📚" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 800, textAlign: 'center' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Abstract & Objectives</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Define the learning outcomes..." style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1rem', fontWeight: 500, resize: 'none' }} />
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <button type="submit" style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}>{isEditModalOpen ? 'Update Program' : 'Establish Program'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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

export default AdminCourses;
