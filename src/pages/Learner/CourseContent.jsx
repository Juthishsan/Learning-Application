import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Menu, Lock, Download, ChevronRight, Video, File, HelpCircle, Check, X as XIcon, RefreshCw, Trophy, ArrowRight, Clock, AlertCircle, Calendar, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CustomVideoPlayer from '../../components/Learner/CustomVideoPlayer';
import CertificateModal from '../../components/Learner/CertificateModal';

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
    
    // AI Smart Search States
    const [videoInfoTab, setVideoInfoTab] = useState('overview'); // overview, notes, resources, search
    const [searchTerm, setSearchTerm] = useState('');
    const [videoSeek, setVideoSeek] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const [activeSegIndex, setActiveSegIndex] = useState(-1);
    const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
    const [isPinned, setIsPinned] = useState(false);
    
    // Certificate States
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [certData, setCertData] = useState(null);
    const [isCertLoading, setIsCertLoading] = useState(false);
    
    // Notes & Selection States
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem(`notes_${id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [selectionPopup, setSelectionPopup] = useState({ visible: false, x: 0, y: 0, text: '', startTime: 0 });
    const selectionRef = useRef(null);
    
    // Refs for sticky player
    const scrollContainerRef = useRef(null);
    const videoWrapperRef = useRef(null);

    // Handle Fluid Video Morphing on Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollContainerRef.current || activeContent?.type !== 'video') {
                setScrollProgress(0);
                setIsPinned(false);
                return;
            }
            
            const scrollTop = scrollContainerRef.current.scrollTop;
            
            // Initial Video Container Flow Height = 600px height + 2rem*2 (64px) padding = 664px
            // Target Video Container Flow Height = 210px height + 0.5rem*2 (16px) padding = 226px
            // Total height lost = 438px
            const transitionDistance = 438; // Pixels over which to morph
            
            // Calculate progress (0 to 1) perfectly mapped to height reduction
            const progress = Math.min(1, Math.max(0, scrollTop / transitionDistance));
            setScrollProgress(progress);
            
            // Final pinning state: when the player has fully morphed to its mini-size
            setIsPinned(progress >= 1);
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [activeContent?.type]);

    // Reset scroll on content change
    useEffect(() => {
        setScrollProgress(0);
        setIsPinned(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [activeContent]);

    // Update active segment index
    useEffect(() => {
        if (!activeContent?.transcript) return;
        const index = activeContent.transcript.findIndex((seg, idx) => {
            const nextSeg = activeContent.transcript[idx + 1];
            return currentVideoTime >= seg.startTime && (!nextSeg || currentVideoTime < nextSeg.startTime);
        });
        if (index !== -1 && index !== activeSegIndex) {
            setActiveSegIndex(index);
        }
    }, [currentVideoTime, activeContent?.transcript, activeSegIndex]);

    // Auto-scroll transcript to active segment ONLY when it changes
    useEffect(() => {
        if (isAutoScrollEnabled && videoInfoTab === 'search' && !searchTerm) {
            const activeElement = document.querySelector('[data-active-transcript="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeSegIndex, videoInfoTab, searchTerm, isAutoScrollEnabled]);

    // Handle Transcript Text Selection
    const handleTranscriptSelection = (e, segment) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Position the popup above the selection
            setSelectionPopup({
                visible: true,
                x: rect.left + (rect.width / 2),
                y: rect.top + window.scrollY,
                text: selectedText,
                startTime: segment.startTime
            });
        } else {
            setSelectionPopup(prev => ({ ...prev, visible: false }));
        }
    };

    const saveNote = () => {
        if (!selectionPopup.text) return;
        
        const newNote = {
            id: Date.now(),
            text: selectionPopup.text,
            startTime: selectionPopup.startTime,
            contentTitle: activeContent.title,
            createdAt: new Date().toISOString()
        };
        
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem(`notes_${id}`, JSON.stringify(updatedNotes));
        
        // Success feedback
        toast.success('Note saved!', {
            icon: '📝',
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        
        // Hide popup and clear selection
        setSelectionPopup(prev => ({ ...prev, visible: false }));
        window.getSelection()?.removeAllRanges();
    };

    const deleteNote = (noteId) => {
        const updatedNotes = notes.filter(n => n.id !== noteId);
        setNotes(updatedNotes);
        localStorage.setItem(`notes_${id}`, JSON.stringify(updatedNotes));
        toast.success('Note removed');
    };

    const clearNotes = () => {
        setNotes([]);
        localStorage.removeItem(`notes_${id}`);
        toast.success('All notes cleared');
    };

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
                // Determine layout order to match sidebar visually
                const videoContents = allContent.filter(c => c.type === 'video');
                const studyMaterials = allContent.filter(c => c.type === 'pdf' || c.type === 'image');
                const assignmentsList = allContent.filter(c => c.type === 'assignment');
                const quizzesList = allContent.filter(c => c.type === 'quiz');
                const sidebarOrderContent = [...videoContents, ...studyMaterials, ...assignmentsList, ...quizzesList];

                if (!activeContent && sidebarOrderContent.length > 0) {
                    setActiveContent(sidebarOrderContent[0]);
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

    
    // Make video page scrollable to show description below
    const isScrollablePage = activeContent?.type === 'assignment' || activeContent?.type === 'quiz' || activeContent?.type === 'video' || (!isPdf);
    
    // --- Assignment Dashboard Logic ---
    let savedData = null;
    if (activeContent?.type === 'assignment') savedData = savedAssignments[activeContent._id];
    if (activeContent?.type === 'quiz') savedData = savedQuizzes[activeContent._id];

    const hasPassed = savedData && savedData.score >= 80;

    const isCurrentContextCompleted = completedContent.includes(activeContent?._id);

    // Smart Search Logic
    const handleTranscribe = async () => {
        setIsTranscribing(true);
        try {
            // In a real app, this would call a backend AI service (e.g. Groq/AssemblyAI)
            // For now, we'll simulate the AI processing and provide a sample transcript
            // if one doesn't exist on the content object.
            
            const res = await fetch(`http://localhost:5000/api/courses/${id}/content/${activeContent._id}/transcribe`, {
                method: 'POST'
            });
            
            if (res.ok) {
                const updatedContent = await res.json();
                // Update the active content and course state with the new transcript
                const newCourse = { ...course };
                const contentIdx = newCourse.content.findIndex(c => c._id === activeContent._id);
                if (contentIdx !== -1) {
                    newCourse.content[contentIdx].transcript = updatedContent.transcript;
                    setCourse(newCourse);
                    setActiveContent({ ...activeContent, transcript: updatedContent.transcript });
                }
                toast.success("AI Transcription Complete!");
            } else {
                toast.error("Transcription failed or service unavailable");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to reach AI service");
        } finally {
            setIsTranscribing(false);
        }
    };

    const searchTranscript = () => {
        if (!searchTerm || !activeContent.transcript) return [];
        return activeContent.transcript.filter(s => 
            s.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const jumpToTime = (time) => {
        setVideoSeek(time + Math.random() * 0.001); // Force effect trigger
    };

    // Group transcript into ~45s blocks for Coursera-style reading
    const getGroupedTranscript = () => {
        if (!activeContent?.transcript) return [];
        
        const groups = [];
        let currentGroup = { startTime: activeContent.transcript[0].startTime, segments: [] };
        
        activeContent.transcript.forEach((seg) => {
            // Group every 45 seconds or if a sentence is reasonably long
            if (seg.startTime >= currentGroup.startTime + 45 && currentGroup.segments.length > 0) {
                groups.push(currentGroup);
                currentGroup = { startTime: seg.startTime, segments: [] };
            }
            currentGroup.segments.push(seg);
        });
        
        if (currentGroup.segments.length > 0) groups.push(currentGroup);
        return groups;
    };

    const fetchCertificateData = async () => {
        setIsCertLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/courses/${id}/certificate`);
            const data = await res.json();
            
            if (res.ok) {
                setCertData(data);
                setIsCertModalOpen(true);
            } else {
                toast.error(data.msg || "Completion requirements not met.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate certificate.");
        } finally {
            setIsCertLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'white', fontFamily: "'Inter', sans-serif", paddingTop: '80px', boxSizing: 'border-box' }}>
            
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
                    flexShrink: 0,
                    position: 'relative',
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#0f172a', fontWeight: 800, margin: 0, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Course Content</h3>
                        <div style={{ background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                            {Math.round((completedContent.length / mixedContent.length) * 100)}%
                        </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div 
                            style={{ 
                                height: '100%', 
                                width: `${(completedContent.length / mixedContent.length) * 100}%`, 
                                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                borderRadius: '10px',
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} 
                        />
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        {completedContent.length} of {mixedContent.length} lessons completed
                    </div>
                    
                    {/* Claim Certificate Button */}
                    {completedContent.length === mixedContent.length && mixedContent.length > 0 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={fetchCertificateData}
                            disabled={isCertLoading}
                            style={{
                                marginTop: '1.25rem',
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Trophy size={18} color="#fbbf24" />
                            {isCertLoading ? 'Verifying...' : 'Claim Certificate'}
                        </motion.button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    
                    {/* Video Section */}
                    {videoContents.length > 0 && (
                        <div style={{ padding: '0.5rem' }}>
                             <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                             padding: '0.85rem 1rem', 
                                             margin: '0.2rem 0.5rem',
                                             borderRadius: '12px',
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'transparent',
                                             transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                             position: 'relative',
                                             border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                                             boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                                         }}
                                         className={isActive ? "" : "sidebar-item-hover"}
                                     >
                                         <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                             <div style={{ 
                                                 width: '32px', height: '32px', borderRadius: '8px', 
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 background: isActive ? '#3b82f6' : (isCompleted ? '#dcfce7' : '#f1f5f9'),
                                                 color: isActive ? 'white' : (isCompleted ? '#16a34a' : '#64748b'),
                                                 flexShrink: 0,
                                                 transition: 'all 0.3s ease'
                                             }}>
                                                 {isCompleted ? <Check size={18} strokeWidth={3} /> : <PlayCircle size={18} />}
                                             </div>
                                             <div style={{ flex: 1, minWidth: 0 }}>
                                                 <p style={{ 
                                                     margin: 0, 
                                                     fontSize: '0.9rem', 
                                                     color: isActive ? '#1e40af' : (isCompleted ? '#334155' : '#475569'), 
                                                     fontWeight: isActive ? 700 : 500, 
                                                     lineHeight: 1.4,
                                                     whiteSpace: 'nowrap',
                                                     overflow: 'hidden',
                                                     textOverflow: 'ellipsis'
                                                 }}>
                                                     {item.title}
                                                 </p>
                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                                                     <span style={{ fontSize: '0.75rem', color: isActive ? '#60a5fa' : '#94a3b8' }}>
                                                         Video • {idx + 1}
                                                     </span>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {/* Study Materials Section */}
                    {studyMaterials.length > 0 && (
                        <div style={{ padding: '0.5rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                             <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                             padding: '0.85rem 1rem', 
                                             margin: '0.2rem 0.5rem',
                                             borderRadius: '12px',
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'transparent',
                                             transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                             position: 'relative',
                                             border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                                             boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                                         }}
                                         className={isActive ? "" : "sidebar-item-hover"}
                                     >
                                         <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                             <div style={{ 
                                                 width: '32px', height: '32px', borderRadius: '8px', 
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 background: isActive ? '#3b82f6' : (isCompleted ? '#dcfce7' : '#f1f5f9'),
                                                 color: isActive ? 'white' : (isCompleted ? '#16a34a' : '#64748b'),
                                                 flexShrink: 0
                                             }}>
                                                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <FileText size={18} />}
                                             </div>
                                             <div style={{ flex: 1, minWidth: 0 }}>
                                                 <p style={{ 
                                                     margin: 0, 
                                                     fontSize: '0.9rem', 
                                                     color: isActive ? '#1e40af' : (isCompleted ? '#334155' : '#475569'), 
                                                     fontWeight: isActive ? 700 : 500, 
                                                     lineHeight: 1.4,
                                                     whiteSpace: 'nowrap',
                                                     overflow: 'hidden',
                                                     textOverflow: 'ellipsis'
                                                 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: isActive ? '#60a5fa' : '#94a3b8' }}>Resource • {item.type.toUpperCase()}</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}
                    
                    {/* Assignments Section */}
                    {assignmentsList.length > 0 && (
                        <div style={{ padding: '0.5rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                             <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                             padding: '0.85rem 1rem', 
                                             margin: '0.2rem 0.5rem',
                                             borderRadius: '12px',
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'transparent',
                                             transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                             position: 'relative',
                                             border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                                             boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                                         }}
                                         className={isActive ? "" : "sidebar-item-hover"}
                                     >
                                         <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                             <div style={{ 
                                                 width: '32px', height: '32px', borderRadius: '8px', 
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 background: isActive ? '#3b82f6' : (isPassed ? '#dcfce7' : '#f1f5f9'),
                                                 color: isActive ? 'white' : (isPassed ? '#16a34a' : '#64748b'),
                                                 flexShrink: 0
                                             }}>
                                                  {isPassed ? <Check size={18} strokeWidth={3} /> : <HelpCircle size={18} />}
                                             </div>
                                             <div style={{ flex: 1, minWidth: 0 }}>
                                                 <p style={{ 
                                                     margin: 0, 
                                                     fontSize: '0.9rem', 
                                                     color: isActive ? '#1e40af' : (isPassed ? '#334155' : '#475569'), 
                                                     fontWeight: isActive ? 700 : 500, 
                                                     lineHeight: 1.4,
                                                     whiteSpace: 'nowrap',
                                                     overflow: 'hidden',
                                                     textOverflow: 'ellipsis'
                                                 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: isActive ? '#60a5fa' : '#94a3b8' }}>Assignment • Task</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {/* Quizzes Section */}
                    {quizzesList.length > 0 && (
                        <div style={{ padding: '0.5rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                             <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                             padding: '0.85rem 1rem', 
                                             margin: '0.2rem 0.5rem',
                                             borderRadius: '12px',
                                             cursor: 'pointer',
                                             background: isActive ? '#eff6ff' : 'transparent',
                                             transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                             position: 'relative',
                                             border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                                             boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                                         }}
                                         className={isActive ? "" : "sidebar-item-hover"}
                                     >
                                         <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                             <div style={{ 
                                                 width: '32px', height: '32px', borderRadius: '8px', 
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 background: isActive ? '#3b82f6' : (isPassed ? '#dcfce7' : '#f1f5f9'),
                                                 color: isActive ? 'white' : (isPassed ? '#16a34a' : '#64748b'),
                                                 flexShrink: 0
                                             }}>
                                                  {isPassed ? <Check size={18} strokeWidth={3} /> : <HelpCircle size={18} />}
                                             </div>
                                             <div style={{ flex: 1, minWidth: 0 }}>
                                                 <p style={{ 
                                                     margin: 0, 
                                                     fontSize: '0.9rem', 
                                                     color: isActive ? '#1e40af' : (isPassed ? '#334155' : '#475569'), 
                                                     fontWeight: isActive ? 700 : 500, 
                                                     lineHeight: 1.4,
                                                     whiteSpace: 'nowrap',
                                                     overflow: 'hidden',
                                                     textOverflow: 'ellipsis'
                                                 }}>
                                                     {item.title}
                                                 </p>
                                                 <span style={{ fontSize: '0.75rem', color: isActive ? '#60a5fa' : '#94a3b8' }}>Quiz • {item.questions?.length} Questions</span>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'white' }}>
                
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
                <div 
                    ref={scrollContainerRef}
                    style={{ flex: 1, overflowY: isScrollablePage ? 'auto' : 'hidden', background: activeContent?.type === 'video' ? 'white' : (activeContent?.type === 'assignment' || activeContent?.type === 'quiz' ? '#f8fafc' : '#2d2f31'), position: 'relative' }}
                > 
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
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: isPdf ? '100%' : 'auto', minHeight: '100%', overflow: isPdf ? 'hidden' : 'visible' }}>
                                {/* Ensure inner content takes full height for PDF/Video */}
                                {activeContent.type === 'video' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '100%' }}>
                                        {/* Video Morphing Container */}
                                        <div style={{ 
                                            position: 'sticky',
                                            top: 0,
                                            width: '100%',
                                            background: 'black',
                                            padding: `${2 - (1.5 * scrollProgress)}rem 0`,
                                            height: `${600 - (390 * scrollProgress)}px`,
                                            display: 'flex', 
                                            justifyContent: 'center',
                                            zIndex: 100,
                                            boxShadow: isPinned ? '0 10px 40px rgba(0,0,0,0.6)' : 'none',
                                            transition: 'box-shadow 0.3s ease', // NO height/padding transition here
                                            overflow: 'hidden',
                                            borderBottom: isPinned ? '1px solid #334155' : 'none',
                                            willChange: 'height, padding' // Performance hint
                                        }}>
                                            <div style={{ 
                                                width: '100%', 
                                                maxWidth: `${1100 - (300 * scrollProgress)}px`, 
                                                aspectRatio: '16/9', 
                                                height: 'auto',
                                                position: 'relative',
                                                transform: `scale(${1 - (0.05 * scrollProgress)})`,
                                                transformOrigin: 'top center',
                                                willChange: 'transform, max-width' // Performance hint
                                            }}>
                                                <CustomVideoPlayer 
                                                    src={activeContent.url} 
                                                    title={activeContent.title}
                                                    seekTo={videoSeek}
                                                    onTimeUpdate={(time) => setCurrentVideoTime(time)}
                                                />
                                            </div>
                                        </div>

                                        {/* Layout Sync Spacer - Keeps total height CONSTANT (664px) during 438px transition */}
                                        <div style={{ 
                                            height: `${438 * scrollProgress}px`, 
                                            width: '100%',
                                            pointerEvents: 'none',
                                            visibility: 'hidden'
                                        }} />

                                        {/* Video Info Section */}
                                        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '2rem', position: 'relative', zIndex: 10 }}>
                                            <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                                                <button 
                                                    onClick={() => setVideoInfoTab('overview')}
                                                    style={{ padding: '0 0.5rem 1rem', background: 'none', border: 'none', borderBottom: videoInfoTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent', color: videoInfoTab === 'overview' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Overview
                                                </button>
                                                <button 
                                                    onClick={() => setVideoInfoTab('search')}
                                                    style={{ padding: '0 0.5rem 1rem', background: 'none', border: 'none', borderBottom: videoInfoTab === 'search' ? '2px solid #2563eb' : '2px solid transparent', color: videoInfoTab === 'search' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    <Search size={16} /> Smart Search
                                                </button>
                                                <button 
                                                    onClick={() => setVideoInfoTab('notes')}
                                                    style={{ padding: '0 0.5rem 1rem', background: 'none', border: 'none', borderBottom: videoInfoTab === 'notes' ? '2px solid #2563eb' : '2px solid transparent', color: videoInfoTab === 'notes' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Notes
                                                </button>
                                            </div>

                                            {/* Note Selection Popup */}
                                            {selectionPopup.visible && (
                                                <div 
                                                    style={{ 
                                                        position: 'fixed', 
                                                        top: (selectionPopup.y - 45) + 'px', 
                                                        left: selectionPopup.x + 'px', 
                                                        transform: 'translateX(-50%)',
                                                        zIndex: 2000,
                                                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                                    }}
                                                >
                                                    <button 
                                                        onClick={saveNote}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                            background: '#0f172a', color: 'white', padding: '0.5rem 1rem', borderRadius: '24px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        <Plus size={14} /> Save a note
                                                    </button>
                                                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #0f172a', margin: '0 auto' }}></div>
                                                </div>
                                            )}

                                            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                                                {activeContent.title}
                                            </h1>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700 }}>
                                                        {course?.instructor?.charAt(0) || 'I'}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#334155' }}>{course?.instructor || 'Instructor'}</span>
                                                </div>
                                                <span>•</span>
                                                <span>Last updated {new Date().toLocaleDateString()}</span>
                                            </div>

                                            {videoInfoTab === 'overview' && (
                                                <div style={{ lineHeight: '1.7', color: '#475569', fontSize: '1rem' }}>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>About this lesson</h3>
                                                    <p>
                                                        {activeContent.description || 'In this lesson, you will learn the fundamental concepts and practical applications. Make sure to take notes and review the attached resources.'}
                                                    </p>
                                                </div>
                                            )}

                                            {videoInfoTab === 'notes' && (
                                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Notes</h3>
                                                        {notes.length > 0 && (
                                                            <button 
                                                                onClick={clearNotes}
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                Clear All
                                                            </button>
                                                        )}
                                                    </div>

                                                    {notes.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {notes.map(note => (
                                                                <div 
                                                                    key={note.id} 
                                                                    style={{ 
                                                                        padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', position: 'relative', transition: 'all 0.2s'
                                                                    }}
                                                                    className="hover:border-blue-200 hover:shadow-sm"
                                                                >
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                                        <button 
                                                                            onClick={() => jumpToTime(note.startTime)}
                                                                            style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                        >
                                                                            <PlayCircle size={14} />
                                                                            {Math.floor(note.startTime/60)}:{(note.startTime%60).toString().padStart(2, '0')}
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => deleteNote(note.id)}
                                                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                                        >
                                                                            <XIcon size={16} />
                                                                        </button>
                                                                    </div>
                                                                    <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>"{note.text}"</p>
                                                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                            Refers to: <span style={{ color: '#64748b', fontWeight: 600 }}>{note.contentTitle}</span>
                                                                        </span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(note.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                                            <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#94a3b8' }}>
                                                                <FileText size={24} />
                                                            </div>
                                                            <h4 style={{ color: '#1e293b', margin: '0 0 0.5rem' }}>No notes yet</h4>
                                                            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Select any text in the transcript to save it as a note for quick reference later.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {videoInfoTab === 'search' && (
                                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Transcript</h3>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Language: </span>
                                                                <select style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                                                                    <option>English</option>
                                                                </select>
                                                                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '0 0.5rem' }}>|</span>
                                                                <button 
                                                                    onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                                                                    style={{ background: 'none', border: 'none', color: isAutoScrollEnabled ? '#2563eb' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                >
                                                                    <div style={{ width: '32px', height: '18px', background: isAutoScrollEnabled ? '#2563eb' : '#cbd5e1', borderRadius: '20px', position: 'relative', transition: 'all 0.3s' }}>
                                                                        <div style={{ position: 'absolute', top: '2px', left: isAutoScrollEnabled ? '16px' : '2px', width: '14px', height: '14px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }}></div>
                                                                    </div>
                                                                    Auto-scroll
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {!activeContent.transcript ? (
                                                            <button 
                                                                onClick={handleTranscribe}
                                                                disabled={isTranscribing}
                                                                style={{ 
                                                                    padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                                                }}
                                                            >
                                                                {isTranscribing ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                                                                {isTranscribing ? 'Processing...' : 'Generate Transcript'}
                                                            </button>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View Notes</button>
                                                                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Download PDF</button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!activeContent.transcript ? (
                                                        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                                            <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                                <FileText size={30} />
                                                            </div>
                                                            <p style={{ color: '#475569', margin: 0 }}>This video hasn't been transcribed yet.</p>
                                                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Use AI to extract text and enable keyword searching.</p>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            <div style={{ position: 'relative' }}>
                                                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Search keywords (e.g. 'State', 'Effect')..." 
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                                                        borderRadius: '8px', 
                                                                        border: '1px solid #e2e8f0', 
                                                                        fontSize: '0.95rem',
                                                                        outline: 'none',
                                                                        boxSizing: 'border-box'
                                                                    }}
                                                                />
                                                            </div>

                                                             <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', background: '#fff', borderRadius: '12px' }} className="transcript-container">
                                                                {searchTerm ? (
                                                                    searchTranscript().length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                            {searchTranscript().map((seg, idx) => (
                                                                                <button 
                                                                                    key={idx}
                                                                                    onClick={() => jumpToTime(seg.startTime)}
                                                                                    style={{ 
                                                                                        textAlign: 'left', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem'
                                                                                    }}
                                                                                    className="hover:border-blue-300 hover:bg-blue-50"
                                                                                >
                                                                                    <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                                                        {Math.floor(seg.startTime/60)}:{(seg.startTime%60).toString().padStart(2, '0')}
                                                                                    </span>
                                                                                    <span style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                                                                                        {seg.text}
                                                                                    </span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No matches found for "{searchTerm}"</p>
                                                                    )
                                                                ) : (
                                                                    getGroupedTranscript().map((group, gIdx) => (
                                                                        <div key={gIdx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
                                                                            <div style={{ position: 'sticky', top: '0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, paddingTop: '4px' }}>
                                                                                {Math.floor(group.startTime/60)}:{(group.startTime%60).toString().padStart(2, '0')}
                                                                            </div>
                                                                            <div style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#475569' }}>
                                                                                {group.segments.map((seg, sIdx) => {
                                                                                    const nextSeg = activeContent.transcript[activeContent.transcript.indexOf(seg) + 1];
                                                                                    const isActive = currentVideoTime >= seg.startTime && (!nextSeg || currentVideoTime < nextSeg.startTime);
                                                                                    
                                                                                    return (
                                                                                        <span 
                                                                                            key={sIdx}
                                                                                            onClick={() => jumpToTime(seg.startTime)}
                                                                                            onMouseUp={(e) => handleTranscriptSelection(e, seg)}
                                                                                            data-active-transcript={isActive}
                                                                                            style={{ 
                                                                                                cursor: 'pointer',
                                                                                                padding: '2px 4px',
                                                                                                borderRadius: '4px',
                                                                                                background: isActive ? '#dbeafe' : 'transparent',
                                                                                                color: isActive ? '#1e40af' : 'inherit',
                                                                                                fontWeight: isActive ? 600 : 400,
                                                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                                borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent'
                                                                                            }}
                                                                                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = '#f1f5f9')}
                                                                                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                                                                                        >
                                                                                            {seg.text}{' '}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
            
            {/* Certificate Modal */}
            <CertificateModal 
                isOpen={isCertModalOpen} 
                onClose={() => setIsCertModalOpen(false)} 
                certData={certData} 
            />

            <style jsx>{`
                .sidebar-item-hover:hover { 
                    background-color: #f8fafc !important; 
                    transform: translateX(4px);
                }
                .hover-bg-slate-100:hover { background-color: #f1f5f9 !important; }
                .hover-text-primary:hover { color: #0ea5e9 !important; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default CourseContent;
