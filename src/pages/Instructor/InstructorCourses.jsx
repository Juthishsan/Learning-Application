
import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import GradebookModal from '../../components/Instructor/GradebookModal';
import { Plus, Trash2, Edit, Search, X as XIcon, FileText, Video, Image as ImageIcon, MoreVertical, Users, BookOpen, ClipboardList, CheckSquare, PlusCircle, Trash, GraduationCap } from 'lucide-react';
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
    const user = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        title: '', description: '', instructor: user?.name || '', price: '', category: '', thumbnail: ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
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
            const formDataPayload = new FormData();
            formDataPayload.append('title', formData.title);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('instructor', user.name);
            formDataPayload.append('instructorId', user.id || user._id);
            formDataPayload.append('price', formData.price);
            formDataPayload.append('category', formData.category);
            if (thumbnailFile) {
                formDataPayload.append('thumbnail', thumbnailFile);
            }

            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                body: formDataPayload
            });
            if (!response.ok) {
                throw new Error('Failed to create course');
            }
            setIsModalOpen(false);
            setIsModalOpen(false);
            setFormData({ title: '', description: '', instructor: user.name, price: '', category: '', thumbnail: '' });
            setThumbnailFile(null);
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
    const [gradebookModalOpen, setGradebookModalOpen] = useState(false);

    const handleOpenGradebook = (course) => {
        setSelectedCourse(course);
        setGradebookModalOpen(true);
    };

    // Assessment State
    const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [assessmentTab, setAssessmentTab] = useState('assignments'); // 'assignments' or 'quizzes'
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [quizForm, setQuizForm] = useState({ 
        title: '', 
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] 
    });

    const handleOpenAssessmentModal = (course) => {
        setSelectedCourse(course);
        setAssessmentModalOpen(true);
        // Reset forms
        setAssignmentForm({ title: '', description: '', dueDate: '' });
        setQuizForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentForm)
            });
            if (res.ok) {
                const updatedAssignments = await res.json();
                const updatedCourse = { ...selectedCourse, assignments: updatedAssignments };
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                setSelectedCourse(updatedCourse);
                setAssignmentForm({ title: '', description: '', dueDate: '' });
                toast.success('Assignment posted!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to post assignment');
        }
    };

    const handleDeleteAssignment = async (assignId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/assignments/${assignId}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedAssignments = await res.json();
                const updatedCourse = { ...selectedCourse, assignments: updatedAssignments };
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                setSelectedCourse(updatedCourse);
                toast.success('Assignment deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddQuestion = () => {
        setQuizForm({
            ...quizForm,
            questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...quizForm.questions];
        newQuestions[index][field] = value;
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...quizForm.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = quizForm.questions.filter((_, i) => i !== index);
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizForm)
            });
            if (res.ok) {
                const updatedQuizzes = await res.json();
                const updatedCourse = { ...selectedCourse, quizzes: updatedQuizzes };
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                setSelectedCourse(updatedCourse);
                setQuizForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
                toast.success('Quiz created!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to create quiz');
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/quizzes/${quizId}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedQuizzes = await res.json();
                const updatedCourse = { ...selectedCourse, quizzes: updatedQuizzes };
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
                setSelectedCourse(updatedCourse);
                toast.success('Quiz deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

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
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('title', formData.title);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('instructor', formData.instructor);
            formDataPayload.append('price', formData.price);
            formDataPayload.append('category', formData.category);
            if (thumbnailFile) {
                formDataPayload.append('thumbnail', thumbnailFile);
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
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>My Courses</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '1.1rem' }}>Manage your portfolio and create new learning experiences.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            padding: '1rem 2rem', 
                            borderRadius: '16px', 
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)', 
                            border: 'none', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Plus size={22} /> Create New Course
                    </button>
                </header>

                <div className="card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    
                    {/* Toolbar */}
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#ffffff' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                placeholder="Search courses by name or category..." 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.85rem 1rem 0.85rem 3rem', 
                                    borderRadius: '14px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    background: '#f8fafc',
                                    fontSize: '0.95rem',
                                    color: '#475569'
                                }} 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} /> Category
                            </button>
                            <button style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Sort By
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
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffedd5', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                                                {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                                                    <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                ) : (
                                                    course.title.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{course.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: '#475569' }}>
                                        {course.category}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#334155' }}>
                                        ₹{course.price}
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
                                            0
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenAssessmentModal(course); }} 
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e0e7ff', background: 'white', color: '#6366f1', cursor: 'pointer', transition: 'all 0.2s' }} 
                                                title="Assessments"
                                            >
                                                <ClipboardList size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenContentModal(course); }} 
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e0f2fe', background: 'white', color: '#0ea5e9', cursor: 'pointer', transition: 'all 0.2s' }} 
                                                title="Manage Content"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenGradebook(course); }} 
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #dcfce7', background: 'white', color: '#16a34a', cursor: 'pointer', transition: 'all 0.2s' }} 
                                                title="Gradebook"
                                            >
                                                <GraduationCap size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEdit(course); }} 
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }} 
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(course._id); }} 
                                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} 
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
                            <div>
                                <label style={labelStyle}>Course Thumbnail</label>
                                <input type="file" onChange={e => setThumbnailFile(e.target.files[0])} accept="image/*" style={{ ...inputStyle, padding: '0.5rem', background: 'white' }} />
                                {formData.thumbnail && !thumbnailFile && typeof formData.thumbnail === 'string' && formData.thumbnail.startsWith('http') && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>Current thumbnail: <a href={formData.thumbnail} target="_blank" rel="noopener noreferrer">View</a></div>
                                )}
                            </div>
                            <div><label style={labelStyle}>Description</label><textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: '100px' }} /></div>
                            <button type="submit" style={{ padding: '1rem', background: '#4f46e5', color: 'white', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{isEditModalOpen ? 'Save Changes' : 'Create Course'}</button>
                        </form>
                    </motion.div>
                </div>
            )}


            {assessmentModalOpen && selectedCourse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card" 
                        style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', background: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Course Assessments</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedCourse.title}</p>
                            </div>
                            <button onClick={() => setAssessmentModalOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', border: 'none', cursor: 'pointer' }}><XIcon size={20} /></button>
                        </div>

                        <div style={{ padding: '0 1.5rem', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <button 
                                    onClick={() => setAssessmentTab('assignments')}
                                    style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: assessmentTab === 'assignments' ? '2px solid #6366f1' : '2px solid transparent', color: assessmentTab === 'assignments' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Assignments
                                </button>
                                <button 
                                    onClick={() => setAssessmentTab('quizzes')}
                                    style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: assessmentTab === 'quizzes' ? '2px solid #6366f1' : '2px solid transparent', color: assessmentTab === 'quizzes' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Quizzes
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {assessmentTab === 'assignments' ? (
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    {/* Existing Assignments List */}
                                    <div style={{ flex: 1, borderRight: '1px solid #e2e8f0', paddingRight: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Posted Assignments</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedCourse.assignments && selectedCourse.assignments.length > 0 ? selectedCourse.assignments.map(assign => (
                                                <div key={assign._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{assign.title}</h4>
                                                        <button onClick={() => handleDeleteAssignment(assign._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{assign.description}</p>
                                                    {assign.dueDate && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Due: {new Date(assign.dueDate).toLocaleDateString()}</div>}
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active assignments.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Create New Assignment Form */}
                                    <div style={{ width: '300px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>New Assignment</h3>
                                        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Title</label>
                                                <input required value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} style={inputStyle} placeholder="Assignment Title" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Description</label>
                                                <textarea required value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} style={{ ...inputStyle, minHeight: '100px' }} placeholder="Instructions..." />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Due Date</label>
                                                <input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} style={inputStyle} />
                                            </div>
                                            <button type="submit" style={{ padding: '0.75rem', background: '#4f46e5', color: 'white', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Post Assignment</button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Quiz Creation UI */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Create Assessment Quiz</h3>
                                        <form onSubmit={handleCreateQuiz} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={labelStyle}>Quiz Title</label>
                                                <input required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} style={{ ...inputStyle, background: 'white' }} placeholder="e.g. Mid-Term Assessment" />
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {quizForm.questions.map((q, qIndex) => (
                                                    <div key={qIndex} style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                            <span style={{ fontWeight: 600, color: '#6366f1' }}>Question {qIndex + 1}</span>
                                                            {quizForm.questions.length > 1 && (
                                                                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={16} /></button>
                                                            )}
                                                        </div>
                                                        <input 
                                                            required 
                                                            value={q.question} 
                                                            onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} 
                                                            style={{ ...inputStyle, marginBottom: '1rem' }} 
                                                            placeholder="Enter your question here..." 
                                                        />
                                                        
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            {q.options.map((opt, oIndex) => (
                                                                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <input 
                                                                        type="radio" 
                                                                        name={`correct-${qIndex}`} 
                                                                        checked={q.correctAnswer == oIndex} 
                                                                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                                        style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                                                    />
                                                                    <input 
                                                                        required 
                                                                        value={opt} 
                                                                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} 
                                                                        placeholder={`Option ${oIndex + 1}`} 
                                                                        style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.9rem' }} 
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <button type="button" onClick={handleAddQuestion} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', background: '#e0e7ff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                    <PlusCircle size={18} /> Add Question
                                                </button>
                                                <button type="submit" style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                    Publish Quiz
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Existing Quizzes List */}
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Published Quizzes</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                            {selectedCourse.quizzes && selectedCourse.quizzes.length > 0 ? selectedCourse.quizzes.map(quiz => (
                                                <div key={quiz._id} style={{ padding: '1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{quiz.title}</h4>
                                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{quiz.questions?.length || 0} Questions</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteQuiz(quiz._id)} style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No quizzes published yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <GradebookModal 
                isOpen={gradebookModalOpen} 
                onClose={() => setGradebookModalOpen(false)} 
                courseId={selectedCourse?._id}
                courseTitle={selectedCourse?.title}
            />

            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
        </div>
    );
};

export default InstructorCourses;

const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', outline: 'none', fontSize: '0.95rem' };
