import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, BarChart2, Settings, LogOut, Play, Compass, Filter, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonalizationModal from '../components/PersonalizationModal';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  useEffect(() => {
     const storedUser = localStorage.getItem('user');
     if (storedUser) {
         const userData = JSON.parse(storedUser);
         setUser(userData);
         const userId = userData.id || userData._id;
         if (userId) {
             fetchEnrolledCourses(userId);
         }
     }
  }, []);

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

  // Calculate Stats
  const coursesInProgress = enrolledCourses.filter(c => c.progress < 100).length;
  const coursesCompleted = enrolledCourses.filter(c => c.progress === 100).length;
  
  // Calculate average score
  let totalScore = 0;
  let assignmentsCount = 0;
  enrolledCourses.forEach(c => {
      if (c.assignments) {
          c.assignments.forEach(a => {
              totalScore += a.score;
              assignmentsCount++;
          });
      }
  });
  const avgScore = assignmentsCount > 0 ? Math.round(totalScore / assignmentsCount) : 0;

  const stats = [
    { label: 'Courses in Progress', value: coursesInProgress, icon: <BookOpen size={20} color="#4f46e5" />, color: '#e0e7ff' },
    { label: 'Completed Courses', value: coursesCompleted, icon: <Award size={20} color="#059669" />, color: '#d1fae5' },
    { label: 'Avg. Assignment Score', value: `${avgScore}%`, icon: <BarChart2 size={20} color="#0ea5e9" />, color: '#e0f2fe' },
    { label: 'Certificates Won', value: coursesCompleted, icon: <Award size={20} color="#f59e0b" />, color: '#fef3c7' },
  ];

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>Loading Dashboard...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
             {/* Personalization CTA */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Customize Your Learning Path</h3>
                    <p style={{ color: '#e0e7ff', maxWidth: '500px', fontSize: '1.1rem' }}>Tell us about your occupation and interests to get personalized course recommendations.</p>
                </div>
                <button 
                    onClick={() => setIsPersonalizeOpen(true)} 
                    className="btn" 
                    style={{ background: 'white', color: '#4f46e5', border: 'none', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: '8px' }}
                >
                    <Compass size={20} /> Edit Interests
                </button>
            </div>

             {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px', background: 'white' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: '#0f172a', marginBottom: '0.5rem' }}>{stat.value}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Continue Learning</h2>
                <button onClick={() => setActiveTab('mycourses')} style={{ color: '#4f46e5', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <ArrowRight size={16} /></button>
            </div>

            {enrolledCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {enrolledCourses.slice(0, 3).map((enrollment, idx) => (
                        <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px', background: 'white', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)}>
                             <div style={{ height: '140px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', borderBottom: '1px solid #e2e8f0' }}>
                                {enrollment.courseId?.thumbnail || '🎓'}
                             </div>
                             <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#1e293b' }}>{enrollment.courseId?.title || 'Untitled Course'}</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{enrollment.courseId?.category || 'Course'}</p>
                                </div>
                                
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        <span>Progress</span>
                                        <span>{enrollment.progress || 0}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: enrollment.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                                    </div>
                                </div>

                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
                                >
                                    {enrollment.progress > 0 ? 'Resume Course' : 'Start Course'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '12px' }}>
                    <BookOpen size={48} style={{ marginBottom: '1.5rem', color: '#cbd5e1', margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>No courses started yet.</h3>
                    <p style={{ marginBottom: '2rem' }}>Go to the Courses page to enroll in your first class!</p>
                    <button onClick={() => navigate('/courses')} className="btn btn-primary">Browse Courses</button>
                </div>
            )}
          </motion.div>
        );
      
      case 'mycourses':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>My Enrolled Courses</h2>
            {enrolledCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {enrolledCourses.map((enrollment, idx) => (
                        <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                             <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                {enrollment.courseId?.thumbnail || '🎓'}
                             </div>
                             <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                                  {enrollment.courseId?.category || 'General'}
                                </span>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>{enrollment.courseId?.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {enrollment.courseId?.description || 'No description available.'}
                                </p>
                                
                                <div style={{ marginTop: 'auto' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    <span>Progress</span>
                                    <span>{enrollment.progress || 0}%</span>
                                  </div>
                                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                                    <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: enrollment.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px' }}></div>
                                  </div>
                                  <button 
                                    onClick={() => navigate(`/course-content/${enrollment.courseId?._id}`)}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '0.85rem' }}
                                  >
                                    Continue Learning
                                  </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <p>You are not enrolled in any courses.</p>
                </div>
            )}
          </motion.div>
        );

      case 'assignments':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Assignments</h2>
             {enrolledCourses.length > 0 ? (
               <div style={{ display: 'grid', gap: '1.5rem' }}>
                 {enrolledCourses.map((enrollment, idx) => {
                     // Check if this course has the mock 'assign_1' completed
                     const assignmentData = enrollment.assignments?.find(a => a.assignmentId === 'assign_1');
                     const isCompleted = !!assignmentData;
                     const passed = assignmentData?.score >= 80;
                     
                     return (
                        <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                               <div style={{ padding: '1rem', background: isCompleted ? (passed ? '#dcfce7' : '#fee2e2') : '#fff7ed', borderRadius: '12px', color: isCompleted ? (passed ? '#166534' : '#b91c1c') : '#c2410c' }}>
                                   {isCompleted ? <CheckCircle size={24} /> : <FileText size={24} />}
                               </div>
                               <div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                       <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Assignment 1: Frontend Basics</h4>
                                       <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                           {enrollment.courseId?.title}
                                       </span>
                                   </div>
                                   <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                       {isCompleted 
                                           ? `Submitted on ${new Date(assignmentData.completedAt).toLocaleDateString()} • Score: ${assignmentData.score}%` 
                                           : 'Not started yet • Due Jan 30, 2026'
                                       }
                                   </p>
                               </div>
                            </div>
                            
                            {isCompleted ? (
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'inline-block', fontSize: '0.85rem', padding: '0.35rem 1rem', borderRadius: '20px', background: passed ? '#dcfce7' : '#fee2e2', color: passed ? '#166534' : '#b91c1c', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {passed ? 'Passed' : 'Failed'}
                                    </span>
                                    <button 
                                        onClick={() => navigate(`/course-content/${enrollment.courseId._id}`)}
                                        style={{ display: 'block', fontSize: '0.85rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                    >
                                        Review
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate(`/course-content/${enrollment.courseId._id}`)}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}
                                >
                                    Start Assignment
                                </button>
                            )}
                        </div>
                     );
                 })}
               </div>
             ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No assignments pending. Enroll in a course to see tasks here.</div>
             )}
          </motion.div>
        );

      case 'achievements':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Your Achievements</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                 {/* Mock Achievements */}
                 <div className="card" style={{ textAlign: 'center', padding: '2.5rem', border: '2px dashed #cbd5e1', background: '#f8fafc', borderRadius: '16px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Award size={40} color="#94a3b8" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Course Finisher</h3>
                    <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Complete your first course to unlock this badge.</p>
                 </div>
                 
                 <div className="card" style={{ textAlign: 'center', padding: '2.5rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#fffbeb', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Award size={40} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Fast Starter</h3>
                    <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Enrolled in {enrolledCourses.length} courses! Great start.</p>
                 </div>
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
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }} className="hidden-mobile">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
            {user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{user.name}</h3>
            <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700, background: '#e0e7ff', padding: '4px 10px', borderRadius: '20px' }}>Student</span>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                padding: '1rem 1.25rem', 
                borderRadius: '16px', 
                textAlign: 'left', 
                background: activeTab === item.id ? '#4f46e5' : 'transparent',
                color: activeTab === item.id ? 'white' : '#64748b',
                fontWeight: activeTab === item.id ? 600 : 500,
                transition: 'all 0.2s',
                boxShadow: activeTab === item.id ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
              }}
            >
              <item.icon size={22} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                 {activeTab === 'overview' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
             </h1>
             <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, {user.name.split(' ')[0]}! Ready to learn?</p>
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
