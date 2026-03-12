import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { 
    LayoutDashboard, FileText, Video, ClipboardList, GraduationCap, Users, 
    Plus, Trash2, Search, ArrowLeft, MoreVertical, Edit, Upload, Download,
    CheckCircle, X, Check, HelpCircle, PlusCircle, Clock, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const InstructorCourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content'); // content, assessments, gradebook, students

    // Content State
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [contentTitle, setContentTitle] = useState('');
    const [contentDescription, setContentDescription] = useState('');
    const [contentType, setContentType] = useState('pdf');
    const [editingContent, setEditingContent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Assessment State
    const [assessmentTab, setAssessmentTab] = useState('assignments'); // assignments, quizzes
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [quizForm, setQuizForm] = useState({ 
        title: '', 
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] 
    });
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);

    // Gradebook State
    const [gradebookData, setGradebookData] = useState([]);
    const [gradebookLoading, setGradebookLoading] = useState(false);
     const [gradebookFilter, setGradebookFilter] = useState('all');

    // Modal States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, type: '', id: null });

    const openConfirmModal = (type, id) => {
        setConfirmModalState({ isOpen: true, type, id });
    };

    const closeConfirmModal = () => {
        setConfirmModalState({ isOpen: false, type: '', id: null });
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const [viewingAssessment, setViewingAssessment] = useState(null);

    useEffect(() => {
        if (activeTab === 'gradebook') {
            fetchGradebook();
        }
    }, [activeTab]);

    const fetchCourseDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}`);
            if (!res.ok) throw new Error('Course not found');
            const data = await res.json();
            setCourse(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load course details');
            navigate('/instructor/courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchGradebook = async () => {
        setGradebookLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/gradebook`);
            if (res.ok) {
                const data = await res.json();
                setGradebookData(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Could not load gradebook");
        } finally {
            setGradebookLoading(false);
        }
    };

    // --- Content Handlers ---
    const handleUploadContent = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', contentTitle);
        formData.append('description', contentDescription);
        formData.append('type', contentType);

        setUploading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/content`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const updatedContent = await res.json();
                setCourse({ ...course, content: updatedContent });
                toast.success('Content uploaded successfully');
                setUploadFile(null);
                setContentTitle('');
                setContentDescription('');
                setShowUploadModal(false);
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
        openConfirmModal('content', contentId);
    };

    const performDeleteContent = async (contentId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/content/${contentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updatedContent = await res.json();
                setCourse({ ...course, content: updatedContent });
                toast.success('Content deleted');
            }
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        }
    };

    const handleEditContent = (item) => {
        setEditingContent({ ...item });
        setIsEditModalOpen(true);
    };

    const handleUpdateContent = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', editingContent.title);
        formData.append('description', editingContent.description);
        formData.append('type', editingContent.type);
        if (uploadFile) {
            formData.append('file', uploadFile);
        }

        setUploading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/content/${editingContent._id}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                const updatedContent = await res.json();
                setCourse({ ...course, content: updatedContent });
                toast.success('Content updated successfully');
                setIsEditModalOpen(false);
                setEditingContent(null);
                setUploadFile(null);
            } else {
                toast.error('Update failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Update error');
        } finally {
            setUploading(false);
        }
    };

    // --- Assessment Handlers ---
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let url = `http://localhost:5000/api/courses/${id}/assignments`;
            let method = 'POST';

            if (editingAssignment) {
                url = `http://localhost:5000/api/courses/${id}/assignments/${editingAssignment._id}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentForm)
            });

            if (res.ok) {
                const updatedAssignments = await res.json();
                setCourse({ ...course, assignments: updatedAssignments });
                setAssignmentForm({ title: '', description: '', dueDate: '' });
                setEditingAssignment(null); // Reset editing state
                toast.success(editingAssignment ? 'Assignment updated!' : 'Assignment posted!');
                setShowAssignmentModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error(editingAssignment ? 'Failed to update assignment' : 'Failed to post assignment');
        } finally {
            setUploading(false);
        }
    };

    const handleEditAssignment = (assign) => {
        setEditingAssignment(assign);
        setAssignmentForm({
            title: assign.title,
            description: assign.description,
            dueDate: assign.dueDate ? assign.dueDate.split('T')[0] : ''
        });
        setShowAssignmentModal(true);
    };

    const handleDeleteAssignment = (assignId) => {
        openConfirmModal('assignment', assignId);
    };

    const performDeleteAssignment = async (assignId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/assignments/${assignId}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedAssignments = await res.json();
                setCourse({ ...course, assignments: updatedAssignments });
                toast.success('Assignment deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let url = `http://localhost:5000/api/courses/${id}/quizzes`;
            let method = 'POST';

            if (editingQuiz) {
                url = `http://localhost:5000/api/courses/${id}/quizzes/${editingQuiz._id}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizForm)
            });

            if (res.ok) {
                const updatedQuizzes = await res.json();
                setCourse({ ...course, quizzes: updatedQuizzes });
                setQuizForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
                setEditingQuiz(null); // Reset editing state
                toast.success(editingQuiz ? 'Quiz updated!' : 'Quiz created!');
                setShowQuizModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error(editingQuiz ? 'Failed to update quiz' : 'Failed to create quiz');
        } finally {
            setUploading(false);
        }
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);
        setQuizForm({
            title: quiz.title,
            questions: quiz.questions || []
        });
        setShowQuizModal(true);
    };

    const handleDeleteQuiz = (quizId) => {
        openConfirmModal('quiz', quizId);
    };

    const performDeleteQuiz = async (quizId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/quizzes/${quizId}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedQuizzes = await res.json();
                setCourse({ ...course, quizzes: updatedQuizzes });
                toast.success('Quiz deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

     // Quiz Form Helpers
    const handleAddQuestion = () => {
        setQuizForm({ ...quizForm, questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
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

    if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc'}}>Loading...</div>;


    // ... (keep existing handlers) ...

    const confirmDeletion = () => {
        const { type, id } = confirmModalState;
        if (type === 'content') performDeleteContent(id);
        else if (type === 'assignment') performDeleteAssignment(id);
        else if (type === 'quiz') performDeleteQuiz(id);
        closeConfirmModal();
    };

    const getConfirmMessage = () => {
        const { type } = confirmModalState;
        if (type === 'content') return 'Are you sure you want to permanently delete this content module from the course? This action cannot be undone.';
        if (type === 'assignment') return 'Are you sure you want to permanently delete this assignment? Student submissions may be affected.';
        if (type === 'quiz') return 'Are you sure you want to permanently delete this quiz? Student attempts may be affected.';
        return 'Are you sure you want to delete this item?';
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Top Header */}
                <div style={{ padding: '1.5rem 3rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <button onClick={() => navigate('/instructor/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                                <ArrowLeft size={18} />
                            </button>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{course?.title}</h1>
                            <span style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{course?.status || 'Active'}</span>
                         </div>
                         <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', marginLeft: '2rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14}/> {course?.students || 0} Students</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14}/> {course?.content?.length || 0} Lessons</span>
                        </div>
                    </div>
                    <div>
                        {/* Course Level Actions */}
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    {/* Vertical Side Navigation */}
                    <div style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>Manage Course</h3>
                        
                        <button 
                            onClick={() => setActiveTab('content')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                                width: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'content' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'content' ? '#2563eb' : '#475569',
                                fontWeight: activeTab === 'content' ? 600 : 500,
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={18} /> Content
                        </button>
                        <button 
                            onClick={() => setActiveTab('assessments')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                                width: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'assessments' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'assessments' ? '#2563eb' : '#475569',
                                fontWeight: activeTab === 'assessments' ? 600 : 500,
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ClipboardList size={18} /> Assessments
                        </button>
                        <button 
                            onClick={() => setActiveTab('gradebook')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                                width: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'gradebook' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'gradebook' ? '#2563eb' : '#475569',
                                fontWeight: activeTab === 'gradebook' ? 600 : 500,
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <GraduationCap size={18} /> Gradebook
                        </button>
                    </div>

                    {/* Main Content View */}
                    <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', background: '#f8fafc' }}>
                        
                        {/* --- CONTENT TAB --- */}
                        {activeTab === 'content' && (
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Course Content</h2>
                                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage your lessons and materials.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowUploadModal(true)}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                                    >
                                        <Plus size={20} /> Add Content
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {course?.content?.length > 0 ? (
                                        course.content.map(item => (
                                            <motion.div 
                                                key={item._id} 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                className="card" 
                                                style={{ 
                                                    padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', 
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    boxShadow: '0 2px 4px -2px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                    <div style={{ 
                                                        width: '50px', height: '50px', 
                                                        background: item.type === 'video' ? '#eff6ff' : '#f0fdf4', 
                                                        color: item.type === 'video' ? '#2563eb' : '#16a34a',
                                                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                    }}>
                                                        {item.type === 'video' ? <Video size={24}/> : <FileText size={24}/>}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{item.title}</h4>
                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
                                                            {item.description && <span style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• {item.description}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditContent(item)} style={{ padding: '0.6rem', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Edit"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteContent(item._id)} style={{ padding: '0.6rem', color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete"><Trash2 size={18} /></button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                                            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                <Upload size={32} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No contents yet</h3>
                                            <p style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>Get started by uploading your first video lesson or PDF resource.</p>
                                            <button onClick={() => setShowUploadModal(true)} style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Upload Material</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- ASSESSMENTS TAB --- */}
                        {activeTab === 'assessments' && (
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Assessments</h2>
                                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage assignments and quizzes.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => setShowAssignmentModal(true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            <Plus size={18} /> Assignment
                                        </button>
                                        <button 
                                            onClick={() => setShowQuizModal(true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                                        >
                                            <Plus size={18} /> Quiz
                                        </button>
                                    </div>
                                </div>

                                {/* Assessments Sub-navigation */}
                                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                    <button 
                                        onClick={() => setAssessmentTab('assignments')}
                                        style={{ 
                                            padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
                                            color: assessmentTab === 'assignments' ? '#2563eb' : '#64748b',
                                            fontWeight: assessmentTab === 'assignments' ? 600 : 500,
                                            borderBottom: assessmentTab === 'assignments' ? '2px solid #2563eb' : '2px solid transparent'
                                        }}
                                    >
                                        Assignments
                                    </button>
                                    <button 
                                        onClick={() => setAssessmentTab('quizzes')}
                                        style={{ 
                                            padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
                                            color: assessmentTab === 'quizzes' ? '#2563eb' : '#64748b',
                                            fontWeight: assessmentTab === 'quizzes' ? 600 : 500,
                                            borderBottom: assessmentTab === 'quizzes' ? '2px solid #2563eb' : '2px solid transparent'
                                        }}
                                    >
                                        Quizzes
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    
                                    {/* Assignments View */}
                                    {assessmentTab === 'assignments' && (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                                {course?.assignments?.length > 0 ? course.assignments.map(assign => (
                                                    <motion.div 
                                                        key={assign._id} 
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                                        className="card" 
                                                        style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                        onClick={() => setViewingAssessment({ ...assign, type: 'assignment' })}
                                                        whileHover={{ y: -2 }}
                                                    >
                                                         <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditAssignment(assign); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-blue-500"><Edit size={16} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(assign._id); }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-red-500"><Trash2 size={16} /></button>
                                                         </div>
                                                         <div style={{ width: '40px', height: '40px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                             <FileText size={20} />
                                                         </div>
                                                         <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>{assign.title}</h4>
                                                         <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{assign.description}</p>
                                                         {assign.dueDate && <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Due: {new Date(assign.dueDate).toLocaleDateString()}</div>}
                                                    </motion.div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                                                        <FileText size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                                        <p>No assignments created yet.</p>
                                                        <button onClick={() => setShowAssignmentModal(true)} style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Create First Assignment</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quizzes View */}
                                    {assessmentTab === 'quizzes' && (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                                {course?.quizzes?.length > 0 ? course.quizzes.map(quiz => (
                                                    <motion.div 
                                                        key={quiz._id} 
                                                        initial={{ opacity: 0 }} 
                                                        animate={{ opacity: 1 }} 
                                                        className="card" 
                                                        style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' }}
                                                        onClick={() => setViewingAssessment({ ...quiz, type: 'quiz' })}
                                                        whileHover={{ y: -2 }}
                                                    >
                                                         <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditQuiz(quiz); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-blue-500"><Edit size={16} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz._id); }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-red-500"><Trash2 size={16} /></button>
                                                         </div>
                                                         <div style={{ width: '40px', height: '40px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                             <CheckCircle size={20} />
                                                         </div>
                                                         <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>{quiz.title}</h4>
                                                         <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0' }}>{quiz.questions?.length} Questions</p>
                                                    </motion.div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                                                        <CheckCircle size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                                        <p>No quizzes created yet.</p>
                                                        <button onClick={() => setShowQuizModal(true)} style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Create First Quiz</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* --- GRADEBOOK TAB --- */}
                        {activeTab === 'gradebook' && (
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Gradebook</h2>
                                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track student progress and performance.</p>
                                </div>
                                <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    {/* (Existing Gradebook Table Code) */}
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                                        <select value={gradebookFilter} onChange={e => setGradebookFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                                            <option value="all">All Students</option>
                                            <option value="passed">Passing</option>
                                            <option value="failed">At Risk</option>
                                        </select>
                                    </div>
                                    {/* ... Reuse existing table logic here ... */}
                                    {gradebookLoading ? <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div> : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Student</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Overall Progress</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Assignments</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Quizzes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradebookData.map((student, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1e293b' }}>
                                                            <div>{student.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', maxWidth: '100px' }}>
                                                                    <div style={{ width: `${student.progress}%`, height: '100%', background: student.progress >= 80 ? '#22c55e' : '#3b82f6', borderRadius: '3px' }}/>
                                                                </div>
                                                                <span style={{ fontSize: '0.85rem', color: '#475569' }}>{student.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>{student.assignments?.length}</td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>
                                                            {student.quizzes?.length > 0 ? (
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    {student.quizzes.map((q, j) => (
                                                                        <div key={j} style={{ width: '20px', height: '20px', borderRadius: '4px', background: q.score >= 80 ? '#dcfce7' : '#fee2e2', color: q.score >= 80 ? '#166534' : '#991b1b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                                            {q.score}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- MODALS --- */}
                
                {/* Upload Content Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>Upload New Content</h3>
                                    <button type="button" onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                                </div>
                                <form onSubmit={handleUploadContent}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input required value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="Lesson Title" style={inputStyle} disabled={uploading} />
                                        <textarea value={contentDescription} onChange={e => setContentDescription(e.target.value)} placeholder="Description..." style={{...inputStyle, minHeight: '80px'}} disabled={uploading} />
                                        <select value={contentType} onChange={e => setContentType(e.target.value)} style={inputStyle} disabled={uploading}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lesson</option>
                                        </select>
                                        <input type="file" required onChange={e => setUploadFile(e.target.files[0])} style={inputStyle} disabled={uploading} />
                                        <button type="submit" disabled={uploading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
                                            {uploading ? <><Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Assignment Modal */}
                <AnimatePresence>
                    {showAssignmentModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h3>
                                    <button type="button" onClick={() => { setShowAssignmentModal(false); setEditingAssignment(null); setAssignmentForm({ title: '', description: '', dueDate: '' }); }} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                                </div>
                                <form onSubmit={handleCreateAssignment}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input required value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="Title" style={inputStyle} disabled={uploading} />
                                        <textarea required value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} placeholder="Instructions..." style={{...inputStyle, minHeight: '100px'}} disabled={uploading} />
                                        <input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} style={inputStyle} disabled={uploading} />
                                        <button type="submit" disabled={uploading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
                                            {uploading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quiz Modal */}
                <AnimatePresence>
                    {showQuizModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h3>
                                    <button type="button" onClick={() => { setShowQuizModal(false); setEditingQuiz(null); setQuizForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] }); }} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                                </div>
                                <form onSubmit={handleCreateQuiz}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={labelStyle}>Quiz Title</label>
                                        <input required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} style={inputStyle} placeholder="e.g. Module 1 Quiz" disabled={uploading} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        {quizForm.questions.map((q, qIndex) => (
                                            <div key={qIndex} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#6366f1' }}>Question {qIndex + 1}</span>
                                                    {quizForm.questions.length > 1 && <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
                                                </div>
                                                <input required value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} style={{ ...inputStyle, marginBottom: '1rem', background: 'white' }} placeholder="Enter your question here..." disabled={uploading} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer == oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} style={{ accentColor: '#10b981', width: '16px', height: '16px' }} disabled={uploading} />
                                                            <input required value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.9rem', background: 'white' }} disabled={uploading} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" onClick={handleAddQuestion} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', background: '#e0e7ff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}><PlusCircle size={18} /> Add Question</button>
                                        <button type="submit" disabled={uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#4f46e5', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            {uploading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : (editingQuiz ? 'Update Quiz' : 'Publish Quiz')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Edit Content Modal */}
                <AnimatePresence>
                    {isEditModalOpen && editingContent && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
                        >
                            <motion.div 
                                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                className="card"
                                style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Edit Content</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                                </div>
                                
                                <form onSubmit={handleUpdateContent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Title</label>
                                        <input required value={editingContent.title} onChange={e => setEditingContent({...editingContent, title: e.target.value})} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Description</label>
                                        <textarea value={editingContent.description} onChange={e => setEditingContent({...editingContent, description: e.target.value})} style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>File Type</label>
                                        <select value={editingContent.type} onChange={e => setEditingContent({...editingContent, type: e.target.value})} style={{...inputStyle, background: 'white'}}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lesson</option>
                                            <option value="image">Image resource</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Replace File (Optional)</label>
                                        <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{...inputStyle, padding: '0.5rem'}} />
                                        {editingContent.fileName && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Current file: {editingContent.fileName}</p>}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" disabled={uploading} onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '0.85rem', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" disabled={uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: 1, padding: '0.85rem', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            {uploading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* View Assessment Detail Modal */}
                <AnimatePresence>
                    {viewingAssessment && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'white', padding: '0', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: viewingAssessment.type === 'assignment' ? '#e0f2fe' : '#dcfce7', color: viewingAssessment.type === 'assignment' ? '#0369a1' : '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            {viewingAssessment.type === 'assignment' ? 'Assignment' : 'Quiz'}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{viewingAssessment.title}</h3>
                                    </div>
                                    <button onClick={() => setViewingAssessment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                                </div>
                                
                                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                    {viewingAssessment.type === 'assignment' ? (
                                        <>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Instructions</h4>
                                                <p style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>{viewingAssessment.description}</p>
                                            </div>
                                            {viewingAssessment.dueDate && (
                                                <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#b45309' }}>
                                                    <Clock size={16} />
                                                    <span style={{ fontWeight: 600 }}>Due Date: {new Date(viewingAssessment.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Questions ({viewingAssessment.questions?.length})</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {viewingAssessment.questions?.map((q, i) => (
                                                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>{i+1}. {q.question}</p>
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                                                                {q.options?.map((opt, j) => (
                                                                    <li key={j} style={{ padding: '0.5rem 0.75rem', background: q.correctAnswer === j ? '#dcfce7' : 'white', border: q.correctAnswer === j ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', color: q.correctAnswer === j ? '#166534' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {q.correctAnswer === j && <CheckCircle size={14} />} {opt}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setViewingAssessment(null)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <ConfirmModal
                    isOpen={confirmModalState.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmDeletion}
                    title={`Delete ${confirmModalState.type === 'content' ? 'Content' : confirmModalState.type === 'assignment' ? 'Assignment' : 'Quiz'}?`}
                    message={getConfirmMessage()}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDestructive={true}
                    icon={Trash2}
                />
            </main>
        </div>
    );
};

// Styles
const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', outline: 'none', fontSize: '0.95rem' };

export default InstructorCourseDetails;
