import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, BarChart2, Settings, LogOut, Play, Compass, Filter, CheckCircle, AlertCircle, FileText, ArrowRight, HelpCircle, Bell, Search, Calendar, ShieldCheck, Brain, Target, Shield, Activity, Zap, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonalizationModal from '../../components/Modals/PersonalizationModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateModal from '../../components/Learner/CertificateModal';
import Logo from '../../assets/EroSkillupAcademy.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [assignmentTab, setAssignmentTab] = useState('assignments');
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState(null);
  
  // Certificate States
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState(null);
  const [isCertLoading, setIsCertLoading] = useState(false);

  // AI Insights States
  const [insights, setInsights] = useState(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);


  useEffect(() => {
     const storedUser = localStorage.getItem('user');
     if (storedUser) {
         const userData = JSON.parse(storedUser);
         setUser(userData);
         const userId = userData.id || userData._id;
         if (userId) {
             fetchEnrolledCourses(userId);
             fetchLearningInsights(userId);
         }
     }
  }, []);

  const fetchLearningInsights = async (userId) => {
      setIsInsightsLoading(true);
      try {
          const res = await fetch(`http://localhost:5000/api/ai/learning-insights`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
          });
          const data = await res.json();
          if (res.ok) setInsights(data);
      } catch (err) {
          console.error("Failed to fetch AI insights");
      } finally {
          setIsInsightsLoading(false);
      }
  };

  const fetchEnrolledCourses = async (userId) => {
      try {
          const res = await fetch(`http://localhost:5000/api/users/${userId}/courses`);
          const data = await res.json();
          // Filter out null courseIds immediately
          setEnrolledCourses(data.filter(e => e.courseId));
      } catch (err) {
          console.error("Failed to fetch courses");
      }
  };

  const handleUnenrollClick = (course) => {
      setCourseToUnenroll(course);
      setShowUnenrollConfirm(true);
  };

  const performUnenroll = async () => {
    if (!courseToUnenroll || !user) return;

    try {
        const userId = user.id || user._id;
        const res = await fetch(`http://localhost:5000/api/users/${userId}/courses/${courseToUnenroll._id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            toast.success(`Unenrolled from ${courseToUnenroll.title}`);
            // Optimistically update
            setEnrolledCourses(prev => prev.filter(e => e.courseId._id !== courseToUnenroll._id));
            setShowUnenrollConfirm(false);
            setCourseToUnenroll(null);
        } else {
            const data = await res.json();
            toast.error(data.msg || 'Unenrollment failed');
        }
    } catch (err) {
        console.error(err);
        toast.error('Unenrollment failed');
    }
  };

  const fetchCertificateData = async (courseId) => {
    setIsCertLoading(true);
    try {
        const userId = user.id || user._id;
        const res = await fetch(`http://localhost:5000/api/users/${userId}/courses/${courseId}/certificate`);
        const data = await res.json();
        
        if (res.ok) {
            setCertData(data);
            setIsCertModalOpen(true);
        } else {
            toast.error(data.msg || "Certificate data unavailable.");
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to generate certificate preview.");
    } finally {
        setIsCertLoading(false);
    }
  };

  // Calculate Stats
  // Calculate Stats
  const coursesInProgress = enrolledCourses.filter(c => c.progress < 100).length;
  const coursesCompleted = enrolledCourses.filter(c => c.progress === 100).length;
  
  let totalScore = 0;
  let gradedCount = 0;
  let totalAssignments = 0;
  let pendingAssignments = 0;

  enrolledCourses.forEach(enrollment => {
      const course = enrollment.courseId;
      if (!course) return;

      // Assignments
      if (course.assignments) {
          course.assignments.forEach(assign => {
              totalAssignments++;
              const submission = enrollment.assignments?.find(a => a.assignmentId === assign._id);
              if (submission) {
                  if (submission.score !== undefined) {
                      totalScore += submission.score;
                      gradedCount++;
                  }
              } else {
                  pendingAssignments++;
              }
          });
      }

      // Quizzes (Treat as assignments for stats?)
      if (course.quizzes) {
          course.quizzes.forEach(quiz => {
               const attempt = enrollment.quizzes?.find(q => q.quizId === quiz._id);
               if (attempt) {
                   totalScore += attempt.score;
                   gradedCount++;
               }
          });
      }
  });

  const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

  const stats = [
    { label: 'Courses in Progress', value: coursesInProgress, icon: <BookOpen size={24} color="#6366f1" />, bg: '#e0e7ff', color: '#4338ca' },
    { label: 'Completed Courses', value: coursesCompleted, icon: <CheckCircle size={24} color="#10b981" />, bg: '#dcfce7', color: '#15803d' },
    { label: 'Avg. Score', value: `${avgScore}%`, icon: <BarChart2 size={24} color="#3b82f6" />, bg: '#dbeafe', color: '#1d4ed8' },
    { label: 'Pending Tasks', value: pendingAssignments, icon: <Clock size={24} color="#f59e0b" />, bg: '#fef3c7', color: '#b45309' },
  ];

  // Aggregate all tasks (assignments and quizzes)
  let allTasks = [];
  enrolledCourses.forEach(enrollment => {
      const course = enrollment.courseId;
      if (!course) return;

      // Assignments
      if (course.assignments) {
          course.assignments.forEach(assign => {
              const submission = enrollment.assignments?.find(a => a.assignmentId === assign._id);
              allTasks.push({
                  id: assign._id,
                  type: 'assignment',
                  title: assign.title,
                  courseTitle: course.title,
                  courseId: course._id,
                  dueDate: assign.dueDate,
                  status: submission ? (submission.submissionUrl ? 'Submitted' : 'Pending') : 'Pending',
                  score: submission?.score,
                  completedAt: submission?.completedAt
              });
          });
      }

      // Quizzes
      if (course.quizzes) {
            course.quizzes.forEach(quiz => {
                const attempt = enrollment.quizzes?.find(q => q.quizId === quiz._id);
                allTasks.push({
                    id: quiz._id,
                    type: 'quiz',
                    title: quiz.title,
                    courseTitle: course.title,
                    courseId: course._id,
                    dueDate: null, // Quizzes might not have due dates in schema yet
                    status: attempt ? (attempt.score >= 80 ? 'Passed' : 'Failed') : 'Pending',
                    score: attempt?.score,
                    completedAt: attempt?.completedAt
                });
            });
      }
  });

  // Calculate upcoming deadlines (including overdue)
  const upcomingDeadlines = allTasks
    .filter(task => task.dueDate && task.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);


  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>Loading Dashboard...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
             
              {/* Left Column: Stats & Courses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* AI Learning Insights Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderRadius: '24px',
                        padding: '2rem',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                     {/* Decorative Gradients */}
                     <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
                     
                     <div style={{ position: 'relative', zIndex: 1 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                                <Brain size={28} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>AI Learning Analytics</h3>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Zap size={12} fill="#94a3b8" /> Real-time Performance Analysis
                                </div>
                            </div>
                         </div>

                         {isInsightsLoading ? (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                                 <RefreshCw size={24} className="animate-spin text-indigo-400" />
                                 <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Synthesizing your achievement data...</p>
                             </div>
                         ) : insights ? (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                 
                                 {/* Overview Stats */}
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>Assessment</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.5 }}>{insights.overallAssessment}</div>
                                     </div>
                                     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Pace & Prediction</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: insights.learningPace === 'Ahead' ? '#10b981' : insights.learningPace === 'Behind' ? '#f43f5e' : '#f59e0b', lineHeight: 1 }}>
                                            {insights.learningPace}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 500 }}>
                                            Predicted: <span style={{ color: '#cbd5e1' }}>{insights.predictedCompletion}</span>
                                        </div>
                                     </div>
                                 </div>

                                 {/* Detailed Insights */}
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                     <div>
                                         <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#bfc9d4', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Target size={14} /> Key Strengths</h4>
                                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                             {insights.strengths.slice(0, 3).map((s, i) => (
                                                 <div key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                     {s}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                     <div>
                                         <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#bfc9d4', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Info size={14} /> Attention Needed</h4>
                                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                             {insights.weakAreas.slice(0, 3).map((w, i) => (
                                                 <div key={i} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                                     {w}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 </div>

                                 <div style={{ background: 'rgba(79, 70, 229, 0.08)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                                     <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} fill="#a5b4fc" /> Smart Strategy</h4>
                                     <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                         {insights.studyTips[0]}
                                     </p>
                                 </div>
                             </div>
                         ) : (
                            <div style={{ textAlign: 'center', padding: '1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                                Insights will appear once you engage with more course content.
                            </div>
                         )}
                     </div>
                  </motion.div>

                  {/* Stats Grid */}
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Global Progress Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {stats.map((stat, idx) => (
                            <motion.div 
                                whileHover={{ y: -5 }}
                                key={idx} 
                                className="card" 
                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderRadius: '20px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: '#0f172a', marginBottom: '0.25rem' }}>{stat.value}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                  {/* Continue Learning */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Continue Learning</h3>
                        <button onClick={() => setActiveTab('mycourses')} style={{ color: '#4f46e5', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>All Courses <ArrowRight size={16} /></button>
                    </div>

                    {enrolledCourses.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                            {enrolledCourses.slice(0, 3).map((enrollment, idx) => (
                                <motion.div 
                                    key={idx} 
                                    whileHover={{ scale: 1.01 }}
                                    className="card" 
                                    style={{ padding: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', borderRadius: '16px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem' }} 
                                    onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)}
                                >
                                     <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0, overflow: 'hidden' }}>
                                        {enrollment.courseId?.thumbnail && (enrollment.courseId.thumbnail.startsWith('http') || enrollment.courseId.thumbnail.startsWith('/')) ? (
                                            <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            (enrollment.courseId?.thumbnail && enrollment.courseId.thumbnail.length < 10) ? enrollment.courseId.thumbnail : '🎓'
                                        )}
                                     </div>
                                     <div style={{ flex: 1 }}>
                                         <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#1e293b' }}>{enrollment.courseId?.title || 'Untitled Course'}</h4>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: '#6366f1', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{enrollment.courseId?.category || 'General'}</span>
                                            <span>{enrollment.progress || 0}% Complete</span>
                                         </div>
                                         <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', width: '100%', maxWidth: '300px' }}>
                                            <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: enrollment.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '3px' }}></div>
                                         </div>
                                     </div>
                                     
                                     <button 
                                        className="btn" 
                                        style={{ background: '#f8fafc', color: '#475569', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                     >
                                        <Play size={20} fill="#475569" />
                                     </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <p>No active courses. Start learning today!</p>
                        </div>
                    )}
                </div>
             </div>

             {/* Right Column: Sidebar Widgets */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 
                 {/* Compact Personalization Card */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', padding: '1.5rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Customize Path</h3>
                            <p style={{ fontSize: '0.8rem', color: '#e0e7ff', lineHeight: 1.4 }}>Get personalized course recommendations.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
                            <Compass size={20} color="white" />
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsPersonalizeOpen(true)} 
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'white', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        Update Interests <ArrowRight size={14} />
                    </button>
                </div>

                 {/* Upcoming Deadlines */}
                 <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Deadlines</h3>
                         {upcomingDeadlines.length > 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>{upcomingDeadlines.length} Due</span>}
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         {upcomingDeadlines.length > 0 ? (
                            upcomingDeadlines.map((task, idx) => {
                                const date = new Date(task.dueDate);
                                const isOverdue = date < new Date();
                                const month = date.toLocaleString('default', { month: 'short' });
                                const day = date.getDate();
                                return (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: isOverdue ? '#fee2e2' : '#f1f5f9', padding: '0.5rem', borderRadius: '10px', minWidth: '50px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isOverdue ? '#b91c1c' : '#ef4444', textTransform: 'uppercase' }}>{month}</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isOverdue ? '#b91c1c' : '#1e293b' }}>{day}</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem', marginBottom: '0.1rem', lineHeight: 1.2 }}>
                                                {task.title}
                                                {isOverdue && <span style={{ fontSize: '0.65rem', marginLeft: '0.5rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>OVERDUE</span>}
                                            </h5>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{task.courseTitle}</p>
                                        </div>
                                    </div>
                                );
                            })
                         ) : (
                             <div style={{ textAlign: 'center', padding: '1rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                 <CheckCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                 <p>No upcoming deadlines!</p>
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Calendar / Date Widget */}
                 <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                     </h3>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                         {['S','M','T','W','T','F','S'].map((d,i) => <div key={i}>{d}</div>)}
                         
                         {/* Empty slots for start of month */}
                         {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                             <div key={`empty-${i}`}></div>
                         ))}

                         {/* Days */}
                         {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                             const isToday = d === new Date().getDate();
                             return (
                                 <div key={d} style={{ 
                                     padding: '0.5rem 0', 
                                     borderRadius: '8px', 
                                     background: isToday ? '#4f46e5' : 'transparent', 
                                     color: isToday ? 'white' : '#1e293b',
                                     cursor: 'pointer',
                                     fontWeight: isToday ? 700 : 500
                                }}>
                                    {d}
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             </div>
          </motion.div>
        );
      
      case 'mycourses':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>My Enrolled Courses</h2>
            {enrolledCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {enrolledCourses.map((enrollment, idx) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ y: -5 }}
                            className="card" 
                            style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                            onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)}
                        >
                             <div style={{ height: '180px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                {enrollment.courseId?.thumbnail && (enrollment.courseId.thumbnail.startsWith('http') || enrollment.courseId.thumbnail.startsWith('/')) ? (
                                    <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    (enrollment.courseId?.thumbnail && enrollment.courseId.thumbnail.length < 10) ? enrollment.courseId.thumbnail : '🎓'
                                )}
                             </div>
                             <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px', background: '#e0e7ff', padding: '4px 8px', borderRadius: '6px' }}>
                                      {enrollment.courseId?.category || 'General'}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b', lineHeight: 1.3 }}>{enrollment.courseId?.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {enrollment.courseId?.description || 'No description available.'}
                                </p>
                                
                                <div style={{ marginTop: 'auto' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    <span>Progress</span>
                                    <span>{enrollment.progress || 0}%</span>
                                  </div>
                                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: enrollment.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px' }}></div>
                                  </div>
                                    <button 
                                      className="btn btn-primary" 
                                      style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                                    >
                                      {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'} <ArrowRight size={18} />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnenrollClick(enrollment.courseId);
                                        }}
                                        style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: 0.8 }}
                                    >
                                        <LogOut size={14} /> Unenroll
                                    </button>
                                  </div>
                             </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#64748b', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                       <BookOpen size={40} color="#94a3b8" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Data Found</h3>
                    <p>You are not enrolled in any courses.</p>
                </div>
            )}
          </motion.div>
        );

      case 'assignments':
        // Filter tasks based on assignmentTab (Assignments vs Quizzes) AND assignmentFilter
        const filteredTasks = allTasks.filter(task => {
            // Filter by type
            if (assignmentTab === 'assignments' && task.type !== 'assignment') return false;
            if (assignmentTab === 'quizzes' && task.type !== 'quiz') return false;

            // Filter by status (all/pending/completed)
            if (assignmentFilter === 'all') return true;
            const isCompleted = task.status === 'Submitted' || task.status === 'Passed' || task.status === 'Failed' || (task.score !== undefined);
            if (assignmentFilter === 'pending') return !isCompleted;
            if (assignmentFilter === 'completed') return isCompleted;
            return true;
        });

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => setAssignmentTab('assignments')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            background: assignmentTab === 'assignments' ? '#4f46e5' : 'transparent',
                            color: assignmentTab === 'assignments' ? 'white' : '#64748b',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: assignmentTab === 'assignments' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                        }}
                    >
                        <FileText size={18} />
                        Assignments
                    </button>
                    <button
                        onClick={() => setAssignmentTab('quizzes')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            background: assignmentTab === 'quizzes' ? '#4f46e5' : 'transparent',
                            color: assignmentTab === 'quizzes' ? 'white' : '#64748b',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: assignmentTab === 'quizzes' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                        }}
                    >
                        <HelpCircle size={18} />
                        Quizzes
                    </button>
                </div>
                
                <div style={{ background: 'white', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', border: '1px solid #e2e8f0' }}>
                    {['all', 'pending', 'completed'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setAssignmentFilter(filter)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                background: assignmentFilter === filter ? '#e0e7ff' : 'transparent',
                                color: assignmentFilter === filter ? '#4f46e5' : '#64748b',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
             </div>
             
             {filteredTasks.length > 0 ? (
               <div style={{ display: 'grid', gap: '1rem' }}>
                 {filteredTasks.map((task, idx) => {
                     const isCompleted = task.status === 'Submitted' || task.status === 'Passed' || task.status === 'Failed' || (task.score !== undefined);
                     
                     return (
                        <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                               <div style={{ 
                                   padding: '0.75rem', 
                                   background: isCompleted ? (task.status === 'Failed' ? '#fee2e2' : '#dcfce7') : '#fef3c7', 
                                   borderRadius: '12px', 
                                   color: isCompleted ? (task.status === 'Failed' ? '#b91c1c' : '#166534') : '#b45309' 
                                }}>
                                   {task.type === 'quiz' ? <HelpCircle size={22} /> : <FileText size={22} />}
                               </div>
                               <div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                       <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', margin: 0 }}>{task.title}</h4>
                                       <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                                           {task.type}
                                       </span>
                                   </div>
                                   <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                       <span style={{ fontWeight: 500 }}>{task.courseTitle}</span>
                                       {task.dueDate && (
                                           <>
                                            <span>•</span>
                                            <span style={{ color: '#ef4444' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                           </>
                                       )}
                                   </div>
                               </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {isCompleted ? (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: task.score >= 80 ? '#10b981' : task.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                                            {task.score}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                                            {task.status}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>Pending</div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => navigate(`/course-content/${task.courseId}`)}
                                    style={{ 
                                        padding: '0.6rem 1.25rem', 
                                        borderRadius: '10px', 
                                        background: isCompleted ? '#f1f5f9' : '#4f46e5', 
                                        color: isCompleted ? '#475569' : 'white', 
                                        fontWeight: 600, 
                                        fontSize: '0.9rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isCompleted ? 'Review' : 'Start'} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                     );
                 })}
               </div>
             ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        {assignmentTab === 'assignments' ? <FileText size={40} color="#94a3b8" /> : <HelpCircle size={40} color="#94a3b8" />}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>No {assignmentTab} found</h3>
                    <p style={{ color: '#64748b' }}>Try changing the filter or enroll in a new course.</p>
                </div>
             )}
          </motion.div>
        );

      case 'achievements':
        const completedCoursesList = enrolledCourses.filter(c => c.progress === 100);
        
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
             
             {/* Achievement Stats */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', borderRadius: '24px', color: 'white', boxShadow: '0 10px 20px -5px rgba(30, 64, 175, 0.3)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Rank</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>#42</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', width: 'fit-content' }}>
                        Top 5% this month
                    </div>
                </div>
                <div style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Skill Points</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>2,450</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                        <ArrowRight size={16} style={{ transform: 'rotate(-45deg)' }} /> +150 this week
                    </div>
                </div>
                <div style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Certificates</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{completedCoursesList.length}</div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        Certified Mastery
                    </div>
                </div>
             </div>

             {/* Earned Badges Section */}
             <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award size={24} color="#4f46e5" /> Academic Badges
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        style={{ textAlign: 'center', padding: '2.5rem 2rem', border: '2px dashed #e2e8f0', background: '#f8fafc', borderRadius: '24px', position: 'relative', overflow: 'hidden', opacity: coursesCompleted > 0 ? 1 : 0.6 }}
                    >
                        <div style={{ width: '80px', height: '80px', background: coursesCompleted > 0 ? '#dcfce7' : '#f1f5f9', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <Award size={40} color={coursesCompleted > 0 ? '#10b981' : '#94a3b8'} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: coursesCompleted > 0 ? '#1e293b' : '#94a3b8', marginBottom: '0.5rem' }}>Course Finisher</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{coursesCompleted > 0 ? "You've mastered your first course!" : "Complete your first course to unlock."}</p>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        style={{ textAlign: 'center', padding: '2.5rem 2rem', borderRadius: '24px', background: '#fffbeb', border: '1px solid #fef3c7', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.1)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fffbeb', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.15)' }}>
                        <Award size={40} color="#f59e0b" fill="#fef3c7" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Fast Starter</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Enrolled in {enrolledCourses.length} courses! Great momentum.</p>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#f59e0b' }}></div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        style={{ textAlign: 'center', padding: '2.5rem 2rem', borderRadius: '24px', background: '#e0e7ff', border: '1px solid #c7d2fe', position: 'relative', overflow: 'hidden', opacity: avgScore >= 90 ? 1 : 0.6 }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #e0e7ff' }}>
                        <Award size={40} color="#4f46e5" fill="#e0e7ff" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: avgScore >= 90 ? '#1e293b' : '#94a3b8', marginBottom: '0.5rem' }}>Eagle Eye</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{avgScore >= 90 ? "Maintained a 90%+ average score!" : "Reach 90% average score to unlock."}</p>
                    </motion.div>
                </div>
             </div>

             {/* COURSE CERTIFICATES SECTION */}
             <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><ShieldCheck size={24} color="#10b981" /> Verified Certificates</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '100px' }}>{completedCoursesList.length} Earned</span>
                </h3>

                {completedCoursesList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {completedCoursesList.map((enrollment, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ y: -5 }}
                                style={{
                                    background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ height: '160px', background: 'linear-gradient(45deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <Award size={64} color="white" style={{ opacity: 0.3 }} />
                                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem', opacity: 0.9 }}>Official Certificate</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{enrollment.courseId?.title}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                        <div style={{ color: '#64748b' }}>Instructor: <span style={{ fontWeight: 600, color: '#1e293b' }}>{enrollment.courseId?.instructor}</span></div>
                                        <div style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Verified</div>
                                    </div>
                                    <button 
                                        onClick={() => fetchCertificateData(enrollment.courseId?._id)}
                                        disabled={isCertLoading}
                                        style={{
                                            width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        <FileText size={18} /> {isCertLoading ? 'Verifying...' : 'View Certificate'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <ShieldCheck size={32} color="#94a3b8" />
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Certificates Yet</h4>
                        <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>Complete a course to 100% to earn your official verified certificate.</p>
                        <button onClick={() => setActiveTab('mycourses')} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Finish Courses</button>
                    </div>
                )}
             </div>
          </motion.div>
        );

      case 'settings':
         return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Account Settings</h2>
                 <div className="card" style={{ padding: '0', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                     <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                             <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Personalization</h4>
                             <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Manage your interests and career goals</p>
                         </div>
                         <button onClick={() => setIsPersonalizeOpen(true)} className="btn" style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Manage</button>
                     </div>
                     <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                             <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Email Notifications</h4>
                             <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Receive weekly progress reports</p>
                         </div>
                         <div style={{ width: '50px', height: '28px', background: '#cbd5e1', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                             <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
                         </div>
                     </div>
                 </div>
             </motion.div>
         );
        
      default:
        return null;
    }
  };

  return (
    <div style={{ background: 'transparent', minHeight: 'calc(100vh - 80px)', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#fff', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '1px 0 0 #f1f5f9', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }} className="hidden-mobile">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
          <div style={{ width: '50px', height: '50px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px' }}>
            <img src={Logo} alt="EroSkillUp Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>EroSkillUp</h2>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Learning Portal</span>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
              { id: 'overview', label: 'Overview', icon: BarChart2 },
              { id: 'mycourses', label: 'My Courses', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                width: '100%', 
                padding: '0.9rem 1.25rem', 
                borderRadius: '12px', 
                textAlign: 'left', 
                background: activeTab === item.id ? '#4f46e5' : 'transparent',
                color: activeTab === item.id ? 'white' : '#64748b',
                fontWeight: activeTab === item.id ? 600 : 500,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                boxShadow: activeTab === item.id ? '0 4px 12px -2px rgba(79, 70, 229, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                  if(activeTab !== item.id) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#1e293b';
                  }
              }}
              onMouseLeave={(e) => {
                  if(activeTab !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                  }
              }}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
             
             {/* Mini User Profile Removed */}

        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 {activeTab === 'overview' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
             </h1>
             <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: '#4f46e5', fontWeight: 700 }}>{user.name.split(' ')[0]}</span>! Ready to conquer today?</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                  <Search size={20} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Search..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '250px', outline: 'none', color: '#475569', fontSize: '0.95rem' }} />
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                  <Bell size={20} color="#64748b" />
                  <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '8px', right: '8px' }}></div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700 }}>
                  <span style={{ fontSize: '0.9rem' }}>{new Date().getDate()}</span>
              </div>
          </div>
        </header>

        {renderContent()}
        
        {/* Personalization Modal */}
        {user && (
            <PersonalizationModal 
                isOpen={isPersonalizeOpen} 
                onClose={() => setIsPersonalizeOpen(false)} 
                user={user}
                onUpdate={(updatedUser) => setUser(updatedUser)}
            />
        )}

        <ConfirmModal
            isOpen={showUnenrollConfirm}
            onClose={() => setShowUnenrollConfirm(false)}
            onConfirm={performUnenroll}
            title="Unenroll Course?"
            message={`Are you sure you want to unenroll from "${courseToUnenroll?.title}"? You will lose your progress.`}
            confirmText="Yes, Unenroll"
            cancelText="Cancel"
            isDestructive={true}
            icon={LogOut}
        />

        {/* Certificate Modal Overlay */}
        <CertificateModal 
            isOpen={isCertModalOpen} 
            onClose={() => setIsCertModalOpen(false)} 
            certData={certData} 
        />
      </main>



      <style jsx>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
        }
        .card:hover {
            transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
