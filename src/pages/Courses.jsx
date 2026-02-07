import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { motion } from 'framer-motion';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchCourses = async () => {
             try {
                const res = await fetch('http://localhost:5000/api/courses');
                const data = await res.json();
                setCourses(data);
                setFilteredCourses(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses", err);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        let result = courses;
        
        if (selectedCategory !== 'All') {
            result = result.filter(course => course.category === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter(course => 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                course.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCourses(result);
    }, [searchTerm, selectedCategory, courses]);

    const categories = [
        "All",
        "Full Stack Development",
        "Mobile App Development",
        "DevOps Engineering",
        "Software Testing",
        "UI/UX Design",
        "Digital Marketing",
        "Node.js & MongoDB Development",
        "iOS App Development",
        "Java Development",
        "React.js Development",
        "Python Development",
        "Angular Development",
        "Android App Development",
        "PHP & MySQL Development",
        "Data Analytics"
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ background: '#0f172a', color: 'white', padding: '3rem 0 5rem' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Explore Courses</h1>
                    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                        <input 
                            type="text" 
                            placeholder="Search courses..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '1rem 1.5rem 1rem 3rem', 
                                borderRadius: '50px', 
                                border: 'none', 
                                outline: 'none',
                                fontSize: '1rem',
                                color: '#334155',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                         <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container" style={{ marginTop: '-3rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* Visual Sidebar for Filters */}
                <div className="card" style={{ width: '300px', padding: '1.5rem', position: 'sticky', top: '2rem', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        <Filter size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Categories</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map(cat => {
                            // Calculate count for this category
                            const count = cat === 'All' 
                                ? courses.length 
                                : courses.filter(c => c.category === cat).length;
                            
                            return (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem', 
                                        borderRadius: '8px', 
                                        background: selectedCategory === cat ? '#eff6ff' : 'transparent',
                                        color: selectedCategory === cat ? 'var(--primary)' : '#64748b',
                                        fontWeight: selectedCategory === cat ? 600 : 500,
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderLeft: selectedCategory === cat ? '3px solid var(--primary)' : '3px solid transparent'
                                    }}
                                >
                                    <span>{cat}</span>
                                    <span style={{ 
                                        background: selectedCategory === cat ? 'var(--primary)' : '#f1f5f9', 
                                        color: selectedCategory === cat ? 'white' : '#94a3b8',
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: 600
                                    }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Course Grid Area */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                             {selectedCategory === 'All' ? 'All Courses' : selectedCategory}
                         </h2>
                         <p style={{ color: '#64748b' }}>Showing {filteredCourses.length} results</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading catalog...</div>
                    ) : filteredCourses.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {filteredCourses.map((course, idx) => (
                                <motion.div 
                                    key={course._id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No courses found in this category.</h3>
                            <p>Try selecting a different category or adjusting your search.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Mobile Responsive Style */}
            <style jsx>{`
                @media (max-width: 900px) {
                    .container { flex-direction: column; }
                    .card[style*="sticky"] { position: static !important; width: 100% !important; maxHeight: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Courses;
