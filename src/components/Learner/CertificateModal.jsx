import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Award, ShieldCheck, Share2, Clipboard, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const CertificateModal = ({ isOpen, onClose, certData }) => {
    const certificateRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !certData) return null;

    const downloadPDF = async () => {
        setIsGenerating(true);
        const element = certificateRef.current;
        try {
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`EroSkillUp_Certificate_${certData.userName.replace(/\s+/g, '_')}.pdf`);
            toast.success("Certificate downloaded successfully!");
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(certData.certificateId);
        setCopied(true);
        toast.success("Certificate ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
                    padding: '1.5rem'
                }}
            >
                <div style={{
                    background: '#fff', borderRadius: '16px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', width: '95%', maxWidth: '1200px',
                    maxHeight: '95vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    {/* Header bar within Modal */}
                    <div style={{
                        padding: '1rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Award className="text-blue-600" />
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>Official Achievement Certificate</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                             <button onClick={copyToClipboard} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>{copied ? 'Copied!' : certData.certificateId}</button>
                             <button onClick={downloadPDF} disabled={isGenerating} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{isGenerating ? 'Processing...' : 'Download'}</button>
                             <button onClick={onClose} style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                    </div>

                    {/* Preview Area Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center', background: '#cbd5e1' }}>
                        
                        {/* THE REDESIGNED CERTIFICATE (A4 Landscape) */}
                        <div 
                            ref={certificateRef}
                            style={{
                                width: '1000px', height: '707px', background: '#fff', position: 'relative',
                                boxSizing: 'border-box', border: '1px solid #e2e8f0', display: 'flex',
                                fontFamily: "'Times New Roman', Times, serif"
                            }}
                        >
                            {/* Inner Border Frame */}
                            <div style={{ position: 'absolute', inset: '12px', border: '1px solid #e2e8f0', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', inset: '8px', border: '1px solid #e2e8f0', pointerEvents: 'none' }} />
                            
                            {/* Main Content Area (Left) */}
                            <div style={{ flex: 1, padding: '50px 80px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                
                                {/* Logo & Branding */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                                    <div style={{ 
                                        fontSize: '48px', fontWeight: 900, color: '#1e40af', letterSpacing: '-2px',
                                        fontFamily: 'arial, sans-serif'
                                    }}>
                                        EroSkillUp
                                    </div>
                                    <div style={{ width: '2px', height: '40px', background: '#e2e8f0' }} />
                                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'arial, sans-serif' }}>
                                        Learning Platform
                                    </div>
                                </div>

                                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px', fontFamily: 'arial, sans-serif' }}>
                                    {certData.date}
                                </div>

                                {/* Student Name */}
                                <h1 style={{ fontSize: '64px', margin: '0 0 10px 0', color: '#1e293b', fontWeight: 400 }}>
                                    {certData.userName}
                                </h1>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px', fontFamily: 'arial, sans-serif' }}>
                                    has successfully completed
                                </p>

                                {/* Course Title */}
                                <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#0f172a', fontWeight: 400 }}>
                                    {certData.courseTitle}
                                </h2>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px', fontFamily: 'arial, sans-serif' }}>
                                    an online course authorized by EroSkillUp and offered through the academy portal.
                                </p>

                                {/* Signatures Area */}
                                <div style={{ marginTop: 'auto', marginBottom: '40px', display: 'flex', gap: '60px' }}>
                                    
                                    {/* Signature 1 */}
                                    <div style={{ minWidth: '220px' }}>
                                        <div style={{ 
                                            fontFamily: "'Dancing Script', cursive",
                                            fontSize: '32px', color: '#0f172a', borderBottom: '1px solid #1e293b',
                                            paddingBottom: '5px', marginBottom: '10px', fontStyle: 'italic'
                                        }}>
                                            {certData.instructorName}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700, fontFamily: 'arial, sans-serif' }}>{certData.instructorName}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'arial, sans-serif' }}>Course Lead Instructor</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'arial, sans-serif' }}>EroSkillUp Skills Network</div>
                                    </div>

                                    {/* Signature 2 (Dharanidharan, CEO) */}
                                    <div style={{ minWidth: '220px' }}>
                                        <div style={{ 
                                            fontFamily: "'Dancing Script', cursive",
                                            fontSize: '32px', color: '#0f172a', borderBottom: '1px solid #1e293b',
                                            paddingBottom: '5px', marginBottom: '10px', fontStyle: 'italic'
                                        }}>
                                            Dharanidharan
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700, fontFamily: 'arial, sans-serif' }}>Dharanidharan</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'arial, sans-serif' }}>CEO & Managing Director</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'arial, sans-serif' }}>Academy Board</div>
                                    </div>
                                </div>

                                {/* Fine Print Footer (Now positioned with margin instead of absolute overlap) */}
                                <div style={{ 
                                    fontSize: '10px', color: '#94a3b8', lineHeight: '1.4', fontFamily: 'arial, sans-serif',
                                    maxWidth: '600px'
                                 }}>
                                    This certificate attests to the learner's completion of an online course / project delivered via EroSkillUp. It does not constitute formal enrollment at any university or entity and does NOT itself grant academic credit, grades, or a degree. Institutions or organizations may, at their discretion, recognize this learning toward their own programs or credentials.
                                </div>
                            </div>

                            {/* Sidebar Area (Right) */}
                            <div style={{ width: '280px', background: '#f1f5f9', position: 'relative', overflow: 'hidden', padding: '60px 30px', borderLeft: '1px solid #e2e8f0' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '5px', fontFamily: 'arial, sans-serif' }}>Course</h3>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', fontFamily: 'arial, sans-serif' }}>Certificate</h3>
                                </div>

                                {/* Logo Identification Seal */}
                                <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '200px', height: '200px', borderRadius: '50%',
                                        border: '4px double #cbd5e1', position: 'relative',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#fff', overflow: 'hidden'
                                    }}>
                                        {/* Logo Image Placeholder - User should put logo.png in public/ folder */}
                                        <img 
                                            src="/logo.png" 
                                            alt="EroSkillUp Academy"
                                            style={{ 
                                                width: '100%', height: '100%', 
                                                objectFit: 'contain', 
                                                padding: '20px'
                                            }} 
                                            onError={(e) => {
                                                // Fallback if image not found
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div style={{ textAlign: 'center', display: 'none' }}>
                                            <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e40af', letterSpacing: '-1px' }}>Ero</div>
                                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>SkillUp</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Verify Footer */}
                                <div style={{ marginTop: 'auto', position: 'absolute', bottom: '60px', left: '30px', right: '30px' }}>
                                     <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', fontFamily: 'arial, sans-serif' }}>
                                         Verify at:
                                     </div>
                                     <div style={{ fontSize: '11px', color: '#2563eb', textAlign: 'right', fontWeight: 600, wordBreak: 'break-all', fontFamily: 'arial, sans-serif' }}>
                                         {certData.verificationUrl}
                                     </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* CSS for Signatures and Style */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                `}} />
            </motion.div>
        </AnimatePresence>
    );
};

export default CertificateModal;
