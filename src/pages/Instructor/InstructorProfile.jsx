
import { useEffect, useState } from 'react';
import InstructorSidebar from '../../components/Instructor/InstructorSidebar';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'instructor',
        bio: user.bio || '',
        expertise: user.expertise || '',
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id || user._id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Update failed');

            localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
            setUser({ ...user, ...data });
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile');
        }
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <InstructorSidebar />
            
            <main style={{ flex: 1, padding: '2.5rem' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>My Profile</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage your personal information and public bio</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
                    {/* Profile Card */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 800, border: '4px solid #e0e7ff' }}>
                            {formData.name.charAt(0)}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{formData.name}</h2>
                        <p style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#e0e7ff', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>{formData.role}</p>
                        
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                <Mail size={16} /> {formData.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                <Phone size={16} /> {formData.phone || 'No phone added'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                <Calendar size={16} /> Joined {formData.joinedDate}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Edit Details</h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={iconStyle} />
                                        <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={iconStyle} />
                                        <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="+1 234 567 890" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Headline / Expertise</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={18} style={iconStyle} />
                                    <input name="expertise" value={formData.expertise} onChange={handleChange} style={inputStyle} placeholder="e.g. Senior React Developer" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Bio</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '1rem', minHeight: '150px', resize: 'vertical' }} placeholder="Tell students about yourself..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', color: '#1e293b' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };

export default InstructorProfile;
