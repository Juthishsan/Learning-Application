import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { 
    LayoutDashboard, FileText, Video, ClipboardList, GraduationCap, Users, 
    Plus, Trash2, Search, ArrowLeft, MoreVertical, Edit, Upload, Download,
    CheckCircle, X, Check, HelpCircle, PlusCircle, Clock, Loader2, Sparkles, FileUp, Square, CheckSquare, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import GradeStudentModal from '../../components/Modals/GradeStudentModal';

const InstructorCourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'content'); // content, assessments, gradebook, students

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Content State
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [contentTitle, setContentTitle] = useState('');
    const [contentDescription, setContentDescription] = useState('');
    const [contentType, setContentType] = useState('pdf');
    const [editingContent, setEditingContent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // AI Syllabus Builder State
    const [showSyllabusModal, setShowSyllabusModal] = useState(false);
    const [syllabusStep, setSyllabusStep] = useState('input'); // 'input' or 'review'
    const [syllabusTopic, setSyllabusTopic] = useState('');
    const [generatedSyllabus, setGeneratedSyllabus] = useState([]);
    const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);
    const [isSavingSyllabus, setIsSavingSyllabus] = useState(false);
    
    // Bulk Delete State
    const [selectedContents, setSelectedContents] = useState([]);

    // Assessment State
    const [assessmentTab, setAssessmentTab] = useState('assignments'); // assignments, quizzes
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [quizForm, setQuizForm] = useState({ 
        title: '', 
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] 
    });
    const [isGeneratingAIQuiz, setIsGeneratingAIQuiz] = useState(false);
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
    const [selectedStudentForGrading, setSelectedStudentForGrading] = useState(null);
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
    const [viewingContentDetails, setViewingContentDetails] = useState(null);

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
                // Remove from selected list if it was selected
                setSelectedContents(prev => prev.filter(id => id !== contentId));
            }
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        }
    };

    const handleSelectAllContent = (e) => {
        if (e.target.checked) {
            setSelectedContents(course?.content?.map(item => item._id) || []);
        } else {
            setSelectedContents([]);
        }
    };

    const handleSelectContent = (id) => {
        if (selectedContents.includes(id)) {
            setSelectedContents(selectedContents.filter(item => item !== id));
        } else {
            setSelectedContents([...selectedContents, id]);
        }
    };

    const handleBulkDeleteContent = () => {
        if (selectedContents.length === 0) return;
        openConfirmModal('bulk-content', null);
    };

    const performDeleteBulkContent = async () => {
        setIsSavingSyllabus(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/content/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentIds: selectedContents }),
            });

            if (res.ok) {
                const updatedContent = await res.json();
                setCourse({ ...course, content: updatedContent });
                setSelectedContents([]);
                toast.success(`${selectedContents.length} items deleted successfully`);
                closeConfirmModal();
            } else {
                toast.error('Failed to perform bulk deletion');
            }
        } catch (err) {
            console.error(err);
            toast.error('Bulk delete error');
        } finally {
            setIsSavingSyllabus(false);
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

    const handleGenerateSyllabus = async (e) => {
        e.preventDefault();
        setIsGeneratingSyllabus(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/generate-syllabus-preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: syllabusTopic || course?.title })
            });

            if (res.ok) {
                const previewSyllabus = await res.json();
                setGeneratedSyllabus(previewSyllabus);
                setSyllabusStep('review');
                toast.success('Course syllabus generated! Please review it.');
            } else {
                toast.error('Failed to generate syllabus.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error generating syllabus.');
        } finally {
            setIsGeneratingSyllabus(false);
        }
    };

    const handleUpdateSyllabusItem = (index, field, value) => {
        const updated = [...generatedSyllabus];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedSyllabus(updated);
    };

    const handleRemoveSyllabusItem = (index) => {
        const updated = generatedSyllabus.filter((_, i) => i !== index);
        setGeneratedSyllabus(updated);
    };

    const handleSaveSyllabus = async () => {
        if (generatedSyllabus.length === 0) {
            toast.error("Syllabus is empty");
            return;
        }

        setIsSavingSyllabus(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/save-syllabus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modules: generatedSyllabus })
            });

            if (res.ok) {
                const updatedContent = await res.json();
                setCourse({ ...course, content: updatedContent });
                toast.success('Syllabus successfully added to your course structure!');
                setShowSyllabusModal(false);
                setSyllabusStep('input');
                setSyllabusTopic('');
                setGeneratedSyllabus([]);
            } else {
                toast.error('Failed to save the syllabus.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error saving syllabus.');
        } finally {
            setIsSavingSyllabus(false);
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

    const handleGenerateAIQuiz = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsGeneratingAIQuiz(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}/quizzes/generate`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const generatedQuestions = await res.json();
                setQuizForm({
                    ...quizForm,
                    questions: generatedQuestions
                });
                toast.success("AI significantly boosted your quiz creation!");
            } else {
                const error = await res.json();
                toast.error(error.msg || "AI Generation failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect to AI service");
        } finally {
            setIsGeneratingAIQuiz(false);
        }
    };
    const handleRemoveQuestion = (index) => {
        const newQuestions = quizForm.questions.filter((_, i) => i !== index);
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)'}}>Loading...</div>;


    // ... (keep existing handlers) ...

    const confirmDeletion = () => {
        const { type, id } = confirmModalState;
        if (type === 'content') performDeleteContent(id);
        else if (type === 'assignment') performDeleteAssignment(id);
        else if (type === 'quiz') performDeleteQuiz(id);
        else if (type === 'bulk-content') performDeleteBulkContent();
        else closeConfirmModal();
    };

    const getConfirmMessage = () => {
        const { type } = confirmModalState;
        if (type === 'content') return 'Are you sure you want to permanently delete this content module from the course? This action cannot be undone.';
        if (type === 'bulk-content') return `Are you sure you want to permanently delete these ${selectedContents.length} items? This action cannot be undone.`;
        if (type === 'assignment') return 'Are you sure you want to permanently delete this assignment? Student submissions may be affected.';
        if (type === 'quiz') return 'Are you sure you want to permanently delete this quiz? Student attempts may be affected.';
        return 'Are you sure you want to delete this item?';
    };

    return (
        <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Top Header */}
                <div style={{ padding: '1.5rem 3rem', background: 'var(--bg-card)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <button onClick={() => navigate('/instructor/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                                <ArrowLeft size={18} />
                            </button>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>{course?.title}</h1>
                            <span style={{ padding: '0.25rem 0.75rem', background: 'var(--success-light)', color: '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{course?.status || 'Active'}</span>
                         </div>
                         <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.85rem', marginLeft: '2rem' }}>
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
                    <div style={{ width: '260px', background: 'var(--bg-card)', borderRight: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-lighter)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>Manage Course</h3>
                        
                        <button 
                            onClick={() => setActiveTab('content')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                                width: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'content' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'content' ? '#2563eb' : 'var(--text-muted)',
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
                                color: activeTab === 'assessments' ? '#2563eb' : 'var(--text-muted)',
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
                                color: activeTab === 'gradebook' ? '#2563eb' : 'var(--text-muted)',
                                fontWeight: activeTab === 'gradebook' ? 600 : 500,
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <GraduationCap size={18} /> Gradebook
                        </button>
                    </div>

                    {/* Main Content View */}
                    <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', background: 'var(--bg-main)' }}>
                        
                        {/* --- CONTENT TAB --- */}
                        {activeTab === 'content' && (
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Course Content</h2>
                                        <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage your lessons and materials.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => { setSyllabusTopic(course?.title || ''); setShowSyllabusModal(true); }}
                                            className="btn"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}
                                            title="Auto-generate a complete syllabus structure using AI"
                                        >
                                            <Sparkles size={18} /> AI Structure Builder
                                        </button>
                                        <button 
                                            onClick={() => setShowUploadModal(true)}
                                            className="btn btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                                        >
                                            <Plus size={20} /> Add Content
                                        </button>
                                    </div>
                                </div>

                                {course?.content?.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: 'var(--bg-card)', padding: '1rem 1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px -2px rgba(0,0,0,0.02)' }}>
                                        <div 
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                            onClick={() => handleSelectAllContent({ target: { checked: selectedContents.length !== course.content.length } })}
                                        >
                                            {selectedContents.length > 0 && selectedContents.length === course.content.length ? (
                                                <CheckSquare size={20} color="#2563eb" fill="#eff6ff" style={{ transition: 'all 0.2s' }} />
                                            ) : (
                                                <Square size={20} color="#94a3b8" style={{ transition: 'all 0.2s' }} />
                                            )}
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', userSelect: 'none' }}>Select All Modules</span>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {selectedContents.length > 0 && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }}>
                                                    <button 
                                                        onClick={handleBulkDeleteContent}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)' }}
                                                    >
                                                        <Trash2 size={16} /> Delete Selected ({selectedContents.length})
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {course?.content?.length > 0 ? (
                                        course.content.map((item, index) => (
                                            <motion.div 
                                                key={item._id} 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                transition={{ delay: index * 0.05 }}
                                                className="card" 
                                                style={{ 
                                                    padding: '1.5rem', background: selectedContents.includes(item._id) ? '#f8fafc' : 'var(--bg-card)', 
                                                    borderRadius: '12px', border: selectedContents.includes(item._id) ? '1px solid #cbd5e1' : '1px solid #e2e8f0', 
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    boxShadow: '0 2px 4px -2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                    <div 
                                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                                        onClick={() => handleSelectContent(item._id)}
                                                    >
                                                        {selectedContents.includes(item._id) ? (
                                                            <CheckSquare size={20} color="#2563eb" fill="#eff6ff" />
                                                        ) : (
                                                            <Square size={20} color="#cbd5e1" />
                                                        )}
                                                    </div>
                                                    <div style={{ 
                                                        width: '50px', height: '50px', 
                                                        background: item.type === 'video' ? '#eff6ff' : '#f0fdf4', 
                                                        color: item.type === 'video' ? '#2563eb' : '#16a34a',
                                                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                    }}>
                                                        {item.type === 'video' ? <Video size={24}/> : <FileText size={24}/>}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-lighter)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setViewingContentDetails(item)} style={{ padding: '0.6rem', color: '#10b981', background: '#d1fae5', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="View Details"><Eye size={18} /></button>
                                                    <button onClick={() => handleEditContent(item)} style={{ padding: '0.6rem', color: '#3b82f6', background: 'var(--primary-light)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Edit"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteContent(item._id)} style={{ padding: '0.6rem', color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete"><Trash2 size={18} /></button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed #e2e8f0', color: 'var(--text-lighter)' }}>
                                            <div style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                <Upload size={32} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No contents yet</h3>
                                            <p style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>Get started by uploading your first video lesson or auto-generating a structure with AI.</p>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                <button onClick={() => { setSyllabusTopic(course?.title || ''); setShowSyllabusModal(true); }} style={{ color: '#8b5cf6', fontWeight: 600, background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16}/> Build with AI</button>
                                                <button onClick={() => setShowUploadModal(true)} style={{ color: '#2563eb', fontWeight: 600, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16}/> Upload Material</button>
                                            </div>
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
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Assessments</h2>
                                        <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage assignments and quizzes.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => setShowAssignmentModal(true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
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
                                            color: assessmentTab === 'assignments' ? '#2563eb' : 'var(--text-light)',
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
                                            color: assessmentTab === 'quizzes' ? '#2563eb' : 'var(--text-light)',
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
                                                        style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                        onClick={() => setViewingAssessment({ ...assign, type: 'assignment' })}
                                                        whileHover={{ y: -2 }}
                                                    >
                                                         <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditAssignment(assign); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-blue-500"><Edit size={16} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(assign._id); }} style={{ color: 'var(--text-lighter)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-red-500"><Trash2 size={16} /></button>
                                                         </div>
                                                         <div style={{ width: '40px', height: '40px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                             <FileText size={20} />
                                                         </div>
                                                         <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>{assign.title}</h4>
                                                         <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.5', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{assign.description}</p>
                                                         {assign.dueDate && <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Due: {new Date(assign.dueDate).toLocaleDateString()}</div>}
                                                    </motion.div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed #e2e8f0', color: 'var(--text-lighter)' }}>
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
                                                        style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' }}
                                                        onClick={() => setViewingAssessment({ ...quiz, type: 'quiz' })}
                                                        whileHover={{ y: -2 }}
                                                    >
                                                         <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditQuiz(quiz); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-blue-500"><Edit size={16} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz._id); }} style={{ color: 'var(--text-lighter)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-red-500"><Trash2 size={16} /></button>
                                                         </div>
                                                         <div style={{ width: '40px', height: '40px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                             <CheckCircle size={20} />
                                                         </div>
                                                         <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>{quiz.title}</h4>
                                                         <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0' }}>{quiz.questions?.length} Questions</p>
                                                    </motion.div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed #e2e8f0', color: 'var(--text-lighter)' }}>
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
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Gradebook</h2>
                                    <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Track student progress and performance.</p>
                                </div>
                                <div className="card" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
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
                                            <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid #e2e8f0' }}>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Student</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Overall Progress</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Assignments</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Quizzes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradebookData.map((student, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                                            <div>{student.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{student.email}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', maxWidth: '100px' }}>
                                                                    <div style={{ width: `${student.progress}%`, height: '100%', background: student.progress >= 80 ? '#22c55e' : '#3b82f6', borderRadius: '3px' }}/>
                                                                </div>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{student.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: 600 }}>{student.assignments?.length || 0}</span>
                                                                <button 
                                                                    onClick={() => setSelectedStudentForGrading(student)}
                                                                    style={{ background: 'var(--primary-light)', color: '#4f46e5', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                                                                >
                                                                    Review
                                                                </button>
                                                            </div>
                                                        </td>
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
                            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
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

                {/* AI Syllabus Generator Modal */}
                <AnimatePresence>
                    {showSyllabusModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: syllabusStep === 'review' ? '800px' : '500px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{syllabusStep === 'review' ? 'Review & Edit Structure' : 'AI Structure Builder'}</h3>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{syllabusStep === 'review' ? 'Fine-tune your generated lesson plan before adding it to the course.' : 'Generate a complete curriculum instantly.'}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setShowSyllabusModal(false); setSyllabusStep('input'); }} style={{ background: 'var(--bg-secondary)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                                
                                {syllabusStep === 'input' ? (
                                    <form onSubmit={handleGenerateSyllabus}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 0.5rem', fontWeight: 500 }}>Focus Topic or Concept:</p>
                                                <input 
                                                    required 
                                                    value={syllabusTopic} 
                                                    onChange={e => setSyllabusTopic(e.target.value)} 
                                                    placeholder="e.g. Advanced State Management in React" 
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '0.95rem', color: 'var(--text-main)', outline: 'none' }} 
                                                    disabled={isGeneratingSyllabus} 
                                                />
                                            </div>
                                           
                                            <button type="submit" disabled={isGeneratingSyllabus} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)', opacity: isGeneratingSyllabus ? 0.7 : 1 }}>
                                                {isGeneratingSyllabus ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Designing Syllabus...</> : <><Sparkles size={20}/> Generate Full Structure</>}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {generatedSyllabus.map((module, index) => (
                                            <div 
                                                key={module._id} 
                                                style={{ 
                                                    background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '1.25rem', 
                                                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative'
                                                }}
                                            >
                                                <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.05)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--text-lighter)', fontSize: '0.85rem' }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <input 
                                                            value={module.title}
                                                            onChange={e => handleUpdateSyllabusItem(index, 'title', e.target.value)}
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', outline: 'none' }}
                                                        />
                                                        <select 
                                                            value={module.type}
                                                            onChange={e => handleUpdateSyllabusItem(index, 'type', e.target.value)}
                                                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '0.85rem', color: 'var(--text-main)', outline: 'none' }}
                                                        >
                                                            <option value="video">Video Lesson</option>
                                                            <option value="pdf">Study Material (PDF)</option>
                                                        </select>
                                                    </div>
                                                    {module.type === 'video' && (
                                                        <textarea 
                                                            value={module.description || ''}
                                                            placeholder="Detailed description of the video..."
                                                            onChange={e => handleUpdateSyllabusItem(index, 'description', e.target.value)}
                                                            rows={3}
                                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '0.95rem', color: 'var(--text-secondary)', outline: 'none', resize: 'vertical', lineHeight: '1.5' }}
                                                        />
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveSyllabusItem(index)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s', padding: '0.25rem' }}
                                                    onMouseOver={e => e.currentTarget.style.opacity = 1}
                                                    onMouseOut={e => e.currentTarget.style.opacity = 0.6}
                                                    title="Remove Module"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                            <button 
                                                onClick={() => setSyllabusStep('input')} 
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                                            >
                                                Start Over
                                            </button>
                                            <button 
                                                onClick={handleSaveSyllabus}
                                                disabled={isSavingSyllabus}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)' }}
                                            >
                                                {isSavingSyllabus ? <><Loader2 size={18} className="spin" /> Saving...</> : <><CheckCircle size={18}/> Confirm & Add to Content</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Assignment Modal */}
                <AnimatePresence>
                    {showAssignmentModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
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
                            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 700 }}>
                                        {editingQuiz ? <Edit size={24} color="#6366f1" /> : <PlusCircle size={24} color="#6366f1" />}
                                        {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                                    </h3>
                                    <button type="button" onClick={() => { setShowQuizModal(false); setEditingQuiz(null); setQuizForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                                </div>

                                {!editingQuiz && (
                                    <div style={{ 
                                        marginBottom: '2rem', 
                                        padding: '1.5rem', 
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                                        borderRadius: '12px', 
                                        color: 'white',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                                <Sparkles size={20} /> AI Quiz Generator
                                            </h4>
                                            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', opacity: 0.9 }}>
                                                Upload a PDF study material, and I'll generate 10 professional MCQs for you instantly.
                                            </p>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf" 
                                                    onChange={handleGenerateAIQuiz}
                                                    style={{ 
                                                        position: 'absolute', 
                                                        inset: 0, 
                                                        opacity: 0, 
                                                        cursor: 'pointer',
                                                        zIndex: 2
                                                    }}
                                                    disabled={isGeneratingAIQuiz}
                                                />
                                                <div style={{ 
                                                    background: 'rgba(255,255,255,0.2)', 
                                                    border: '1px dashed rgba(255,255,255,0.4)',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.75rem',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {isGeneratingAIQuiz ? (
                                                        <><Loader2 size={20} className="spin" /> Reading PDF & Thinking...</>
                                                    ) : (
                                                        <><FileUp size={20} /> Upload PDF to Auto-Generate</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Background Decoration */}
                                        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.2 }}>
                                            <Sparkles size={100} />
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={handleCreateQuiz}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={labelStyle}>Quiz Title</label>
                                        <input required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} style={inputStyle} placeholder="e.g. Module 1 Quiz" disabled={uploading} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        {quizForm.questions.map((q, qIndex) => (
                                            <div key={qIndex} style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#6366f1' }}>Question {qIndex + 1}</span>
                                                    {quizForm.questions.length > 1 && <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}
                                                </div>
                                                <input required value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} style={{ ...inputStyle, marginBottom: '1rem', background: 'var(--bg-card)' }} placeholder="Enter your question here..." disabled={uploading} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer == oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} style={{ accentColor: '#10b981', width: '16px', height: '16px' }} disabled={uploading} />
                                                            <input required value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.9rem', background: 'var(--bg-card)' }} disabled={uploading} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" onClick={handleAddQuestion} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', background: 'var(--primary-light)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}><PlusCircle size={18} /> Add Question</button>
                                        <button type="submit" disabled={uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#4f46e5', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            {uploading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : (editingQuiz ? 'Update Quiz' : 'Publish Quiz')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Grade Student Modal */}
                <GradeStudentModal 
                    isOpen={!!selectedStudentForGrading}
                    onClose={() => setSelectedStudentForGrading(null)}
                    student={selectedStudentForGrading}
                    courseAssignments={course?.assignments}
                    courseId={id}
                    onGradeUpdated={() => {
                        fetchGradebook(); // Refresh data!
                    }}
                />

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
                                style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Edit Content</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X size={24} /></button>
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
                                        <select value={editingContent.type} onChange={e => setEditingContent({...editingContent, type: e.target.value})} style={{...inputStyle, background: 'var(--bg-card)'}}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lesson</option>
                                            <option value="image">Image resource</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Replace File (Optional)</label>
                                        <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{...inputStyle, padding: '0.5rem'}} />
                                        {editingContent.fileName && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Current file: {editingContent.fileName}</p>}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" disabled={uploading} onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-light)', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" disabled={uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: 1, padding: '0.85rem', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            {uploading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* View Content Detail Modal */}
                <AnimatePresence>
                    {viewingContentDetails && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'var(--bg-card)', padding: '0', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                                <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'start', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
                                    <div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', background: viewingContentDetails.type === 'video' ? '#eff6ff' : '#f0fdf4', color: viewingContentDetails.type === 'video' ? '#2563eb' : '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                            {viewingContentDetails.type === 'video' ? <Video size={14}/> : <FileText size={14}/>}
                                            {viewingContentDetails.type === 'video' ? 'Video Lesson' : 'Study Material'}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, lineHeight: 1.3 }}>{viewingContentDetails.title}</h3>
                                    </div>
                                    <button onClick={() => setViewingContentDetails(null)} style={{ background: 'var(--bg-main)', border: '1px solid #e2e8f0', cursor: 'pointer', color: 'var(--text-light)', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-main)'}><X size={20} /></button>
                                </div>
                                
                                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={16} /> Description
                                        </h4>
                                        <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <p style={{ margin: 0, lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                                {viewingContentDetails.description || <span style={{ color: 'var(--text-lighter)', fontStyle: 'italic' }}>No description provided.</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: 'var(--bg-main)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setViewingContentDetails(null)} style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }} onMouseOver={e => e.currentTarget.style.background = '#2563eb'} onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}>Done</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* View Assessment Detail Modal */}
                <AnimatePresence>
                    {viewingAssessment && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'var(--bg-card)', padding: '0', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: viewingAssessment.type === 'assignment' ? '#e0f2fe' : '#dcfce7', color: viewingAssessment.type === 'assignment' ? '#0369a1' : '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            {viewingAssessment.type === 'assignment' ? 'Assignment' : 'Quiz'}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{viewingAssessment.title}</h3>
                                    </div>
                                    <button onClick={() => setViewingAssessment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X size={24} /></button>
                                </div>
                                
                                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                    {viewingAssessment.type === 'assignment' ? (
                                        <>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Instructions</h4>
                                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{viewingAssessment.description}</p>
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
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Questions ({viewingAssessment.questions?.length})</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {viewingAssessment.questions?.map((q, i) => (
                                                        <div key={i} style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>{i+1}. {q.question}</p>
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                                                                {q.options?.map((opt, j) => (
                                                                    <li key={j} style={{ padding: '0.5rem 0.75rem', background: q.correctAnswer === j ? '#dcfce7' : 'white', border: q.correctAnswer === j ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', color: q.correctAnswer === j ? '#166534' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                
                                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: 'var(--bg-main)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setViewingAssessment(null)} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
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
const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', outline: 'none', fontSize: '0.95rem' };

export default InstructorCourseDetails;
