
import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { Plus, Trash2, Edit, Search, X as XIcon, FileText, Video, Image as ImageIcon, MoreVertical, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

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
    const user = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        title: '', description: '', instructor: user?.name || '', price: '', category: '', thumbnail: '📚'
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
        try {
            const payload = { ...formData, instructor: user.name }; // Ensure current user is set
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error('Failed to create course');
            }
            setIsModalOpen(false);
            setFormData({ title: '', description: '', instructor: user.name, price: '', category: '', thumbnail: '📚' });
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

        const formDataPayload = new FormData();
        formDataPayload.append('file', uploadFile);
        formDataPayload.append('title', contentTitle);
        formDataPayload.append('type', contentType);

        setUploading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/content`, {
                method: 'POST',
                body: formDataPayload
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
            message: 'Remove this content permanently?',
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
            setFormData({ title: '', description: '', instructor: user.name, price: '', category: '', thumbnail: '📚' });
            fetchCourses();
            toast.success('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        }
    };

    const getTypeIcon = (type) => {
        if (type === 'video') return <Video size={16} />;
        if (type === 'image') return <ImageIcon size={16} />;
        return <FileText size={16} />;
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>My Courses</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Create and manage your courses</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)', transition: 'transform 0.2s', border: 'none', fontWeight: 600, cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Plus size={20} /> Create New Course
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.length > 0 ? courses.map(course => (
                        <motion.div 
                            key={course._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', background: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>{course.category}</span>
                                    <div style={{ cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={20} /></div>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', lineHeight: 1.3 }}>{course.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FileText size={16} /> {course.content?.length || 0} Lessons
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Users size={16} /> 0 Students
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>₹{course.price}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleOpenContentModal(course)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e0f2fe', background: 'white', color: '#0ea5e9', cursor: 'pointer' }} title="Manage Content"><FileText size={18} /></button>
                                    <button onClick={() => handleEdit(course)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }} title="Edit"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(course._id)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#94a3b8' }}><BookOpen size={32} /></div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No courses yet</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start your teaching journey by creating your first course.</p>
                            <button onClick={() => setIsModalOpen(true)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Create Course</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Reuse Modals Logic - Same as Admin but Styled */}
             {contentModalOpen && selectedCourse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card" 
                        style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', background: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Course Content</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedCourse.title}</p>
                            </div>
                            <button onClick={() => setContentModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', border: 'none', cursor: 'pointer' }}><XIcon size={20} /></button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Upload Material</h3>
                                <form onSubmit={handleUploadContent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input placeholder="Content Title" value={contentTitle} onChange={e => setContentTitle(e.target.value)} required style={inputStyle} />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <select value={contentType} onChange={e => setContentType(e.target.value)} style={{ ...inputStyle, flex: 1, background: 'white' }}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lesson</option>
                                            <option value="image">Image/Diagram</option>
                                        </select>
                                        <input type="file" onChange={e => setUploadFile(e.target.files[0])} required style={{ ...inputStyle, flex: 2, padding: '0.5rem', background: 'white' }} />
                                    </div>
                                    <button type="submit" disabled={uploading} style={{ marginTop: '0.5rem', background: '#1e293b', color: 'white', fontWeight: 600, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>
                                        {uploading ? 'Uploading...' : 'Upload Content'}
                                    </button>
                                </form>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Lesson List</h3>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {selectedCourse.content?.map(item => (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{item.title}</span>
                                        </div>
                                        <button onClick={() => handleDeleteContent(item._id)} style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create/Edit Modal UI (Simplified for brevity, similar to above content modal structure) */}
             {(isModalOpen || isEditModalOpen) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '16px', padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{isEditModalOpen ? 'Edit Course' : 'Create Course'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', border: 'none', cursor: 'pointer' }}><XIcon size={20} /></button>
                        </div>
                         <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Course Title</label>
                                <input placeholder="e.g. Master ReactJS" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={labelStyle}>Price (₹)</label><input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} /></div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ ...inputStyle, background: 'white' }}>
                                        <option value="" disabled>Select</option>
                                        {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label style={labelStyle}>Description</label><textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: '100px' }} /></div>
                            <button type="submit" style={{ padding: '1rem', background: '#4f46e5', color: 'white', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{isEditModalOpen ? 'Save Changes' : 'Create Course'}</button>
                        </form>
                    </motion.div>
                </div>
            )}

            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
        </div>
    );
};

const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', outline: 'none', fontSize: '0.95rem' };

export default InstructorCourses;
