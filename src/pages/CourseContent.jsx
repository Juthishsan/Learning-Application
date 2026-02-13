import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Menu, Lock, Download, ChevronRight, Video, File, HelpCircle, Check, X as XIcon, RefreshCw, Trophy, ArrowRight, Clock, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to mix content array with assignments and quizzes
const mergeContent = (course) => {
    let mixed = [];
    if (course.content) mixed = [...course.content];
    
    // Add assignments
    if (course.assignments) {
        course.assignments.forEach(a => {
            mixed.push({ ...a, type: 'assignment', isDatabase: true });
        });
    }

    // Add quizzes
    if (course.quizzes) {
        course.quizzes.forEach(q => {
            mixed.push({ ...q, type: 'quiz', isDatabase: true });
        });
    }
    
    // Optional: Sort by creation date if needed. For now, pushing them to end.
    return mixed;
};


const CourseContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeContent, setActiveContent] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Assignment States
    const [assignmentStatus, setAssignmentStatus] = useState('overview'); // overview, in-progress, review
    const [currentQuiz, setCurrentQuiz] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [savedAssignments, setSavedAssignments] = useState({});
    const [savedQuizzes, setSavedQuizzes] = useState({}); // { 'quizId': { score: 80, ... } }
    const [submissionLoading, setSubmissionLoading] = useState(false);
    const [lastAttemptData, setLastAttemptData] = useState(null); 
    
    // Progress Tracking
    const [completedContent, setCompletedContent] = useState([]); // Array of IDs

    const user = JSON.parse(localStorage.getItem('user'));
    const [mixedContent, setMixedContent] = useState([]);

    useEffect(() => {
        const fetchCourseAndCheckEnrollment = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                toast.error('Please login to access course content');
                navigate('/login');
                return;
            }

            const user = JSON.parse(storedUser);

            try {
                // Check enrollment first
                const enrollRes = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses`);
                const enrollData = await enrollRes.json();
                
                // Find current course enrollment
                const currentEnrollment = enrollData.find(e => (e.courseId?._id === id || e.courseId === id));
                
                if (!currentEnrollment) {
                    toast.error('You are not enrolled in this course');
                    navigate(`/course/${id}`); // Redirect to overview
                    return;
                }

                // Load saved assignments
                if (currentEnrollment.assignments) {
                    const assignMap = {};
                    currentEnrollment.assignments.forEach(a => {
                        assignMap[a.assignmentId] = a;
                    });
                    setSavedAssignments(assignMap);
                }

                if (currentEnrollment.quizzes) {
                    const quizMap = {};
                    currentEnrollment.quizzes.forEach(q => {
                        quizMap[q.quizId] = q;
                    });
                    setSavedQuizzes(quizMap);
                }

                // Load completed content
                if (currentEnrollment.completedContent) {
                    setCompletedContent(currentEnrollment.completedContent);
                }

                // Fetch course details
                const courseRes = await fetch(`http://localhost:5000/api/courses/${id}`);
                const courseData = await courseRes.json();
                setCourse(courseData);
                
                const allContent = mergeContent(courseData);
                setMixedContent(allContent);

                // Set first content as active if available and not already set
                if (!activeContent && allContent.length > 0) {
                    setActiveContent(allContent[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to load course content", err);
                setLoading(false);
            }
        };

        fetchCourseAndCheckEnrollment();
    }, [id, navigate]);

    // Check for saved state when key changes
    useEffect(() => {
        if (activeContent?.type === 'assignment' || activeContent?.type === 'quiz') {
            setAssignmentStatus('overview'); // Always land on the dashboard view
            setLastAttemptData(null); // Reset immediate attempt data
            setUserAnswers({});
        }
    }, [activeContent]);


    // Assignment/Quiz Logic
    const startAssessment = () => {
        if (activeContent.type === 'quiz' && activeContent.questions) {
             setCurrentQuiz(activeContent.questions);
        } else {
             // Fallback for old hardcoded assignments or empty ones
             // For "assignments" that are just text submissions in real life, we might treat differently
             // But based on request, assignments have questions too? 
             // The schema for Assignment didn't have questions, only Quizzes had questions.
             // If Assignment is just a "Task", we might just show the description.
             // BUT, if the user wants "Assignments related questions" similar to quizzes...
             // Let's assume for now Quizzes are the interactive ones.
             // If activeContent is Assignment (Task), we might just mark as complete.
             
             // However, for consistency with previous code, let's treat Quizzes as the interactive Q&A.
             setCurrentQuiz([]);
        }
        setUserAnswers({});
        setAssignmentStatus('in-progress');
        window.scrollTo(0, 0);
    };

    const handleOptionSelect = (qId, option) => {
        setUserAnswers(prev => ({
            ...prev,
            [qId]: option
        }));
    };

    const submitAssessment = async () => {
        let correctCount = 0;
        // For Quizzes
        currentQuiz.forEach((q, idx) => {
            // Need to handle if correct answer is index or string. Schema said Number (index)
            // But previous hardcoded was string.
            // Let's adapt. The schema created in previous turn uses `correctAnswer: Number`.
            const correctOptIndex = q.correctAnswer; 
            // userAnswers values ? If we store the option STRING, we need to compare with q.options[correctOptIndex]
            if (userAnswers[idx] === q.options[correctOptIndex]) {
                correctCount++;
            }
        });
        const finalScore = (correctCount / currentQuiz.length) * 100;
        setScore(finalScore);
        
        // Save to backend
        setSubmissionLoading(true);
        try {
            const endpoint = activeContent.type === 'quiz' ? 'quiz' : 'assignment';
            const body = activeContent.type === 'quiz' 
                ? { quizId: activeContent._id || activeContent.quizId, score: finalScore }
                : { assignmentId: activeContent._id || activeContent.assignmentId, score: finalScore }; // Assignments might not be graded automatically if they are just tasks, but reusing logic.

            await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses/${id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            // Update local saved state
            if (activeContent.type === 'quiz') {
                 setSavedQuizzes(prev => ({
                    ...prev,
                    [activeContent._id]: { score: finalScore, completedAt: new Date().toISOString() }
                }));
            } else {
                setSavedAssignments(prev => ({
                    ...prev,
                    [activeContent._id]: { score: finalScore, completedAt: new Date().toISOString() }
                }));
            }

            // Store attempt data for the "Result" capability (immediate feedback)
            setLastAttemptData({
                quiz: currentQuiz,
                answers: userAnswers,
                score: finalScore
            });

            toast.success('Assignment submitted!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save progress');
        } finally {
            setSubmissionLoading(false);
            setAssignmentStatus('review'); // Go to review page first
            window.scrollTo(0, 0);
            
            if (finalScore >= 80) toast.success("Great job! You passed.");
            else toast('Don\'t give up!', { icon: '💪' });
        }
    };


    const toggleCompletion = async () => {
        if (!activeContent || activeContent.type === 'assignment' || activeContent.type === 'quiz') return;

        const contentId = activeContent._id;
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses/${id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId })
            });

            if (res.ok) {
                const data = await res.json();
                setCompletedContent(data.completedContent);
                // Also could update global progress state if we had one
                const isNowComplete = data.completedContent.includes(contentId);
                toast(isNowComplete ? 'Marked as completed' : 'Marked as incomplete', { icon: isNowComplete ? '✅' : '↩️' });
            }
        } catch (err) {
            console.error("Failed to update progress", err);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const fileInput = e.target.elements.assignmentFile;
        const file = fileInput.files[0];
        
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        setSubmissionLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        const assignId = activeContent.assignmentId || activeContent._id;

        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses/${id}/assignments/${assignId}/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                 const data = await res.json();
                 // Update savedAssignments
                 const updatedAssignment = data.assignments.find(a => a.assignmentId === assignId);
                 setSavedAssignments(prev => ({
                     ...prev,
                     [assignId]: updatedAssignment
                 }));
                 toast.success("Assignment submitted successfully!");
                 fileInput.value = ''; // Reset input
            } else {
                toast.error("Upload failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error uploading file");
        } finally {
            setSubmissionLoading(false);
        }
    };


    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#334155' }}>Loading Class...</div>;
    if (!course) return <div style={{ padding: '4rem', textAlign: 'center' }}>Course not found</div>;

    const isPdf = activeContent?.type === 'pdf' || (activeContent?.url && activeContent.url.endsWith('.pdf'));

    // Filter contents
    const videoContents = mixedContent.filter(c => c.type === 'video');
    const studyMaterials = mixedContent.filter(c => c.type === 'pdf' || c.type === 'image');
    const assignmentsList = mixedContent.filter(c => c.type === 'assignment');
    const quizzesList = mixedContent.filter(c => c.type === 'quiz');

    
    const isScrollablePage = activeContent?.type === 'assignment' || activeContent?.type === 'quiz' || (!isPdf && activeContent?.type !== 'video');
    
    // --- Assignment Dashboard Logic ---
    let savedData = null;
    if (activeContent?.type === 'assignment') savedData = savedAssignments[activeContent._id];
    if (activeContent?.type === 'quiz') savedData = savedQuizzes[activeContent._id];

    const hasPassed = savedData && savedData.score >= 80;

    const isCurrentContextCompleted = completedContent.includes(activeContent?._id);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'white', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Sidebar (Playlist) */}
            <div 
                style={{ 
                    width: sidebarOpen ? '350px' : '0', 
                    background: '#fff', 
                    borderRight: '1px solid #e2e8f0', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    marginTop: '80px' // Offset for fixed navbar
                }}
            >
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, margin: 0, fontSize: '1rem' }}>Course Content</h3>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {completedContent.length} / {mixedContent.length} Completed
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    
                    {/* Video Section */}
                    {videoContents.length > 0 && (
                        <div>
                             <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 Video Lessons
                             </div>
                             {videoContents.map((item, idx) => {
                                 const isActive = activeContent?._id === item._id || activeContent === item;
                                 const isCompleted = completedContent.includes(item._id);
                                 return (
                                     <div 
                                         key={item._id || idx} 
                                         onClick={() => { setActiveContent(item); }}
                                         style={{ 
                                             padding: '1rem 1.5rem', 
                                             borderBottom: '1px solid #f8fafc', 
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'white',
                                             borderLeft: isActive ? '4px solid #0ea5e9' : '4px solid transparent',
                                             transition: 'all 0.2s'
                                         }}
                                         className="hover:bg-slate-50"
                                     >
                                         <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                             <div style={{ marginTop: '2px', color: isActive ? '#0ea5e9' : (isCompleted ? '#22c55e' : '#94a3b8') }}>
                                                 {isCompleted ? <CheckCircle size={16} /> : <PlayCircle size={16} />}
                                             </div>
                                             <div>
                                                 <p style={{ margin: 0, fontSize: '0.9rem', color: isActive ? '#0f172a' : '#334155', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Video • {idx + 1}</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {/* Study Materials Section */}
                    {studyMaterials.length > 0 && (
                        <div style={{ borderTop: videoContents.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
                             <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 Study Materials
                             </div>
                             {studyMaterials.map((item, idx) => {
                                 const isActive = activeContent?._id === item._id || activeContent === item;
                                 const isCompleted = completedContent.includes(item._id);
                                 return (
                                     <div 
                                         key={item._id || idx} 
                                         onClick={() => { setActiveContent(item); }}
                                         style={{ 
                                             padding: '1rem 1.5rem', 
                                             borderBottom: '1px solid #f8fafc', 
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'white',
                                             borderLeft: isActive ? '4px solid #0ea5e9' : '4px solid transparent',
                                             transition: 'all 0.2s'
                                         }}
                                         className="hover:bg-slate-50"
                                     >
                                         <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                             <div style={{ marginTop: '2px', color: isActive ? '#0ea5e9' : (isCompleted ? '#22c55e' : '#94a3b8') }}>
                                                  {isCompleted ? <CheckCircle size={16} /> : <FileText size={16} />}
                                             </div>
                                             <div>
                                                 <p style={{ margin: 0, fontSize: '0.9rem', color: isActive ? '#0f172a' : '#334155', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Resource • {item.type.toUpperCase()}</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}
                    
                    {/* Assignments Section */}
                    {assignmentsList.length > 0 && (
                        <div style={{ borderTop: studyMaterials.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
                             <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 Assignments
                             </div>
                             {assignmentsList.map((item, idx) => {
                                 const isActive = activeContent?._id === item._id;
                                 const itemSaved = savedAssignments[item._id];
                                 const isPassed = itemSaved?.score >= 80;
                                 return (
                                     <div 
                                         key={item._id} 
                                         onClick={() => setActiveContent(item)}
                                         style={{ 
                                             padding: '1rem 1.5rem', 
                                             borderBottom: '1px solid #f8fafc', 
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'white',
                                             borderLeft: isActive ? '4px solid #0ea5e9' : '4px solid transparent',
                                             transition: 'all 0.2s'
                                         }}
                                         className="hover:bg-slate-50"
                                     >
                                         <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                             <div style={{ marginTop: '2px', color: isActive ? '#0ea5e9' : (isPassed ? '#22c55e' : '#94a3b8') }}>
                                                  {isPassed ? <CheckCircle size={16} /> : <HelpCircle size={16} />}
                                             </div>
                                             <div>
                                                 <p style={{ margin: 0, fontSize: '0.9rem', color: isActive ? '#0f172a' : '#334155', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assignment • Task</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {/* Quizzes Section */}
                    {quizzesList.length > 0 && (
                        <div style={{ borderTop: '1px solid #e2e8f0' }}>
                             <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 Quizzes
                             </div>
                             {quizzesList.map((item, idx) => {
                                 const isActive = activeContent?._id === item._id;
                                 const itemSaved = savedQuizzes[item._id];
                                 const isPassed = itemSaved?.score >= 80;
                                 return (
                                     <div 
                                         key={item._id} 
                                         onClick={() => setActiveContent(item)}
                                         style={{ 
                                             padding: '1rem 1.5rem', 
                                             borderBottom: '1px solid #f8fafc', 
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'white',
                                             borderLeft: isActive ? '4px solid #0ea5e9' : '4px solid transparent',
                                             transition: 'all 0.2s'
                                         }}
                                         className="hover:bg-slate-50"
                                     >
                                         <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                             <div style={{ marginTop: '2px', color: isActive ? '#0ea5e9' : (isPassed ? '#22c55e' : '#94a3b8') }}>
                                                  {isPassed ? <CheckCircle size={16} /> : <HelpCircle size={16} />}
                                             </div>
                                             <div>
                                                 <p style={{ margin: 0, fontSize: '0.9rem', color: isActive ? '#0f172a' : '#334155', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quiz • {item.questions?.length} Questions</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {(!course.content || course.content.length === 0) && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            No content available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'white', marginTop: '80px' }}>
                
                {/* Top Bar */}
                <div style={{ height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: '#fff', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '4px' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                             <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 {activeContent?.type === 'quiz' ? 'Quiz Assessment' : activeContent?.type === 'assignment' ? 'Graded Assignment' : 'Current Lesson'}
                             </span>
                             <h1 style={{ fontSize: '1rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>{activeContent?.title || course.title}</h1>
                        </div>
                    </div>
                    
                    {/* Completion Button */}
                    {activeContent?.type !== 'assignment' && activeContent?.type !== 'quiz' && (
                        <button 
                            onClick={toggleCompletion}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: isCurrentContextCompleted ? '#dcfce7' : 'white',
                                border: isCurrentContextCompleted ? '1px solid #86efac' : '1px solid #cbd5e1',
                                color: isCurrentContextCompleted ? '#15803d' : '#475569',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isCurrentContextCompleted ? (
                                <> <CheckCircle size={18} /> Completed </>
                            ) : (
                                <> <CheckCircle size={18} /> Mark as Complete </>
                            )}
                        </button>
                    )}
                </div>

                {/* Viewer */}
                <div style={{ flex: 1, overflowY: isScrollablePage ? 'auto' : 'hidden', background: activeContent?.type === 'assignment' || activeContent?.type === 'quiz' ? '#f8fafc' : '#2d2f31' }}> 
                    
                    <div style={{ maxWidth: '100%', minHeight: isScrollablePage ? '100%' : 'auto', height: isScrollablePage ? 'auto' : '100%', display: 'flex', flexDirection: 'column' }}>
                        
                        {activeContent?.type === 'assignment' || activeContent?.type === 'quiz' ? (
                            // --- ASSIGNMENT INTERFACE ---
                            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 5rem' }}>
                                
                                {assignmentStatus === 'overview' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        
                                        {/* Header Title Section */}
                                        <div>
                                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                {activeContent.title}
                                            </h1>
                                            {activeContent.type === 'quiz' && (
                                                <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> 10 min</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Due {new Date().toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {activeContent.type === 'assignment' && (
                                                <div style={{ marginTop: '1rem', color: '#475569', lineHeight: 1.6 }}>
                                                    <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Instructions:</p>
                                                    {activeContent.description}
                                                    <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                        Due: {activeContent.dueDate ? new Date(activeContent.dueDate).toLocaleDateString() : 'Flexible'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {activeContent.type === 'quiz' ? (
                                            <>
                                                {/* Main Dashboard Card */}
                                                <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                    
                                                    {/* Status Header */}
                                                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: savedData ? (hasPassed ? '#f0fdf4' : '#fef2f2') : '#f8fafc' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            {savedData ? (
                                                                hasPassed ? (
                                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                                        <Check size={28} />
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                                        <XIcon size={28} />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                                    <HelpCircle size={28} />
                                                                </div>
                                                            )}
                                                            
                                                            <div>
                                                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                                                    {savedData ? (hasPassed ? 'Passed' : 'Try Again') : 'Receive grade'}
                                                                </h2>
                                                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                                                    {savedData 
                                                                        ? `You scored ${savedData.score}%` 
                                                                        : 'To pass, you must score at least 80%'}
                                                                </p>
                                                            </div>

                                                            <div style={{ marginLeft: 'auto' }}>
                                                                {savedData ? (
                                                                    <button 
                                                                        onClick={startAssessment}
                                                                        className="btn"
                                                                        style={{ 
                                                                            background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: '6px',
                                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' 
                                                                        }}
                                                                    >
                                                                        <RefreshCw size={18} /> Retake Assessment
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={startAssessment}
                                                                        className="btn btn-primary"
                                                                        style={{ padding: '0.75rem 2rem', fontWeight: 600 }}
                                                                    >
                                                                        Start Assessment
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Details Table */}
                                                    <div style={{ padding: '1.5rem' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Grade Item</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Weight</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Your Grade</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#334155' }}>
                                                                        {activeContent.title}
                                                                    </td>
                                                                    <td style={{ padding: '1rem 0.75rem', color: '#64748b' }}>100%</td>
                                                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>
                                                                        {savedData ? `${savedData.score}%` : '--'}
                                                                    </td>
                                                                    <td style={{ padding: '1rem 0.75rem' }}>
                                                                        {savedData ? (
                                                                            hasPassed ? <span style={{ color: '#166534', background: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Passed</span> 
                                                                            : <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Failed</span>
                                                                        ) : (
                                                                            <span style={{ color: '#64748b' }}>--</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                
                                                <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Instructions</h3>
                                                    <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                                                        Check your knowledge. You need to answer at least 80% correctly to pass.
                                                    </p>
                                                    <ul style={{ paddingLeft: '1.5rem', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <li>This quiz has {activeContent.questions?.length} questions.</li>
                                                        <li>You can retake the quiz as many times as you like.</li>
                                                        <li>Your highest score will be kept.</li>
                                                    </ul>
                                                </div>

                                            </>
                                        ) : (
                                                /* Assignment View with File Upload */
                                            <div className="card" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                 <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                                     <div style={{ marginBottom: '1rem', color: savedData?.submissionUrl ? '#22c55e' : '#6366f1', display: 'flex', justifyContent: 'center' }}>
                                                         {savedData?.submissionUrl ? <CheckCircle size={56} /> : <FileText size={56} />}
                                                     </div>
                                                     <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                         {savedData?.submissionUrl ? 'Assignment Submitted' : 'Submit Assignment'}
                                                     </h2>
                                                     <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                                                         {activeContent.description || "Upload your work for this assignment. Acceptable formats: PDF, DOCX, ZIP, JPG, PNG."}
                                                     </p>
                                                     {activeContent.dueDate && (
                                                         <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ef4444', fontWeight: 500 }}>
                                                             Due: {new Date(activeContent.dueDate).toLocaleDateString()}
                                                         </div>
                                                     )}
                                                 </div>

                                                 {savedData?.submissionUrl ? (
                                                     <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                                                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                             <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '50%', color: '#16a34a' }}>
                                                                 <Check size={24} />
                                                             </div>
                                                             <div>
                                                                 <h4 style={{ margin: 0, color: '#166534', fontSize: '1rem' }}>Submission Received</h4>
                                                                 <p style={{ margin: '0.25rem 0 0', color: '#15803d', fontSize: '0.85rem' }}>
                                                                     Submitted on {new Date(savedData.completedAt).toLocaleString()}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                         <div style={{ paddingLeft: '3.5rem' }}>
                                                             <a 
                                                                 href={savedData.submissionUrl} 
                                                                 target="_blank" 
                                                                 rel="noopener noreferrer"
                                                                 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
                                                             >
                                                                 <Download size={16} /> View {savedData.fileName || 'Submission'}
                                                             </a>
                                                             <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bbf7d0' }}>
                                                                 <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                                                     <strong>Grade: </strong> 
                                                                     {savedData.score !== undefined ? <span style={{ background: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid #86efac' }}>{savedData.score}%</span> : 'Pending Review'}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ) : (
                                                     <form onSubmit={handleFileUpload} style={{ maxWidth: '500px', margin: '0 auto' }}>
                                                         <div style={{ marginBottom: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f8fafc', transition: 'border-color 0.2s', cursor: 'pointer' }}
                                                            onDragOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                                                            onDragLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                                         >
                                                             <input 
                                                                 type="file" 
                                                                 name="assignmentFile"
                                                                 id="assignment-file"
                                                                 style={{ display: 'none' }} 
                                                                 onChange={(e) => {
                                                                     // Optional: Show selected filename
                                                                     const label = document.getElementById('file-label');
                                                                     if(label && e.target.files[0]) label.innerText = e.target.files[0].name;
                                                                 }}
                                                             />
                                                             <label htmlFor="assignment-file" style={{ cursor: 'pointer', display: 'block' }}>
                                                                 <div style={{ marginBottom: '1rem', color: '#64748b' }}>
                                                                     <div style={{ background: '#e2e8f0', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#475569' }}>
                                                                         <Download size={32} style={{ transform: 'rotate(180deg)' }} /> {/* Upload icon workaround */}
                                                                     </div>
                                                                     <span id="file-label" style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Click to Browse or Drag File</span>
                                                                     <span style={{ fontSize: '0.85rem' }}>PDF, DOCX, ZIP up to 10MB</span>
                                                                 </div>
                                                             </label>
                                                         </div>
                                                         <button 
                                                             type="submit" 
                                                             disabled={submissionLoading}
                                                             className="btn btn-primary"
                                                             style={{ width: '100%', padding: '1rem', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                                         >
                                                             {submissionLoading ? 'Uploading...' : <><Check size={20} /> Submit Assignment</>}
                                                         </button>
                                                     </form>
                                                 )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {assignmentStatus === 'review' && lastAttemptData && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        
                                        {/* Score Header */}
                                        <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                            <div style={{ 
                                                width: '80px', 
                                                height: '80px', 
                                                margin: '0 auto 1.5rem', 
                                                borderRadius: '50%', 
                                                border: `5px solid ${lastAttemptData.score >= 80 ? '#22c55e' : '#ef4444'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.75rem',
                                                fontWeight: 800,
                                                color: lastAttemptData.score >= 80 ? '#22c55e' : '#ef4444',
                                                background: lastAttemptData.score >= 80 ? '#f0fdf4' : '#fef2f2'
                                            }}>
                                                {lastAttemptData.score}%
                                            </div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                {lastAttemptData.score >= 80 ? 'Congratulations!' : 'Don\'t give up!'}
                                            </h2>
                                            <p style={{ color: '#64748b' }}>
                                                {lastAttemptData.score >= 80 ? 'You passed the assignment.' : 'You did not pass. Review your answers below.'}
                                            </p>
                                        </div>

                                        {/* Attempt Review */}
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Attempt Review</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {lastAttemptData.quiz.map((q, idx) => (
                                                <div key={idx} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                        {lastAttemptData.answers[idx] === q.options[q.correctAnswer] ? <CheckCircle color="#22c55e" size={20} /> : <XIcon color="#ef4444" size={20} />}
                                                        <span style={{ fontWeight: 600, color: '#334155' }}>{q.question}</span>
                                                    </div>
                                                    <div style={{ paddingLeft: '2rem', fontSize: '0.9rem' }}>
                                                        <p style={{ margin: '0 0 0.25rem', color: '#64748b' }}>Your answer: <span style={{ fontWeight: 500, color: lastAttemptData.answers[idx] === q.options[q.correctAnswer] ? '#166534' : '#b91c1c' }}>{lastAttemptData.answers[idx]}</span></p>
                                                        {lastAttemptData.answers[idx] !== q.options[q.correctAnswer] && (
                                                            <p style={{ margin: 0, color: '#15803d' }}>Correct answer: <strong>{q.options[q.correctAnswer]}</strong></p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            </div>
                                        </div>

                                        {/* Continue Button */}
                                        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                                            <button 
                                                onClick={() => setAssignmentStatus('overview')}
                                                className="btn btn-primary"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
                                            >
                                                Continue <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {assignmentStatus === 'in-progress' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Question {Object.keys(userAnswers).length} / {currentQuiz.length}</h3>
                                            <span style={{ padding: '0.25rem 0.75rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>In Progress</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {currentQuiz.map((q, idx) => (
                                                <div key={q.id || idx} className="card" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                                        {idx + 1}. {q.question}
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {q.options.map((opt, oIdx) => (
                                                            <label 
                                                                key={oIdx} 
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    padding: '1rem', 
                                                                    borderRadius: '0.75rem', 
                                                                    border: userAnswers[idx] === opt ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                                                                    background: userAnswers[idx] === opt ? '#f0f9ff' : 'white',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q-${idx}`} // Use index as key for quiz from DB since q._id might not be unique if ad-hoc, but better use index for mapped content
                                                                    value={opt}
                                                                    checked={userAnswers[idx] === opt}
                                                                    onChange={() => handleOptionSelect(idx, opt)}
                                                                    style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                                                                />
                                                                <span style={{ color: '#334155' }}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={submitAssessment}
                                                disabled={Object.keys(userAnswers).length < currentQuiz.length || submissionLoading}
                                                className="btn btn-primary"
                                                style={{ padding: '1rem 2rem', opacity: Object.keys(userAnswers).length < currentQuiz.length || submissionLoading ? 0.5 : 1 }}
                                            >
                                                {submissionLoading ? 'Submitting...' : 'Submit Assessment'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activeContent ? (
                            // --- REGULAR CONTENT (VIDEO/PDF) ---
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                {/* Ensure inner content takes full height for PDF/Video */}
                                {activeContent.type === 'video' ? (
                                    <div style={{ flex: 1, background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <video 
                                            src={activeContent.url} 
                                            controls 
                                            style={{ width: '100%', maxHeight: '100%', outline: 'none' }} 
                                            controlsList="nodownload"
                                        />
                                    </div>
                                ) : isPdf ? (
                                    <div style={{ flex: 1, background: '#525659', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <iframe 
                                            src={activeContent.url} 
                                            style={{ width: '100%', flex: 1, border: 'none', display: 'block' }} 
                                            title="PDF Viewer"
                                        />
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#334155' }}>
                                        <FileText size={64} color="#0ea5e9" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                                        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>{activeContent.title}</h2>
                                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>This resource cannot be previewed directly.</p>
                                        <a 
                                            href={activeContent.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: '#0ea5e9', 
                                                color: 'white', 
                                                padding: '0.75rem 1.5rem', 
                                                borderRadius: '0.5rem', 
                                                textDecoration: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            <Download size={18} /> Download Resource
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
                                Select a lesson from the sidebar to start learning.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .hover-bg-slate-100:hover { background-color: #f1f5f9 !important; }
                .hover-text-primary:hover { color: #0ea5e9 !important; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default CourseContent;
