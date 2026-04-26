import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { 
    LayoutDashboard, FileText, Video, ClipboardList, GraduationCap, Users, 
    Plus, Trash2, Search, ArrowLeft, MoreVertical, Edit, Upload, Download,
    CheckCircle, X, Check, HelpCircle, PlusCircle, Clock, Loader2, Sparkles, FileUp, Square, CheckSquare, Eye,
    Mail, MapPin, Calendar, ChevronRight, BarChart3, Star, AlertCircle
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
    const [viewingAssessment, setViewingAssessment] = useState(null);
    const [viewingContentDetails, setViewingContentDetails] = useState(null);

    const openConfirmModal = (type, id) => {
        setConfirmModalState({ isOpen: true, type, id });
    };

    const closeConfirmModal = () => {
        setConfirmModalState({ isOpen: false, type: '', id: null });
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'gradebook' || activeTab === 'students') {
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
        if (!uploadFile) {
            toast.error('Please select a file');
            return;
        }

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
                setSelectedContents(prev => prev.filter(id => id !== contentId));
            }
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        }
    };

    const handleSelectAllContent = () => {
        if (selectedContents.length === course?.content?.length) {
            setSelectedContents([]);
        } else {
            setSelectedContents(course?.content?.map(item => item._id) || []);
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
        setUploading(true);
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
            setUploading(false);
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
                toast.success('Syllabus successfully added!');
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
                setEditingAssignment(null);
                toast.success(editingAssignment ? 'Assignment updated!' : 'Assignment posted!');
                setShowAssignmentModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to process assignment');
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
                setEditingQuiz(null);
                toast.success(editingQuiz ? 'Quiz updated!' : 'Quiz created!');
                setShowQuizModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to process quiz');
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
                setQuizForm({ ...quizForm, questions: generatedQuestions });
                toast.success("AI generated professional quiz questions!");
            } else {
                toast.error("AI Generation failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("AI Service Error");
        } finally {
            setIsGeneratingAIQuiz(false);
        }
    };

    const confirmDeletion = () => {
        const { type, id: targetId } = confirmModalState;
        if (type === 'content') performDeleteContent(targetId);
        else if (type === 'assignment') performDeleteAssignment(targetId);
        else if (type === 'quiz') performDeleteQuiz(targetId);
        else if (type === 'bulk-content') performDeleteBulkContent();
        closeConfirmModal();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Loader2 size={48} color="#6366f1" />
                    </motion.div>
                    <p style={{ marginTop: '1rem', fontWeight: 600, color: '#64748b' }}>Loading Course Environment...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
                {/* Immersive Header */}
                <div style={{ marginBottom: '3rem', position: 'relative' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <button onClick={() => navigate('/instructor/courses')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ArrowLeft size={16} /> Courses
                        </button>
                        <span>/</span>
                        <span style={{ color: '#0f172a' }}>{course.title}</span>
                    </motion.div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{course.title}</h1>
                                <span style={{ padding: '6px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #d1fae5' }}>Active</span>
                            </div>
                            <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '800px', fontWeight: 500, lineHeight: 1.6 }}>{course.description}</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{course.students || 0}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Learners</div>
                            </div>
                            <div style={{ background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{course.content?.length || 0}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Modules</div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Premium Tab Navigation */}
                <div style={{ marginBottom: '2.5rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '20px', display: 'inline-flex', gap: '0.5rem' }}>
                    {[
                        { id: 'content', icon: FileText, label: 'Curriculum' },
                        { id: 'assessments', icon: ClipboardList, label: 'Assessments' },
                        { id: 'gradebook', icon: GraduationCap, label: 'Gradebook' },
                        { id: 'students', icon: Users, label: 'Learners' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.75rem',
                                borderRadius: '16px', border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                fontWeight: 800, fontSize: '0.95rem',
                                boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Section */}
                <div style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.03)' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            
                            {/* Curriculum Tab */}
                            {activeTab === 'content' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Course Curriculum</h2>
                                            <p style={{ color: '#64748b', fontWeight: 500 }}>Structure your course with high-quality modules and materials</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <AnimatePresence>
                                                {selectedContents.length > 0 && (
                                                    <motion.button
                                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                        onClick={handleBulkDeleteContent}
                                                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '0 1.25rem', borderRadius: '14px', height: '48px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={18} /> Delete Selected ({selectedContents.length})
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                            <button onClick={() => setShowSyllabusModal(true)} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '0 1.25rem', borderRadius: '14px', height: '48px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                                                <Sparkles size={18} /> AI Syllabus Builder
                                            </button>
                                            <button onClick={() => setShowUploadModal(true)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '14px', height: '48px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}>
                                                <PlusCircle size={18} /> Add Module
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                                        {course.content && course.content.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={handleSelectAllContent}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #cbd5e1', background: selectedContents.length === course.content.length ? '#0f172a' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                                        {selectedContents.length === course.content.length && <Check size={14} color="white" strokeWidth={4} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select All Items</span>
                                                </div>
                                            </div>
                                        )}

                                        {course.content && course.content.length > 0 ? (
                                            course.content.map((item, idx) => (
                                                <motion.div
                                                    key={item._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.002, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}
                                                    style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', transition: 'all 0.2s' }}
                                                >
                                                    <div onClick={() => handleSelectContent(item._id)} style={{ width: '22px', height: '22px', borderRadius: '7px', border: '2px solid #e2e8f0', background: selectedContents.includes(item._id) ? '#0f172a' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                                        {selectedContents.includes(item._id) && <Check size={14} color="white" strokeWidth={4} />}
                                                    </div>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: item.type === 'video' ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'video' ? '#ef4444' : '#3b82f6', border: `1px solid ${item.type === 'video' ? '#fee2e2' : '#dbeafe'}` }}>
                                                        {item.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</h3>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '10px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{item.type}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                        <button onClick={() => setViewingContentDetails(item)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Eye size={18} /></button>
                                                        <button onClick={() => handleEditContent(item)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={18} /></button>
                                                        <button onClick={() => handleDeleteContent(item._id)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '6rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                                                    <FileUp size={40} />
                                                </div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Build Your Curriculum</h3>
                                                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem auto', fontWeight: 500, lineHeight: 1.6 }}>Create a rich learning experience by adding video lectures, PDFs, and study materials manually or using our AI builder.</p>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                                    <button onClick={() => setShowSyllabusModal(true)} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>Use AI Builder</button>
                                                    <button onClick={() => setShowUploadModal(true)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>Add Manually</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Assessments Tab */}
                            {activeTab === 'assessments' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Assessments</h2>
                                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                                <button onClick={() => setAssessmentTab('assignments')} style={{ background: 'none', border: 'none', padding: '0 0 0.5rem 0', color: assessmentTab === 'assignments' ? '#6366f1' : '#94a3b8', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', borderBottom: assessmentTab === 'assignments' ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.2s' }}>Assignments</button>
                                                <button onClick={() => setAssessmentTab('quizzes')} style={{ background: 'none', border: 'none', padding: '0 0 0.5rem 0', color: assessmentTab === 'quizzes' ? '#6366f1' : '#94a3b8', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', borderBottom: assessmentTab === 'quizzes' ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.2s' }}>Quizzes</button>
                                            </div>
                                        </div>
                                        <button onClick={() => assessmentTab === 'assignments' ? setShowAssignmentModal(true) : setShowQuizModal(true)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '14px', height: '48px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)' }}>
                                            <Plus size={20} /> Create {assessmentTab === 'assignments' ? 'Assignment' : 'Quiz'}
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                        {assessmentTab === 'assignments' ? (
                                            course.assignments?.length > 0 ? (
                                                course.assignments.map((assign, idx) => (
                                                    <motion.div key={assign._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}><ClipboardList size={24} /></div>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleEditAssignment(assign)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                <button onClick={() => openConfirmModal('assignment', assign._id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{assign.title}</h3>
                                                        </div>
                                                        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.85rem', fontWeight: 700 }}><Clock size={16} /> Due {new Date(assign.dueDate).toLocaleDateString()}</div>
                                                            <button onClick={() => setViewingAssessment({...assign, type: 'assignment'})} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>View Details</button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                                    <p style={{ color: '#94a3b8', fontWeight: 600 }}>No assignments created yet.</p>
                                                </div>
                                            )
                                        ) : (
                                            course.quizzes?.length > 0 ? (
                                                course.quizzes.map((quiz, idx) => (
                                                    <motion.div key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}><HelpCircle size={24} /></div>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleEditQuiz(quiz)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                <button onClick={() => openConfirmModal('quiz', quiz._id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>{quiz.title}</h3>
                                                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{quiz.questions?.length || 0} Multiple Choice Questions</p>
                                                        </div>
                                                        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700 }}><Sparkles size={16} /> Professional Assessment</div>
                                                            <button onClick={() => setViewingAssessment({...quiz, type: 'quiz'})} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>Preview Quiz</button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                                    <p style={{ color: '#94a3b8', fontWeight: 600 }}>No quizzes created yet.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Gradebook Tab */}
                            {activeTab === 'gradebook' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Academic Performance</h2>
                                            <p style={{ color: '#64748b', fontWeight: 500 }}>Monitor student progress and manage academic records</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px' }}>
                                            <button onClick={() => setGradebookFilter('all')} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: gradebookFilter === 'all' ? 'white' : 'transparent', color: gradebookFilter === 'all' ? '#0f172a' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: gradebookFilter === 'all' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}>All Students</button>
                                            <button onClick={() => setGradebookFilter('active')} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: gradebookFilter === 'active' ? 'white' : 'transparent', color: gradebookFilter === 'active' ? '#0f172a' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: gradebookFilter === 'active' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}>Active</button>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Learner</th>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Content Progress</th>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Assignments</th>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Quizzes</th>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Overall Grade</th>
                                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradebookData.length > 0 ? (
                                                    gradebookData.map((data, idx) => (
                                                        <tr key={data.studentId || idx} style={{ transition: 'background 0.2s' }}>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0f172a', border: '1px solid #e2e8f0' }}>{data.name?.charAt(0) || '?'}</div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{data.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{data.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                                <div style={{ width: '120px' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem' }}>
                                                                        <span>{data.progress || 0}%</span>
                                                                    </div>
                                                                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.progress || 0}%` }} style={{ height: '100%', background: '#10b981', borderRadius: '10px' }} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                                                                {data.assignments?.filter(a => a.submissionUrl).length || 0} / {course.assignments?.length || 0}
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                                                                {data.quizzes?.length || 0} / {course.quizzes?.length || 0}
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                                                <span style={{ padding: '4px 12px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                                                                    {(() => {
                                                                        const aScores = data.assignments?.filter(a => a.score !== undefined).map(a => a.score) || [];
                                                                        const qScores = data.quizzes?.filter(q => q.score !== undefined).map(q => q.score) || [];
                                                                        const allScores = [...aScores, ...qScores];
                                                                        if (allScores.length === 0) return 'N/A';
                                                                        const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                                                                        return `${Math.round(avg)}%`;
                                                                    })()}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                                <button onClick={() => setSelectedStudentForGrading(data)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Grade</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No academic records found for this course.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Learners Tab */}
                            {activeTab === 'students' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Active Learners</h2>
                                            <p style={{ color: '#64748b', fontWeight: 500 }}>Manage students currently enrolled in this course</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {gradebookLoading ? (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                                                <Loader2 size={32} className="spin" color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                                                <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Fetching learners list...</p>
                                            </div>
                                        ) : gradebookData && gradebookData.length > 0 ? (
                                            gradebookData.map((student, idx) => (
                                                <motion.div
                                                    key={student.studentId || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                                                >
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0f172a', border: '1px solid #e2e8f0', fontSize: '1.2rem' }}>
                                                        {student.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '0.4rem' }}>{student.email}</div>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>Enrolled</span>
                                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', fontWeight: 800 }}>{student.progress}% Complete</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                                <p style={{ color: '#94a3b8', fontWeight: 600 }}>No students enrolled yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Modals Section */}
            <AnimatePresence>
                {/* Upload Modal */}
                {showUploadModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Add Course Module</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Upload videos or documents to your curriculum</p>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUploadContent} style={{ padding: '2.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module Title</label>
                                    <input required value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="e.g., Introduction to Neural Networks" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 500, outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <button type="button" onClick={() => setContentType('video')} style={{ padding: '1rem', borderRadius: '14px', border: contentType === 'video' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: contentType === 'video' ? '#f5f3ff' : 'white', color: contentType === 'video' ? '#6366f1' : '#64748b', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}><Video size={20} /> Video</button>
                                        <button type="button" onClick={() => setContentType('pdf')} style={{ padding: '1rem', borderRadius: '14px', border: contentType === 'pdf' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: contentType === 'pdf' ? '#f5f3ff' : 'white', color: contentType === 'pdf' ? '#6366f1' : '#64748b', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}><FileText size={20} /> PDF Doc</button>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                    <textarea required value={contentDescription} onChange={e => setContentDescription(e.target.value)} placeholder="Provide context for this module..." style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 500, outline: 'none', minHeight: '120px', resize: 'vertical' }} />
                                </div>
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource File</label>
                                    <div style={{ position: 'relative', height: '100px', border: '2px dashed #cbd5e1', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                        <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                                            <div style={{ fontWeight: 700 }}>{uploadFile ? uploadFile.name : 'Click or Drag to Upload'}</div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                    {uploading ? <><Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Upload Module'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* AI Syllabus Generator Modal */}
                {showSyllabusModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: syllabusStep === 'review' ? '800px' : '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Sparkles size={24} /></div>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{syllabusStep === 'review' ? 'Review AI Syllabus' : 'AI Syllabus Builder'}</h2>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{syllabusStep === 'review' ? 'Fine-tune your generated content structure' : 'Generate a complete course structure in seconds'}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setShowSyllabusModal(false); setSyllabusStep('input'); }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            
                            <div style={{ padding: '2.5rem' }}>
                                {syllabusStep === 'input' ? (
                                    <form onSubmit={handleGenerateSyllabus}>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>What should this course cover?</label>
                                            <input required value={syllabusTopic} onChange={e => setSyllabusTopic(e.target.value)} placeholder="e.g. Master Advanced State Management in React" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, outline: 'none' }} disabled={isGeneratingSyllabus} />
                                        </div>
                                        <button type="submit" disabled={isGeneratingSyllabus} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                            {isGeneratingSyllabus ? <><Loader2 size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Thinking...</> : <><Sparkles size={22} /> Generate Structure</>}
                                        </button>
                                    </form>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {generatedSyllabus.map((module, index) => (
                                            <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>{index + 1}</div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <input value={module.title} onChange={e => handleUpdateSyllabusItem(index, 'title', e.target.value)} style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: 700 }} />
                                                        <select value={module.type} onChange={e => handleUpdateSyllabusItem(index, 'type', e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: 800 }}>
                                                            <option value="video">Video</option>
                                                            <option value="pdf">PDF Doc</option>
                                                        </select>
                                                    </div>
                                                    <textarea value={module.description} onChange={e => handleUpdateSyllabusItem(index, 'description', e.target.value)} rows={2} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', fontWeight: 500, resize: 'none' }} />
                                                </div>
                                                <button onClick={() => handleRemoveSyllabusItem(index)} style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </motion.div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                            <button onClick={() => setSyllabusStep('input')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Start Over</button>
                                            <button onClick={handleSaveSyllabus} disabled={isSavingSyllabus} style={{ padding: '1rem 2rem', borderRadius: '14px', background: '#22c55e', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {isSavingSyllabus ? <Loader2 className="spin" size={20} /> : <CheckCircle size={20} />} Add to Curriculum
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Assignment Modal */}
                {showAssignmentModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
                                <button onClick={() => { setShowAssignmentModal(false); setEditingAssignment(null); setAssignmentForm({title: '', description: '', dueDate: ''}); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleCreateAssignment} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Title</label>
                                    <input required value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="e.g. Final Project Submission" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Instructions</label>
                                    <textarea required value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} placeholder="What should students do?" rows={4} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 500 }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Due Date</label>
                                    <input type="date" required value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                                    {uploading ? <Loader2 className="spin" size={20} /> : (editingAssignment ? 'Update Assignment' : 'Publish Assignment')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Quiz Modal */}
                {showQuizModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
                                <button onClick={() => { setShowQuizModal(false); setEditingQuiz(null); setQuizForm({title: '', questions: [{question: '', options: ['', '', '', ''], correctAnswer: 0}]}); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            
                            <div style={{ padding: '2.5rem' }}>
                                {!editingQuiz && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 900, fontSize: '1.1rem' }}>AI Quiz Assistant</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>Upload a PDF to generate 10 MCQs instantly</p>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input type="file" accept=".pdf" onChange={handleGenerateAIQuiz} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={isGeneratingAIQuiz} />
                                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {isGeneratingAIQuiz ? <Loader2 className="spin" size={18} /> : <FileUp size={18} />} Generate with AI
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Quiz Title</label>
                                        <input required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} placeholder="e.g. Module 1 Knowledge Check" style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {quizForm.questions.map((q, qIdx) => (
                                            <motion.div key={qIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <span style={{ fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Question {qIdx + 1}</span>
                                                    {quizForm.questions.length > 1 && <button type="button" onClick={() => handleRemoveQuestion(qIdx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>}
                                                </div>
                                                <input required value={q.question} onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)} placeholder="Type your question here..." style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                                            <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer == oIdx} onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                                                            <input required value={opt} onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} style={{ flex: 1, border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" onClick={handleAddQuestion} style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '2px dashed #6366f1', color: '#6366f1', background: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><PlusCircle size={20} /> Add Question</button>
                                        <button type="submit" style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>{editingQuiz ? 'Update Quiz' : 'Publish Quiz'}</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Grade Student Modal */}
                <GradeStudentModal 
                    isOpen={!!selectedStudentForGrading}
                    onClose={() => setSelectedStudentForGrading(null)}
                    student={selectedStudentForGrading}
                    courseAssignments={course?.assignments}
                    courseId={id}
                    onGradeUpdated={fetchGradebook}
                />

                {/* View Content Details Modal */}
                {viewingContentDetails && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'inline-flex', padding: '4px 12px', background: viewingContentDetails.type === 'video' ? '#fef2f2' : '#eff6ff', color: viewingContentDetails.type === 'video' ? '#ef4444' : '#3b82f6', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', border: '1px solid currentColor' }}>{viewingContentDetails.type}</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{viewingContentDetails.title}</h3>
                                </div>
                                <button onClick={() => setViewingContentDetails(null)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Description</h4>
                                <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>{viewingContentDetails.description || 'No description provided.'}</p>
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setViewingContentDetails(null)} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Close Preview</button>
                                    <button style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Download size={18} /> Download Resource</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* View Assessment Detail Modal */}
                {viewingAssessment && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'inline-flex', padding: '4px 12px', background: viewingAssessment.type === 'assignment' ? '#e0f2fe' : '#dcfce7', color: viewingAssessment.type === 'assignment' ? '#0369a1' : '#166534', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', border: '1px solid currentColor' }}>{viewingAssessment.type}</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{viewingAssessment.title}</h3>
                                </div>
                                <button onClick={() => setViewingAssessment(null)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '2.5rem' }}>
                                {viewingAssessment.type === 'assignment' ? (
                                    <>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Instructions</h4>
                                        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-wrap' }}>{viewingAssessment.description}</p>
                                        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#fffbeb', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #fef3c7' }}>
                                            <Clock size={20} color="#b45309" />
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>Deadline</div>
                                                <div style={{ fontWeight: 600, color: '#b45309', fontSize: '0.85rem' }}>{new Date(viewingAssessment.dueDate).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions ({viewingAssessment.questions?.length})</h4>
                                        {viewingAssessment.questions?.map((q, idx) => (
                                            <div key={idx} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '1rem' }}>{idx + 1}. {q.question}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    {q.options?.map((opt, oIdx) => (
                                                        <div key={oIdx} style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: q.correctAnswer === oIdx ? '2px solid #10b981' : '1px solid #e2e8f0', background: q.correctAnswer === oIdx ? '#ecfdf5' : 'white', fontSize: '0.85rem', fontWeight: 600, color: q.correctAnswer === oIdx ? '#065f46' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {q.correctAnswer === oIdx && <CheckCircle size={14} />} {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Edit Content Modal */}
                {isEditModalOpen && editingContent && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Edit Content</h2>
                                <button onClick={() => { setIsEditModalOpen(false); setEditingContent(null); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleUpdateContent} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Module Title</label>
                                    <input required value={editingContent.title} onChange={e => setEditingContent({...editingContent, title: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Type</label>
                                    <select value={editingContent.type} onChange={e => setEditingContent({...editingContent, type: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>
                                        <option value="video">Video Lesson</option>
                                        <option value="pdf">PDF Document</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Description</label>
                                    <textarea required value={editingContent.description} onChange={e => setEditingContent({...editingContent, description: e.target.value})} rows={4} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 500 }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>Replace Resource (Optional)</label>
                                    <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }} />
                                </div>
                                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' }}>
                                    {uploading ? <Loader2 className="spin" size={20} /> : 'Save Changes'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={confirmModalState.isOpen} 
                onClose={closeConfirmModal} 
                onConfirm={confirmDeletion} 
                title="Confirm Action" 
                message={
                    confirmModalState.type === 'bulk-content' 
                    ? `Are you sure you want to delete ${selectedContents.length} items? This cannot be undone.` 
                    : "Are you sure you want to proceed? This action may be irreversible."
                } 
            />
        </div>
    );
};

export default InstructorCourseDetails;
