
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Plus, Trash2, Edit, Search, X as XIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        const res = await fetch('http://localhost:5000/api/courses');
        const data = await res.json();
        setCourses(data);
    };

    const fetchInstructors = async () => {
        const res = await fetch('http://localhost:5000/api/instructors');
        const data = await res.json();
        setInstructors(data);
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
            if (!response.ok) {
                throw new Error('Failed to create course');
            }
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

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', contentTitle);
        formData.append('type', contentType);

        setUploading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/content`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const updatedContent = await res.json();
                // Update local state
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
            message: 'Are you sure you want to remove this content file? This will permanently delete it from the course.',
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
            if (!response.ok) {
                throw new Error('Failed to update course');
            }
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

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Course Management</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Organize and manage your educational content</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn" style={{ background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)', transition: 'transform 0.2s', border: 'none' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Plus size={20} /> Add New Course
                    </button>
                </div>

                <div className="card" style={{ overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px', background: 'white' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Title</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                                <th style={{ padding: '1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length > 0 ? courses.map(course => (
                                <tr key={course._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{course.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                                                {course.content?.length || 0} modules
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#64748b', fontWeight: 500, verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {course.instructor.charAt(0)}
                                            </div>
                                            {course.instructor}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <span style={{background: '#e0e7ff', color: '#4f46e5', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #c7d2fe'}}>
                                            {course.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#1e293b', verticalAlign: 'middle' }}>
                                        ₹{course.price}
                                    </td>
                                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button onClick={() => handleOpenContentModal(course)} style={{ padding: '0.6rem 1rem', color: '#0ea5e9', background: 'white', border: '1px solid #e0f2fe', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseOver={e => e.currentTarget.style.borderColor = '#0ea5e9'} onMouseOut={e => e.currentTarget.style.borderColor = '#e0f2fe'}>
                                                <Edit size={14} /> Content
                                            </button>
                                            <button onClick={() => handleEdit(course)} style={{ padding: '0.6rem', color: '#64748b', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit Details" onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1e293b'}} onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'}}>
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(course._id)} style={{ padding: '0.6rem', color: '#ef4444', background: 'white', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Course" onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}} onMouseOut={e => {e.currentTarget.style.background = 'white'}}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ marginBottom: '1rem', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', background: '#f1f5f9' }}>
                                            <Search size={32} />
                                        </div>
                                        <p style={{ fontWeight: 500 }}>No courses found. Start by creating one!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Content Management Modal */}
            {contentModalOpen && selectedCourse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card" 
                        style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', background: 'white' }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Manage Content</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedCourse.title}</p>
                            </div>
                            <button onClick={() => setContentModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', border: 'none', cursor: 'pointer' }}><XIcon size={20} /></button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {/* Upload Form */}
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Upload New File</h3>
                                <form onSubmit={handleUploadContent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Title (e.g., Introduction Video)" 
                                        value={contentTitle} 
                                        onChange={e => setContentTitle(e.target.value)} 
                                        required 
                                        style={inputStyle}
                                    />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <select 
                                            value={contentType} 
                                            onChange={e => setContentType(e.target.value)} 
                                            style={{ ...inputStyle, flex: 1, background: 'white' }}
                                        >
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video File</option>
                                            <option value="image">Image Material</option>
                                        </select>
                                        <input 
                                            type="file" 
                                            onChange={e => setUploadFile(e.target.files[0])} 
                                            required 
                                            style={{ ...inputStyle, flex: 2, padding: '0.5rem', background: 'white' }} 
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={uploading} 
                                        className="btn" 
                                        style={{ marginTop: '0.5rem', background: '#1e293b', color: 'white', fontWeight: 600, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                    </button>
                                </form>
                            </div>

                            {/* Content List */}
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Existing Content</h3>
                            {selectedCourse.content && selectedCourse.content.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedCourse.content.map(item => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.5rem', background: item.type === 'video' ? '#e0e7ff' : '#fee2e2', color: item.type === 'video' ? '#4f46e5' : '#ef4444', borderRadius: '6px' }}>
                                                    {item.type === 'video' ? 'Video' : 'PDF'}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#334155' }}>{item.title}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteContent(item._id)} 
                                                style={{ color: '#ef4444', background: '#fee2e2', padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '1rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>No content uploaded yet.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="card" 
                        style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', background: 'white' }}
                    >
                         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Add New Course</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', cursor: 'pointer', border: 'none' }}><XIcon size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleCreate} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Course Title</label>
                                <input placeholder="e.g. Advanced React Patterns" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Instructor Name</label>
                                <select 
                                    required 
                                    value={formData.instructor} 
                                    onChange={e => setFormData({...formData, instructor: e.target.value})} 
                                    style={{...inputStyle, appearance: 'none', background: 'white' }}
                                >
                                    <option value="" disabled>Select Instructor</option>
                                    {instructors.map(inst => (
                                        <option key={inst._id} value={inst.name}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Price (₹)</label>
                                    <input placeholder="99.99" type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{...inputStyle, appearance: 'none', background: 'white' }}>
                                        <option value="" disabled>Select Category</option>
                                        {COURSE_CATEGORIES.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea placeholder="Describe what students will learn..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ flex: 1, border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, background: 'white' }}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600 }}>Create Course</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="card" 
                        style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', background: 'white' }}
                    >
                         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Edit Course</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', cursor: 'pointer', border: 'none' }}><XIcon size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleUpdate} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Course Title</label>
                                <input placeholder="e.g. Advanced React Patterns" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
                            </div>
                            
                            <div>
                                <label style={labelStyle}>Instructor Name</label>
                                <select 
                                    required 
                                    value={formData.instructor} 
                                    onChange={e => setFormData({...formData, instructor: e.target.value})} 
                                    style={{...inputStyle, appearance: 'none', background: 'white' }}
                                >
                                    <option value="" disabled>Select Instructor</option>
                                    {instructors.map(inst => (
                                        <option key={inst._id} value={inst.name}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Price (₹)</label>
                                    <input placeholder="99.99" type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select 
                                        required 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})} 
                                        style={{...inputStyle, appearance: 'none', background: 'white' }}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {COURSE_CATEGORIES.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea placeholder="Describe what students will learn..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn" style={{ flex: 1, border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, background: 'white' }}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600 }}>Save Changes</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            
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


const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.5rem',
    display: 'block'
};

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

// Add focus effect in global css or inline if possible, for now inline simple
// Note: Pseudo-selectors like :focus are hard in inline styles. 
// We rely on standard CSS or simple attributes.

export default AdminCourses;
