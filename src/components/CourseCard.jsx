import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    // Determine random color based on category if not provided
    const getCategoryColor = (cat) => {
        if(cat === 'Data Science') return '#e0e7ff';
        if(cat === 'Development') return '#dcfce7';
        if(cat === 'Design') return '#ffedd5';
        return '#f3f4f6';
    }

    return (
        <Link to={`/course/${course._id}`} className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '160px', background: getCategoryColor(course.category), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s' }}>
                <span style={{ fontSize: '3rem' }}>{course.thumbnail || '📚'}</span>
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: '#e0e7ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        {course.category}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> {course.rating || 4.5}
                    </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>{course.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#64748b' }}>
                             {course.instructor?.[0]}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course.instructor}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{course.price}</span>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
