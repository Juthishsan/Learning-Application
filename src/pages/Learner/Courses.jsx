import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, BookOpen, ChevronDown, ArrowUpDown, ArrowDownAz, IndianRupee, Clock, Star } from 'lucide-react';
import CourseCard from '../../components/Common/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';

const Courses = () => {
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('alphabetical-az'); // alphabetical-az, alphabetical-za, price-low, price-high, newest, rating
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchTerm(searchParam);
        }
    }, [location.search]);

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
                course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                course.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting Logic
        const sortedResult = [...result].sort((a, b) => {
            if (sortBy === 'alphabetical-az') {
                return a.title?.localeCompare(b.title) || 0;
            } else if (sortBy === 'alphabetical-za') {
                return b.title?.localeCompare(a.title) || 0;
            } else if (sortBy === 'price-low') {
                return (a.price || 0) - (b.price || 0);
            } else if (sortBy === 'price-high') {
                return (b.price || 0) - (a.price || 0);
            } else if (sortBy === 'newest') {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            } else if (sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            }
            return 0;
        });

        setFilteredCourses(sortedResult);
    }, [searchTerm, selectedCategory, courses, sortBy]);

    const sortOptions = [
        { label: 'Alphabetical (A-Z)', value: 'alphabetical-az', icon: <ArrowDownAz size={16} /> },
        { label: 'Alphabetical (Z-A)', value: 'alphabetical-za', icon: <ArrowDownAz size={16} style={{ transform: 'rotate(180deg)' }} /> },
        { label: 'Price: Low to High', value: 'price-low', icon: <IndianRupee size={16} /> },
        { label: 'Price: High to Low', value: 'price-high', icon: <IndianRupee size={16} /> },
        { label: 'Newest First', value: 'newest', icon: <Clock size={16} /> },
        { label: 'Top Rated', value: 'rating', icon: <Star size={16} /> }
    ];

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
        <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ background: '#0f172a', color: 'white', padding: '3rem 0 5rem' }}>
                <div className="container">
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
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                         <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {selectedCategory === 'All' ? 'All Courses' : selectedCategory}
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Showing {filteredCourses.length} results</p>
                         </div>
                         
                         <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                onBlur={() => setTimeout(() => setShowSortMenu(false), 200)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    padding: '0.65rem 1.25rem', 
                                    borderRadius: '12px', 
                                    background: '#f8fafc', 
                                    border: '1px solid #e2e8f0', 
                                    fontWeight: 600, 
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                            >
                                <ArrowUpDown size={16} color="var(--primary)" />
                                <span>Sort By: <span style={{ color: '#0f172a' }}>{sortOptions.find(o => o.value === sortBy)?.label.split(' (')[0].split(': ')[0]}</span></span>
                                <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#94a3b8' }} />
                            </button>

                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            top: '120%',
                                            right: 0,
                                            width: '220px',
                                            background: 'white',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #f1f5f9',
                                            padding: '0.5rem',
                                            zIndex: 100
                                        }}
                                    >
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortMenu(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    width: '100%',
                                                    padding: '0.75rem 0.85rem',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    background: sortBy === option.value ? '#eff6ff' : 'transparent',
                                                    color: sortBy === option.value ? 'var(--primary)' : '#475569',
                                                    fontWeight: sortBy === option.value ? 700 : 500,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '28px', height: '28px', borderRadius: '8px', 
                                                    background: sortBy === option.value ? 'white' : '#f8fafc',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: sortBy === option.value ? 'var(--primary)' : '#94a3b8',
                                                    boxShadow: sortBy === option.value ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                                }}>
                                                    {option.icon}
                                                </div>
                                                {option.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading catalog...</div>
                    ) : filteredCourses.length > 0 ? (
                        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.map((course) => (
                                    <motion.div 
                                        layout
                                        key={course._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ display: 'flex' }}
                                    >
                                        <CourseCard course={course} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
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
