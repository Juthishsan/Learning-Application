import React, { useState, useEffect } from 'react';
import { X, Check, X as XIcon, HelpCircle, Download, Search, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const GradebookModal = ({ isOpen, onClose, courseId, courseTitle }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, passed, failed

    useEffect(() => {
        if (isOpen && courseId) {
            fetchGradebook();
        }
    }, [isOpen, courseId]);

    const fetchGradebook = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}/gradebook`);
            if (!res.ok) throw new Error('Failed to fetch gradebook');
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not load gradebook data");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              student.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'passed') return matchesSearch && student.progress >= 80; // Example criteria
        if (filter === 'failed') return matchesSearch && student.progress < 80;
        return matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card"
                style={{ 
                    position: 'relative', 
                    width: '90%', 
                    maxWidth: '1000px', 
                    height: '85vh', 
                    background: 'white', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Gradebook</h2>
                        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>{courseTitle}</p>
                    </div>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                    </div>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="all">All Students</option>
                        <option value="passed">High Progress ({'>'}80%)</option>
                        <option value="failed">Low Progress ({'<'}80%)</option>
                    </select>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                            Loading gradebook data...
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#64748b' }}>
                            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No students found matching your filters.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Progress</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Assignments</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Quizzes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '1rem 2rem' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '60px' }}>
                                                    <div style={{ height: '100%', background: student.progress >= 80 ? '#22c55e' : '#3b82f6', borderRadius: '3px', width: `${student.progress}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 2rem' }}>
                                            {student.assignments && student.assignments.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {student.assignments.map((assign, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                            <span style={{ color: '#334155' }}>Assgn {idx + 1}:</span>
                                                            {assign.submissionUrl ? (
                                                                <a 
                                                                    href={assign.submissionUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                                                                >
                                                                    <Download size={14} /> View
                                                                </a>
                                                            ) : (
                                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending</span>
                                                            )}
                                                            {assign.score !== undefined && (
                                                                <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', color: '#475569' }}>
                                                                    {assign.score}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No submissions</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 2rem' }}>
                                            {student.quizzes && student.quizzes.length > 0 ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {student.quizzes.map((quiz, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            title={`Quiz ${idx+1}`}
                                                            style={{ 
                                                                padding: '0.25rem 0.5rem', 
                                                                background: quiz.score >= 80 ? '#dcfce7' : '#fee2e2', 
                                                                color: quiz.score >= 80 ? '#166534' : '#b91c1c', 
                                                                borderRadius: '6px', 
                                                                fontSize: '0.8rem', 
                                                                fontWeight: 600 
                                                            }}
                                                        >
                                                            Q{idx+1}: {quiz.score}%
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No quizzes taken</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GradebookModal;
