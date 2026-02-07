import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Menu, Lock, Download, ChevronRight, Video, File, HelpCircle, Check, X as XIcon, RefreshCw, Trophy, ArrowRight, Clock, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Question Pool
const QUESTION_POOL = [
    {
        id: 1,
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tech Markup Language"],
        correct: "Hyper Text Markup Language",
        topic: "html5"
    },
    {
        id: 2,
        question: "Which tag is used to define an internal style sheet?",
        options: ["<css>", "<script>", "<style>", "<link>"],
        correct: "<style>",
        topic: "html5"
    },
    {
        id: 3,
        question: "Which property is used to change the background color?",
        options: ["color", "bgcolor", "background-color", "bg-color"],
        correct: "background-color",
        topic: "css3"
    },
    {
        id: 4,
        question: "How do you declare a JavaScript variable?",
        options: ["v carName;", "variable carName;", "var carName;", "val carName;"],
        correct: "var carName;",
        topic: "javascript"
    },
    {
        id: 5,
        question: "Which HTML5 element defines navigation links?",
        options: ["<nav>", "<navigation>", "<navigate>", "<links>"],
        correct: "<nav>",
        topic: "html5"
    },
    {
        id: 6,
        question: "Which CSS property controls the text size?",
        options: ["font-style", "text-size", "font-size", "text-style"],
        correct: "font-size",
        topic: "css3"
    },
    {
        id: 7,
        question: "What is the correct way to write a JavaScript array?",
        options: ["var colors = 1 = (\"red\"), 2 = (\"green\")", "var colors = (1:\"red\", 2:\"green\")", "var colors = [\"red\", \"green\", \"blue\"]", "var colors = \"red\", \"green\", \"blue\""],
        correct: "var colors = [\"red\", \"green\", \"blue\"]",
        topic: "javascript"
    },
    {
        id: 8,
        question: "Inside which HTML element do we put the JavaScript?",
        options: ["<js>", "<scripting>", "<script>", "<javascript>"],
        correct: "<script>",
        topic: "html5"
    },
    {
        id: 9,
        question: "How do you select an element with id 'demo' in CSS?",
        options: [".demo", "#demo", "demo", "*demo"],
        correct: "#demo",
        topic: "css3"
    },
    {
        id: 10,
        question: "Which event occurs when the user clicks on an HTML element?",
        options: ["onmouseover", "onchange", "onclick", "onmouseclick"],
        correct: "onclick",
        topic: "javascript"
    },
    {
        id: 11,
        question: "In CSS, how do you select all p elements inside a div element?",
        options: ["div + p", "div p", "div.p", "div > p"],
        correct: "div p",
        topic: "css3"
    },
    {
        id: 12,
        question: "Which operator is used to assign a value to a variable?",
        options: ["*", "-", "=", "x"],
        correct: "=",
        topic: "javascript"
    }
];

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
    const [savedAssignments, setSavedAssignments] = useState({}); // { 'assign_1': { score: 80, ... } }
    const [submissionLoading, setSubmissionLoading] = useState(false);
    const [lastAttemptData, setLastAttemptData] = useState(null); 
    
    // Progress Tracking
    const [completedContent, setCompletedContent] = useState([]); // Array of IDs

    const user = JSON.parse(localStorage.getItem('user'));

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

                // Load completed content
                if (currentEnrollment.completedContent) {
                    setCompletedContent(currentEnrollment.completedContent);
                }

                // Fetch course details
                const courseRes = await fetch(`http://localhost:5000/api/courses/${id}`);
                const courseData = await courseRes.json();
                setCourse(courseData);
                
                // Set first content as active if available and not already set
                if (!activeContent && courseData.content && courseData.content.length > 0) {
                    setActiveContent(courseData.content[0]);
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
        if (activeContent?.type === 'assignment') {
            setAssignmentStatus('overview'); // Always land on the dashboard view
            setLastAttemptData(null); // Reset immediate attempt data
            setUserAnswers({});
        }
    }, [activeContent]);


    // Assignment Logic
    const startAssignment = () => {
        // Shuffle and pick 5
        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
        setCurrentQuiz(shuffled.slice(0, 5));
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

    const submitAssignment = async () => {
        let correctCount = 0;
        currentQuiz.forEach(q => {
            if (userAnswers[q.id] === q.correct) {
                correctCount++;
            }
        });
        const finalScore = (correctCount / currentQuiz.length) * 100;
        setScore(finalScore);
        
        // Save to backend
        setSubmissionLoading(true);
        try {
            await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses/${id}/assignment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignmentId: activeContent._id,
                    score: finalScore
                })
            });
            
            // Update local saved state
            setSavedAssignments(prev => ({
                ...prev,
                [activeContent._id]: { score: finalScore, completedAt: new Date().toISOString() }
            }));

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
        if (!activeContent || activeContent.type === 'assignment') return;

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


    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#334155' }}>Loading Class...</div>;
    if (!course) return <div style={{ padding: '4rem', textAlign: 'center' }}>Course not found</div>;

    const isPdf = activeContent?.type === 'pdf' || (activeContent?.url && activeContent.url.endsWith('.pdf'));

    // Filter contents
    const videoContents = course.content ? course.content.filter(c => c.type === 'video') : [];
    const studyMaterials = course.content ? course.content.filter(c => c.type !== 'video') : [];
    
    // Assignment sidebar Item
    const assignmentItem = {
        _id: 'assign_1',
        title: 'Assignment 1: Frontend Basics',
        type: 'assignment'
    };

    const isAssignmentActive = activeContent?._id === 'assign_1';

    const isScrollablePage = activeContent?.type === 'assignment' || (!isPdf && activeContent?.type !== 'video');
    
    // --- Assignment Dashboard Logic ---
    const savedData = savedAssignments[activeContent?._id];
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
                        {completedContent.length} / {course.content.length} Completed
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
                    <div style={{ borderTop: '1px solid #e2e8f0' }}>
                         <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                             Assignments
                         </div>
                         <div 
                             onClick={() => setActiveContent(assignmentItem)}
                             style={{ 
                                 padding: '1rem 1.5rem', 
                                 borderBottom: '1px solid #f8fafc', 
                                 cursor: 'pointer',
                                 background: isAssignmentActive ? '#eff6ff' : 'white',
                                 borderLeft: isAssignmentActive ? '4px solid #0ea5e9' : '4px solid transparent',
                                 transition: 'all 0.2s'
                             }}
                             className="hover:bg-slate-50"
                         >
                             <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                 <div style={{ marginTop: '2px', color: isAssignmentActive ? '#0ea5e9' : (savedAssignments['assign_1']?.score >= 80 ? '#22c55e' : '#94a3b8') }}>
                                      {savedAssignments['assign_1']?.score >= 80 ? <CheckCircle size={16} /> : <HelpCircle size={16} />}
                                 </div>
                                 <div>
                                     <p style={{ margin: 0, fontSize: '0.9rem', color: isAssignmentActive ? '#0f172a' : '#334155', fontWeight: isAssignmentActive ? 600 : 400, lineHeight: 1.4 }}>
                                         Assignment 1: Frontend Basics
                                     </p>
                                     <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quiz • 5 Questions</span>
                                 </div>
                             </div>
                         </div>
                    </div>

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
                                 {activeContent?.type === 'assignment' ? 'Graded Assignment' : 'Current Lesson'}
                             </span>
                             <h1 style={{ fontSize: '1rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>{activeContent?.title || course.title}</h1>
                        </div>
                    </div>
                    
                    {/* Completion Button */}
                    {activeContent?.type !== 'assignment' && (
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
                <div style={{ flex: 1, overflowY: isScrollablePage ? 'auto' : 'hidden', background: activeContent?.type === 'assignment' ? '#f8fafc' : '#2d2f31' }}> 
                    
                    <div style={{ maxWidth: '100%', minHeight: isScrollablePage ? '100%' : 'auto', height: isScrollablePage ? 'auto' : '100%', display: 'flex', flexDirection: 'column' }}>
                        
                        {activeContent?.type === 'assignment' ? (
                            // --- ASSIGNMENT INTERFACE ---
                            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 5rem' }}>
                                
                                {assignmentStatus === 'overview' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        
                                        {/* Header Title Section */}
                                        <div>
                                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Assignment 1: Frontend Basics</h1>
                                            <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> 10 min</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Due Jan 30, 2026</span>
                                            </div>
                                        </div>

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
                                                                onClick={startAssignment}
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
                                                                onClick={startAssignment}
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
                                                             <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#334155' }}>Frontend Basics Quiz</td>
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

                                        {/* Instructions */}
                                        <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Instructions</h3>
                                            <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                                                Check your knowledge of the fundamental concepts covering HTML, CSS, and Javascript. 
                                                You need to answer at least 4 out of 5 questions correctly to pass.
                                            </p>
                                            <ul style={{ paddingLeft: '1.5rem', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <li>This quiz covers topics from Modules 1-3.</li>
                                                <li>You have 10 minutes to complete the quiz.</li>
                                                <li>You can retake the quiz as many times as you like.</li>
                                                <li>Your highest score will be kept.</li>
                                            </ul>
                                        </div>

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
                                                        {lastAttemptData.answers[q.id] === q.correct ? <CheckCircle color="#22c55e" size={20} /> : <XIcon color="#ef4444" size={20} />}
                                                        <span style={{ fontWeight: 600, color: '#334155' }}>{q.question}</span>
                                                    </div>
                                                    <div style={{ paddingLeft: '2rem', fontSize: '0.9rem' }}>
                                                        <p style={{ margin: '0 0 0.25rem', color: '#64748b' }}>Your answer: <span style={{ fontWeight: 500, color: lastAttemptData.answers[q.id] === q.correct ? '#166534' : '#b91c1c' }}>{lastAttemptData.answers[q.id]}</span></p>
                                                        {lastAttemptData.answers[q.id] !== q.correct && (
                                                            <p style={{ margin: 0, color: '#15803d' }}>Correct answer: <strong>{q.correct}</strong></p>
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
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Question {Object.keys(userAnswers).length} / 5</h3>
                                            <span style={{ padding: '0.25rem 0.75rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>In Progress</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {currentQuiz.map((q, idx) => (
                                                <div key={q.id} className="card" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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
                                                                    border: userAnswers[q.id] === opt ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                                                                    background: userAnswers[q.id] === opt ? '#f0f9ff' : 'white',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q-${q.id}`} 
                                                                    value={opt}
                                                                    checked={userAnswers[q.id] === opt}
                                                                    onChange={() => handleOptionSelect(q.id, opt)}
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
                                                onClick={submitAssignment}
                                                disabled={Object.keys(userAnswers).length < 5 || submissionLoading}
                                                className="btn btn-primary"
                                                style={{ padding: '1rem 2rem', opacity: Object.keys(userAnswers).length < 5 || submissionLoading ? 0.5 : 1 }}
                                            >
                                                {submissionLoading ? 'Submitting...' : 'Submit Assignment'}
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
