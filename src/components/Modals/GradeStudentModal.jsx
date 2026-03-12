import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GradeStudentModal = ({ isOpen, onClose, student, courseAssignments, courseId, onGradeUpdated }) => {
    const [updatingId, setUpdatingId] = useState(null);
    const [grades, setGrades] = useState({});

    // Keep local state in sync or populate when opened
    React.useEffect(() => {
        if (student && student.assignments) {
            const initialGrades = {};
            student.assignments.forEach(a => {
                if (a.score !== undefined && a.score !== null) {
                    initialGrades[a.assignmentId] = a.score;
                }
            });
            setGrades(initialGrades);
        }
    }, [student, isOpen]);

    if (!isOpen || !student) return null;

    const handleGradeChange = (assignmentId, value) => {
        setGrades(prev => ({ ...prev, [assignmentId]: value }));
    };

    const submitGrade = async (assignmentId) => {
        const scoreToSubmit = grades[assignmentId];
        if (scoreToSubmit === undefined || scoreToSubmit === '') {
            toast.error("Please enter a valid grade.");
            return;
        }

        setUpdatingId(assignmentId);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${student.studentId}/courses/${courseId}/assignments/${assignmentId}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: Number(scoreToSubmit) })
            });

            if (res.ok) {
                toast.success("Grade saved!");
                onGradeUpdated(); // Refresh gradebook data in parent
            } else {
                toast.error("Failed to save grade");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setUpdatingId(null);
        }
    };

    return createPortal(
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{ 
                        background: 'var(--bg-card)', 
                        padding: '2rem', 
                        borderRadius: '24px', 
                        maxWidth: '650px', 
                        width: '90%', 
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                        border: '1px solid rgba(255,255,255,0.5)',
                        position: 'relative'
                    }}
                >
                    <button 
                        onClick={onClose}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-lighter)', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-lighter)'}
                    >
                        <X size={24} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)', margin: '0 0 0.5rem 0' }}>Student Assignments</h2>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '2rem' }}>Grading submissions for <strong>{student.name}</strong></p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {courseAssignments?.map(courseAssign => {
                            // Find student submission
                            const submission = student.assignments?.find(a => a.assignmentId === courseAssign._id);
                            
                            return (
                                <div key={courseAssign._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'var(--bg-main)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{courseAssign.title}</h4>
                                            <span style={{ fontSize: '0.8rem', color: submission ? '#10b981' : '#f59e0b', fontWeight: 600, background: submission ? '#dcfce7' : '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                                {submission ? 'Submitted' : 'Pending'}
                                            </span>
                                        </div>
                                        {submission?.submissionUrl && (
                                            <a 
                                                href={submission.submissionUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                                            >
                                                View Work <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    
                                    {submission ? (
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Grade Score / 100</label>
                                                <input 
                                                    type="number" 
                                                    min="0" max="100"
                                                    value={grades[courseAssign._id] !== undefined ? grades[courseAssign._id] : ''}
                                                    onChange={(e) => handleGradeChange(courseAssign._id, e.target.value)}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 600, color: 'var(--text-main)' }}
                                                    placeholder="e.g. 85"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => submitGrade(courseAssign._id)}
                                                disabled={updatingId === courseAssign._id}
                                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px' }}
                                            >
                                                {updatingId === courseAssign._id ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />} 
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-lighter)' }}>
                                            The student has not uploaded a file yet.
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {courseAssignments?.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-lighter)' }}>No assignments in this course.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default GradeStudentModal;
