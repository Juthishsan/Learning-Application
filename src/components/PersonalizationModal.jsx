import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Briefcase, Layers, Code, Database, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const PersonalizationModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        field: user?.preferences?.field || '',
        occupation: user?.preferences?.occupation || '',
        skills: user?.preferences?.skills || []
    });

    const [skillInput, setSkillInput] = useState('');

    const fields = [
        "Software Development", "Data & Analytics", "Information Technology", 
        "Marketing", "Design", "Finance & Accounting", 
        "Product & Project Management", "Business Operations"
    ];

    const occupations = {
        "Software Development": [
            "Android Developer", "Back End Web Developer", "Data Engineer", 
            "DevOps Engineer", "Front End Web Developer", "Full Stack Web Developer",
            "iOS Developer", "Java Developer", "Software Architect"
        ],
        "default": [
            "Student", "Manager", "Consultant", "Freelancer", "Researcher"
        ]
    };

    const suggestedSkills = [
        "React", "Node.js", "Python", "Java", "AWS", "Docker", "UI/UX", "Machine Learning"
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleSkill = (skill) => {
        if (formData.skills.includes(skill)) {
            setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
        } else {
            setFormData({ ...formData, skills: [...formData.skills, skill] });
        }
    };

    const addManualSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput('');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Profile updated successfully!');
                // Update local storage user
                const updatedUser = { ...user, preferences: data.preferences };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                if (onUpdate) onUpdate(updatedUser);
                onClose();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card"
                style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: 0, background: 'var(--bg-card)', border: '1px solid #334155' }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Customize Your Experience</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', background: '#f1f5f9', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={22} color="var(--primary)" /> What field are you learning for?
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {fields.map(field => (
                                        <label key={field} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                                            borderRadius: '8px', border: formData.field === field ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: formData.field === field ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <input 
                                                type="radio" 
                                                name="field" 
                                                checked={formData.field === field} 
                                                onChange={() => setFormData({...formData, field})}
                                                style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{field}</span>
                                        </label>
                                    ))}
                                </div>


                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={22} color="var(--primary)" /> Which occupation are you learning for?
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    {(occupations[formData.field] || occupations['default']).map(occ => (
                                        <label key={occ} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                                            borderRadius: '8px', border: formData.occupation === occ ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: formData.occupation === occ ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <input 
                                                type="radio" 
                                                name="occupation" 
                                                checked={formData.occupation === occ} 
                                                onChange={() => setFormData({...formData, occupation: occ})}
                                                style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{occ}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code size={22} color="var(--primary)" /> What skills are you interested in?
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose a few to start with. You can add more later.</p>
                                
                                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search for a skill (e.g. React, Python)..." 
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={addManualSkill}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Selected Skills:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                                    {formData.skills.length === 0 && <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No skills selected yet.</span>}
                                    {formData.skills.map(skill => (
                                        <span key={skill} style={{ 
                                            background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', 
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' 
                                        }}>
                                            {skill}
                                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleSkill(skill)} />
                                        </span>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Popular Suggestions:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {suggestedSkills.map(skill => (
                                        <button 
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            style={{ 
                                                padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid #cbd5e1', background: 'transparent',
                                                color: formData.skills.includes(skill) ? 'var(--primary)' : '#475569',
                                                borderColor: formData.skills.includes(skill) ? 'var(--primary)' : '#cbd5e1',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {axiosSkill(skill, formData.skills) ? '+' : '+'} {skill}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    {step > 1 ? (
                        <button onClick={handleBack} className="btn" style={{ border: '1px solid #cbd5e1', color: '#475569' }}>
                            Back
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button onClick={handleNext} disabled={!formData.field && step === 1} className="btn btn-primary" style={{ opacity: (!formData.field && step === 1) ? 0.5 : 1 }}>
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                            {loading ? 'Saving...' : 'Finish & Save'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Helper for UI
const axiosSkill = (skill, skills) => skills.includes(skill);

export default PersonalizationModal;
