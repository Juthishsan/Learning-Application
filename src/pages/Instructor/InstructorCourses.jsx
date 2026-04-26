
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Plus, Trash2, Edit, Search, X as XIcon, FileText, Video, Image as ImageIcon, MoreVertical, Users, BookOpen, ClipboardList, CheckSquare, PlusCircle, Trash, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const InstructorCourses = () => {
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        title: '', description: '', instructor: user?.name || '', price: '', category: '', thumbnail: ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [thumbnailMode, setThumbnailMode] = useState('file'); // 'file' or 'url'
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
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
            // Filter courses to only show those belonging to this instructor
            // Assuming 'instructor' field in course matches user.name
            // In a real app, API should filter this or use IDs
            const myCourses = data.filter(course => course.instructor === user?.name || course.instructor === user?.username); 
            setCourses(myCourses);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
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
        
        // Validation
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.price) newErrors.price = "Price is required";
        else if (isNaN(formData.price) || Number(formData.price) < 0) newErrors.price = "Price must be a valid positive number";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsUploading(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('title', formData.title);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('instructor', user.name);
            formDataPayload.append('instructorId', user.id || user._id);
            formDataPayload.append('price', formData.price);
            formDataPayload.append('category', formData.category);
            if (thumbnailMode === 'file' && thumbnailFile) {
                formDataPayload.append('thumbnail', thumbnailFile);
            } else if (thumbnailMode === 'url' && thumbnailUrl) {
                formDataPayload.append('thumbnail', thumbnailUrl);
            }

            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                body: formDataPayload
            });
            if (!response.ok) {
                throw new Error('Failed to create course');
            }
            setIsModalOpen(false);
            setFormData({ title: '', description: '', instructor: user.name, price: '', category: '', thumbnail: '' });
            setThumbnailFile(null);
            setThumbnailUrl('');
            fetchCourses();
            toast.success('Course created successfully!');
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Failed to create course');
        } finally {
            setIsUploading(false);
        }
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
            category: course.category,
            thumbnail: course.thumbnail || ''
        });
        setThumbnailFile(null);
        if (course.thumbnail && (course.thumbnail.startsWith('http'))) {
            setThumbnailUrl(course.thumbnail);
            setThumbnailMode('url');
        } else {
            setThumbnailUrl('');
            setThumbnailMode('file');
        }
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.price) newErrors.price = "Price is required";
        else if (isNaN(formData.price) || Number(formData.price) < 0) newErrors.price = "Price must be a valid positive number";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsUploading(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('title', formData.title);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('instructor', formData.instructor);
            formDataPayload.append('price', formData.price);
            formDataPayload.append('category', formData.category);
            if (thumbnailMode === 'file' && thumbnailFile) {
                formDataPayload.append('thumbnail', thumbnailFile);
            } else if (thumbnailMode === 'url' && thumbnailUrl) {
                formDataPayload.append('thumbnail', thumbnailUrl);
            }

            const response = await fetch(`http://localhost:5000/api/courses/${editingId}`, {
                method: 'PUT',
                body: formDataPayload
            });
            if (!response.ok) {
                throw new Error('Failed to update course');
            }
            setIsEditModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', description: '', instructor: user.name, price: '', category: '', thumbnail: '' });
            setThumbnailFile(null);
            fetchCourses();
            toast.success('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        } finally {
            setIsUploading(false);
        }
    };

    const getTypeIcon = (type) => {
        if (type === 'video') return <Video size={16} />;
        if (type === 'image') return <ImageIcon size={16} />;
        return <FileText size={16} />;
    };

    return (
        <div style={{ display: 'flex', background: 'transparent', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}
                >
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>My Courses</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '1.1rem' }}>Manage your portfolio and create new learning experiences.</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalOpen(true)} 
                        style={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '1rem 2rem', 
                            borderRadius: '16px', 
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', 
                            border: 'none', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <PlusCircle size={22} /> Create New Course
                    </motion.button>
                </motion.header>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card" 
                    style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)', overflow: 'hidden' }}
                >
                    
                    {/* Toolbar */}
                    <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#ffffff' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                placeholder="Search courses by name or category..." 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.85rem 1rem 0.85rem 3.25rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    background: '#f8fafc',
                                    fontSize: '0.95rem',
                                    color: '#1e293b',
                                    transition: 'all 0.2s',
                                }} 
                                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                <FileText size={18} /> Category
                            </button>
                            <button style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                <MoreVertical size={18} /> Sort By
                            </button>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Course Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Price</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Content</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Students</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length > 0 ? courses.map((course, index) => (
                                <motion.tr 
                                    key={course._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                    whileHover={{ backgroundColor: '#f8fafc' }}
                                    onClick={() => navigate(`/instructor/courses/${course._id}`)}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#f1f5f9', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                                                    <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    course.title.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '0.2rem' }}>{course.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ 
                                            padding: '0.4rem 0.85rem', 
                                            borderRadius: '50px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 700, 
                                            background: '#e0e7ff', 
                                            color: '#4f46e5',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {course.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>₹{course.price}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            <FileText size={16} /> 
                                            {course.content?.length || 0} Lessons
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            <Users size={16} />
                                            {course.students || 0}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <motion.button 
                                                whileHover={{ scale: 1.1, background: '#eff6ff' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.stopPropagation(); handleEdit(course); }} 
                                                style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#4f46e5', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} 
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.1, background: '#fef2f2' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(course._id); }} 
                                                style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} 
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <BookOpen size={32} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>No courses found</h3>
                                                <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>Start your teaching journey by creating your first course.</p>
                                            </div>
                                            <button 
                                                onClick={() => setIsModalOpen(true)} 
                                                style={{ marginTop: '0.5rem', background: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Plus size={18} /> Create Course
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            </main>

            {/* Modals Logic - Only Create/Edit remain */}
             {(isModalOpen || isEditModalOpen) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '16px', padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{isEditModalOpen ? 'Edit Course' : 'Create Course'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', border: 'none', cursor: 'pointer' }}><XIcon size={20} /></button>
                        </div>
                         <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} noValidate style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <label className="form-label">Course Title</label>
                                <input placeholder="e.g. Master ReactJS" value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); if (errors.title) setErrors({...errors, title: null}); }} className="form-input" style={{ borderColor: errors.title ? '#ef4444' : undefined, background: errors.title ? '#fef2f2' : undefined }} disabled={isUploading} />
                                {errors.title && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}><AlertCircle size={14} /> {errors.title}</div>}
                            </motion.div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                    <label className="form-label">Price (₹)</label>
                                    <input type="number" value={formData.price} onChange={e => { setFormData({...formData, price: e.target.value}); if (errors.price) setErrors({...errors, price: null}); }} className="form-input" style={{ borderColor: errors.price ? '#ef4444' : undefined, background: errors.price ? '#fef2f2' : undefined }} disabled={isUploading} />
                                    {errors.price && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}><AlertCircle size={14} /> {errors.price}</div>}
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <label className="form-label">Category</label>
                                    <select value={formData.category} onChange={e => { setFormData({...formData, category: e.target.value}); if (errors.category) setErrors({...errors, category: null}); }} className="form-input" style={{ appearance: 'none', background: errors.category ? '#fef2f2' : undefined, borderColor: errors.category ? '#ef4444' : undefined }} disabled={isUploading}>
                                        <option value="" disabled>Select</option>
                                        {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.category && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}><AlertCircle size={14} /> {errors.category}</div>}
                                </motion.div>
                            </div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                <label className="form-label">Course Thumbnail</label>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setThumbnailMode('file')}
                                        style={{ 
                                            flex: 1, 
                                            padding: '0.6rem', 
                                            borderRadius: '10px', 
                                            border: '1px solid', 
                                            borderColor: thumbnailMode === 'file' ? '#4f46e5' : '#e2e8f0',
                                            background: thumbnailMode === 'file' ? '#eff6ff' : 'white',
                                            color: thumbnailMode === 'file' ? '#4f46e5' : '#64748b',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Upload File
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setThumbnailMode('url')}
                                        style={{ 
                                            flex: 1, 
                                            padding: '0.6rem', 
                                            borderRadius: '10px', 
                                            border: '1px solid', 
                                            borderColor: thumbnailMode === 'url' ? '#4f46e5' : '#e2e8f0',
                                            background: thumbnailMode === 'url' ? '#eff6ff' : 'white',
                                            color: thumbnailMode === 'url' ? '#4f46e5' : '#64748b',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Image URL
                                    </button>
                                </div>

                                {thumbnailMode === 'file' ? (
                                    <input type="file" onChange={e => setThumbnailFile(e.target.files[0])} accept="image/*" className="form-input" style={{ padding: '0.65rem' }} disabled={isUploading} />
                                ) : (
                                    <input 
                                        placeholder="Paste image address (e.g. https://...)" 
                                        value={thumbnailUrl} 
                                        onChange={e => setThumbnailUrl(e.target.value)} 
                                        className="form-input" 
                                        disabled={isUploading} 
                                    />
                                )}

                                {(thumbnailFile || thumbnailUrl) && (
                                    <div style={{ marginTop: '1rem', position: 'relative', width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img 
                                            src={thumbnailMode === 'file' ? URL.createObjectURL(thumbnailFile) : thumbnailUrl} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Invalid+Image+URL'; }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <label className="form-label">Description</label>
                                <textarea value={formData.description} onChange={e => { setFormData({...formData, description: e.target.value}); if (errors.description) setErrors({...errors, description: null}); }} className="form-input form-textarea" style={{ borderColor: errors.description ? '#ef4444' : undefined, background: errors.description ? '#fef2f2' : undefined }} disabled={isUploading} />
                                {errors.description && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}><AlertCircle size={14} /> {errors.description}</div>}
                            </motion.div>
                            <button type="submit" disabled={isUploading} className="btn-submit" style={{ marginTop: '0.5rem' }}>
                                {isUploading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> {isEditModalOpen ? 'Updating...' : 'Creating...'}</> : (isEditModalOpen ? 'Save Changes' : 'Create Course')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
        </div>
    );
};

export default InstructorCourses;

const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', outline: 'none', fontSize: '0.95rem' };
