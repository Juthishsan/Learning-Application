import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AnnounceModal = ({ isOpen, onClose, user }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [myCourses, setMyCourses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchCourses();
        } else {
            document.body.style.overflow = 'unset';
            // Reset form
            setTitle('');
            setMessage('');
            setSelectedCourse('all');
        }
        return () => {
             document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            if (!user) return;
            const coursesRes = await fetch('http://localhost:5000/api/courses');
            const allCourses = await coursesRes.json();
             // Instructors can only announce to their own courses
            const filtered = allCourses.filter(c => c.instructor === user.name);
            setMyCourses(filtered);
        } catch (err) {
            console.error("Failed to fetch courses for announcement:", err);
            toast.error("Failed to load courses");
        }
    };

    const handleAnnounce = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !message.trim()) {
            toast.error('Title and message are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/notifications/announce', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    message,
                    courseId: selectedCourse === 'all' ? null : selectedCourse,
                    instructorName: user.name
                })
            });

            if (res.ok) {
                toast.success('Announcement sent successfully!');
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Failed to send announcement');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
                        padding: '2.5rem', 
                        borderRadius: '24px', 
                        maxWidth: '500px', 
                        width: '90%', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                        border: '1px solid rgba(255,255,255,0.5)',
                        position: 'relative'
                    }}
                >
                    <button 
                        onClick={onClose}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-lighter)', transition: 'color 0.2s', padding: '4px' }}
                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-lighter)'}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>Create Announcement</h2>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Share updates with your learners</p>
                        </div>
                    </div>

                    <form onSubmit={handleAnnounce} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Audience</label>
                            <select 
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-main)',
                                    background: 'var(--bg-main)',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem top 50%',
                                    backgroundSize: '0.65rem auto',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02) inset'
                                }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                            >
                                <option value="all">📝 All Learners ({myCourses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0)} students max)</option>
                                {myCourses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        📚 {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Announcement Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Important Update for Module 3"
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    fontSize: '0.95rem',
                                    background: 'var(--bg-main)',
                                    transition: 'border-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02) inset'
                                }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message Detail</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your full announcement here..."
                                rows={4}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    outline: 'none', 
                                    fontSize: '0.95rem',
                                    background: 'var(--bg-main)',
                                    transition: 'border-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02) inset',
                                    resize: 'vertical'
                                }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                            <button 
                                type="button"
                                onClick={onClose}
                                style={{ 
                                    padding: '0.875rem 1.5rem', 
                                    borderRadius: '12px', 
                                    background: 'transparent', 
                                    color: 'var(--text-light)', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.2s',
                                    border: '1px solid transparent',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)'; }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                style={{ 
                                    padding: '0.875rem 1.75rem', 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                    color: 'white', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                                onMouseOver={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'}}
                                onMouseOut={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)'}}
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Send Announcement <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default AnnounceModal;
