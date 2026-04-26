import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Save, Link as LinkIcon, Facebook, Linkedin, Youtube, Globe, Twitter, Instagram, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        resume: user?.resume || '',
        website: user?.socialLinks?.website || '',
        facebook: user?.socialLinks?.facebook || '',
        instagram: user?.socialLinks?.instagram || '',
        linkedin: user?.socialLinks?.linkedin || '',
        twitter: user?.socialLinks?.twitter || '',
        youtube: user?.socialLinks?.youtube || ''
    });

    const [resumeFile, setResumeFile] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || '',
                resume: user.resume || '',
                website: user.socialLinks?.website || '',
                facebook: user.socialLinks?.facebook || '',
                instagram: user.socialLinks?.instagram || '',
                linkedin: user.socialLinks?.linkedin || '',
                twitter: user.socialLinks?.twitter || '',
                youtube: user.socialLinks?.youtube || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name) newErrors.name = "Full Name is required";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // 1. Upload Resume if selected
            let resumeUrl = formData.resume;
            if (resumeFile) {
                const resumeData = new FormData();
                resumeData.append('resume', resumeFile);

                const uploadRes = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/resume`, {
                    method: 'POST',
                    body: resumeData // No Content-Type header needed for FormData, browser sets it
                });
                
                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    resumeUrl = uploadResult.resume;
                } else {
                    toast.error('Failed to upload resume');
                    throw new Error('Resume upload failed');
                }
            }

            // 2. Update Profile with text data + resume URL
            const updates = {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                resume: resumeUrl, // Updated URL
                socialLinks: {
                    website: formData.website,
                    facebook: formData.facebook,
                    instagram: formData.instagram,
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    youtube: formData.youtube
                }
            };

            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Profile updated successfully!');
                const updatedUser = { ...user, ...data };
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

    return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: 0, background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', position: 'relative' }}
            >
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 50, borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Edit Profile</h2>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ padding: '2rem' }}>
                    
                    {/* Basic Info */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>Basic Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : '#e2e8f0', background: errors.name ? '#fef2f2' : 'white' }} />
                                {errors.name && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}><AlertCircle size={14} /> {errors.name}</div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="+1 234 567 890" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} style={inputStyle} placeholder="City, Country" />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>About You (Bio)</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell us a bit about yourself..." style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Resume (PDF)</label>
                                
                                {/* Existing or Selected Resume Preview */}
                                {(resumeFile || formData.resume) && (
                                    <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '200px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <iframe 
                                            key={resumeFile ? 'local' : formData.resume} // Forces re-render if source changes
                                            src={resumeFile ? URL.createObjectURL(resumeFile) : formData.resume} 
                                            title="Resume Preview"
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 'none' }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <label className="btn" style={{ border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <FileText size={16} /> 
                                        {resumeFile ? 'Change File' : (formData.resume ? 'Update Resume' : 'Upload Resume')}
                                        <input 
                                            type="file" 
                                            accept=".pdf"
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }} 
                                        />
                                    </label>
                                    
                                    {resumeFile && (
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{resumeFile.name} (Selected)</span>
                                    )}
                                    
                                    {!resumeFile && formData.resume && (
                                         <a href={formData.resume} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
                                             Open in New Tab
                                         </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div style={{ marginBottom: '2rem' }}>
                         <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>Social Links</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}><Globe size={14} /> Website</label>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}><Twitter size={14} /> Twitter (X)</label>
                                <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="@username" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}><Linkedin size={14} /> LinkedIn</label>
                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Profile URL" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}><Facebook size={14} /> Facebook</label>
                                <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Username" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}><Instagram size={14} /> Instagram</label>
                                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}><Youtube size={14} /> YouTube</label>
                                <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="Channel URL" style={inputStyle} />
                            </div>
                         </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ border: '1px solid #cbd5e1' }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {loading ? 'Saving...' : <>Save Changes <Save size={18} /></>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    );
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: '#475569'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '0.95rem'
};

export default EditProfileModal;
