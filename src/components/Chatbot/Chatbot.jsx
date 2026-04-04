import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquareText, X, Send, Bot, Loader2, Sparkles, MoreVertical, Trash2, PlusCircle, Copy, Check, History, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_MESSAGE = { 
    id: 'welcome', 
    text: "Hi there! I'm your AI Platform Guide. Whether you have questions about your courses or how to use the platform, I'm here to help! ✨", 
    sender: 'bot',
    timestamp: Date.now()
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const Chatbot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'history'
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [sessionToDeleteId, setSessionToDeleteId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    
    // Core state for multiple sessions
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem('eroskillup_chat_sessions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) return parsed;
            } catch (e) {
                console.error("Failed to parse chat sessions");
            }
        }
        return [{ id: generateId(), title: 'New Conversation', updatedAt: Date.now(), messages: [DEFAULT_MESSAGE] }];
    });

    const [currentSessionId, setCurrentSessionId] = useState(() => {
        const saved = localStorage.getItem('eroskillup_current_chat_id');
        if (saved && sessions.some(s => s.id === saved)) return saved;
        return sessions[0]?.id;
    });

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);

    // Derived state for current messages
    const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const messages = currentSession?.messages || [DEFAULT_MESSAGE];

    // Persist sessions and current ID
    useEffect(() => {
        localStorage.setItem('eroskillup_chat_sessions', JSON.stringify(sessions));
        localStorage.setItem('eroskillup_current_chat_id', currentSessionId);
    }, [sessions, currentSessionId]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        if (viewMode === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen, viewMode]);

    // Close chatbot on route change, but retain state
    useEffect(() => {
        setIsOpen(false);
        setShowMenu(false);
    }, [location.pathname]);

    // --- Actions ---

    const updateCurrentSession = (newMessages, newTitle = null) => {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return { 
                    ...s, 
                    messages: newMessages, 
                    updatedAt: Date.now(),
                    title: newTitle || s.title
                };
            }
            return s;
        }));
    };

    const handleNewChat = () => {
        const newId = generateId();
        const newSession = { id: newId, title: 'New Conversation', updatedAt: Date.now(), messages: [DEFAULT_MESSAGE] };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setViewMode('chat');
        setShowMenu(false);
    };

    const handleLoadSession = (id) => {
        setCurrentSessionId(id);
        setViewMode('chat');
        setShowMenu(false);
    };

    const confirmClearHistory = () => {
        setShowMenu(false);
        setShowConfirmClear(true);
    };

    const executeClearHistory = () => {
        const newId = generateId();
        const freshSession = { id: newId, title: 'New Conversation', updatedAt: Date.now(), messages: [DEFAULT_MESSAGE] };
        setSessions([freshSession]);
        setCurrentSessionId(newId);
        setViewMode('chat');
        setShowConfirmClear(false);
        localStorage.removeItem('eroskillup_chat_sessions');
        localStorage.removeItem('eroskillup_current_chat_id');
    };

    const executeDeleteSession = () => {
        if (!sessionToDeleteId) return;
        
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== sessionToDeleteId);
            // If we deleted everything, make a fresh one
            if (filtered.length === 0) {
                const newId = generateId();
                const freshSession = { id: newId, title: 'New Conversation', updatedAt: Date.now(), messages: [DEFAULT_MESSAGE] };
                setCurrentSessionId(newId);
                return [freshSession];
            }
            // If we deleted the active one, switch to the first available
            if (currentSessionId === sessionToDeleteId) {
                setCurrentSessionId(filtered[0].id);
            }
            return filtered;
        });
        setSessionToDeleteId(null);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsgText = input.trim();
        const userMsgId = Date.now().toString();
        const userMessage = { id: userMsgId, text: userMsgText, sender: 'user', timestamp: Date.now() };
        
        // Check if this is the first user message to set the chat title
        const isFirstMessage = messages.length === 1;
        const newTitle = isFirstMessage ? (userMsgText.length > 30 ? userMsgText.substring(0, 30) + '...' : userMsgText) : null;
        
        const updatedMessages = [...messages, userMessage];
        updateCurrentSession(updatedMessages, newTitle);
        
        setInput('');
        setIsTyping(true);

        try {
            // Determine if we are on a course page and extract ID safely
            let courseId = null;
            if (location.pathname.startsWith('/course-content/')) {
                const parts = location.pathname.split('/course-content/')[1].split('/');
                courseId = parts[0];
            } else if (location.pathname.startsWith('/course/')) {
                const parts = location.pathname.split('/course/')[1].split('/');
                courseId = parts[0];
            }

            // Clean history for API
            const apiHistory = updatedMessages.map(m => ({ text: m.text, sender: m.sender }));

            const res = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsgText,
                    history: apiHistory.slice(0, -1), // Everything except the prompt just added
                    courseId 
                })
            });

            if (res.ok) {
                const data = await res.json();
                const botMessage = { id: Date.now().toString(), text: data.text, sender: data.sender, timestamp: Date.now() };
                updateCurrentSession([...updatedMessages, botMessage]);
            } else {
                updateCurrentSession([...updatedMessages, { id: Date.now().toString(), text: "I'm having a little trouble connecting to my knowledge base right now. Please try again later.", sender: 'bot', timestamp: Date.now() }]);
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            updateCurrentSession([...updatedMessages, { id: Date.now().toString(), text: "Network error. Please check your connection and try again.", sender: 'bot', timestamp: Date.now() }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 70, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 70, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        style={{
                            position: 'absolute',
                            bottom: '90px',
                            right: 0,
                            width: '400px',
                            maxWidth: 'calc(100vw - 4rem)',
                            height: '650px',
                            maxHeight: 'calc(100vh - 120px)',
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            position: 'relative',
                            zIndex: 20
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {viewMode === 'history' ? (
                                    <button 
                                        onClick={() => setViewMode('chat')}
                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                ) : (
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.25)', 
                                        padding: '0.6rem', 
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
                                    }}>
                                        <Sparkles size={22} color="white" />
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        {viewMode === 'history' ? 'Chat History' : 'AI Smart Tutor'}
                                    </h3>
                                    {viewMode === 'chat' && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem', fontWeight: 500 }}>
                                            <div style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(52, 211, 153, 0.4)' }} />
                                            Online & ready to help
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {viewMode === 'chat' && (
                                    <div ref={menuRef} style={{ position: 'relative' }}>
                                        <button 
                                            onClick={() => setShowMenu(!showMenu)}
                                            style={{ 
                                                background: showMenu ? 'rgba(255,255,255,0.3)' : 'transparent', 
                                                border: 'none', 
                                                color: 'white', 
                                                cursor: 'pointer', 
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        
                                        {/* Settings Dropdown Menu */}
                                        <AnimatePresence>
                                            {showMenu && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 10px)',
                                                        right: 0,
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                                        padding: '0.5rem',
                                                        minWidth: '200px',
                                                        zIndex: 100
                                                    }}
                                                >
                                                    <button onClick={handleNewChat} className="menu-btn" style={{ color: 'var(--text-main)' }}>
                                                        <PlusCircle size={16} /> New Chat
                                                    </button>
                                                    <button onClick={() => { setViewMode('history'); setShowMenu(false); }} className="menu-btn" style={{ color: 'var(--text-main)' }}>
                                                        <History size={16} /> View History
                                                    </button>
                                                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.25rem 0' }} />
                                                    <button onClick={confirmClearHistory} className="menu-btn" style={{ color: '#ef4444' }}>
                                                        <Trash2 size={16} /> Clear All Chats
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.15)', 
                                        border: 'none', 
                                        color: 'white', 
                                        cursor: 'pointer', 
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Custom Modern Confirm Dialog */}
                        <AnimatePresence>
                            {showConfirmClear && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        backdropFilter: 'blur(8px)',
                                        zIndex: 50,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem'
                                    }}
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        style={{
                                            background: 'var(--bg-card)',
                                            padding: '2rem',
                                            borderRadius: '20px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}
                                    >
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                            <Trash2 size={24} />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>Erase History?</h4>
                                        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            This will permanently delete all your previous conversations. This action cannot be undone.
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button 
                                                onClick={() => setShowConfirmClear(false)}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                                            >Cancel</button>
                                            <button 
                                                onClick={executeClearHistory}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}
                                            >Yes, Delete</button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Custom Modern Confirm Dialog For Single Deletion */}
                        <AnimatePresence>
                            {sessionToDeleteId && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        backdropFilter: 'blur(8px)',
                                        zIndex: 50,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem'
                                    }}
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        style={{
                                            background: 'var(--bg-card)',
                                            padding: '2rem',
                                            borderRadius: '20px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}
                                    >
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                            <Trash2 size={24} />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>Delete Chat?</h4>
                                        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            Are you sure you want to delete this specific conversation? This cannot be undone.
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button 
                                                onClick={() => setSessionToDeleteId(null)}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                                            >Cancel</button>
                                            <button 
                                                onClick={executeDeleteSession}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}
                                            >Yes, Delete</button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content Area Rendering (Chat vs History) */}
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <AnimatePresence mode="wait">
                                {viewMode === 'history' ? (
                                    /* --- History View --- */
                                    <motion.div 
                                        key="history"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-main)' }}
                                        className="chatbot-scrollbar"
                                    >
                                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Conversations</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {sessions.map(session => (
                                                <button
                                                    key={session.id}
                                                    onClick={() => handleLoadSession(session.id)}
                                                    style={{
                                                        background: currentSessionId === session.id ? 'var(--bg-card)' : 'transparent',
                                                        border: currentSessionId === session.id ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(0,0,0,0.05)',
                                                        boxShadow: currentSessionId === session.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                                        padding: '1rem',
                                                        borderRadius: '16px',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    className="history-card"
                                                >
                                                    <div style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        borderRadius: '50%', 
                                                        background: currentSessionId === session.id ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'var(--bg-secondary)', 
                                                        color: currentSessionId === session.id ? 'white' : 'var(--text-muted)',
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <MessageSquare size={18} />
                                                    </div>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <h5 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', color: currentSessionId === session.id ? 'var(--text-main)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                                            {session.title}
                                                        </h5>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                                            {new Date(session.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })} • {session.messages.length} msgs
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSessionToDeleteId(session.id); }}
                                                        className="session-delete-btn"
                                                        style={{
                                                            marginLeft: 'auto',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--text-muted)',
                                                            cursor: 'pointer',
                                                            padding: '0.5rem',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* --- Chat View --- */
                                    <motion.div 
                                        key="chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{
                                            flex: 1,
                                            padding: '1.5rem',
                                            overflowY: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.25rem',
                                            background: 'var(--bg-main)', // Use app theme
                                            backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)', // Subtle pattern
                                            backgroundSize: '30px 30px',
                                            backgroundPosition: '0 0, 15px 15px',
                                            opacity: 0.98
                                        }}
                                        className="chatbot-scrollbar"
                                    >
                                        {messages.map((msg, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key={msg.id || idx} 
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.4rem',
                                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                                    maxWidth: '88%'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-end' }}>
                                                    {msg.sender === 'bot' && (
                                                        <div style={{ 
                                                            flexShrink: 0, 
                                                            width: '36px', 
                                                            height: '36px', 
                                                            borderRadius: '12px', 
                                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            color: 'white',
                                                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
                                                        }}>
                                                            <Bot size={20} />
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'var(--bg-card)',
                                                        color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                                        padding: '1rem 1.25rem',
                                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                        boxShadow: msg.sender === 'user' 
                                                            ? '0 8px 16px rgba(139, 92, 246, 0.25)' 
                                                            : '0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.6',
                                                        letterSpacing: '0.01em',
                                                        wordBreak: 'break-word',
                                                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}>
                                                        {/* Basic Markdown-like formatting */}
                                                        {msg.text.split('\n').map((line, i) => (
                                                            <span key={i} style={{ display: 'block', minHeight: line.trim() ? 'auto' : '0.5rem' }}>
                                                                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                                        return <strong key={j} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                                                                    }
                                                                    return part;
                                                                })}
                                                            </span>
                                                        ))}
                                                        
                                                        {/* Copy button for bot messages */}
                                                        {msg.sender === 'bot' && msg.id !== 'welcome' && (
                                                            <button
                                                                onClick={() => handleCopy(msg.text, msg.id)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: '-25px',
                                                                    right: '0px',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: 'var(--text-muted)',
                                                                    fontSize: '0.75rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    cursor: 'pointer',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    transition: 'color 0.2s',
                                                                }}
                                                                onMouseOver={e => e.currentTarget.style.color = '#8b5cf6'}
                                                                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                                            >
                                                                {copiedId === msg.id ? (
                                                                    <><Check size={14} color="#10b981" /> Copied</>
                                                                ) : (
                                                                    <><Copy size={14} /> Copy</>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        
                                        {isTyping && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start' }}>
                                                <div style={{ 
                                                    flexShrink: 0, 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '12px', 
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: 'white',
                                                    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
                                                    marginTop: 'auto'
                                                }}>
                                                    <Bot size={20} />
                                                </div>
                                                <div style={{ 
                                                    background: 'var(--bg-card)', 
                                                    padding: '1.1rem 1.4rem', 
                                                    borderRadius: '20px 20px 20px 4px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.5rem', 
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                    border: '1px solid rgba(0,0,0,0.05)' 
                                                }}>
                                                    <motion.div animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }} style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%' }} />
                                                    <motion.div animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2, ease: 'easeInOut' }} style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%' }} />
                                                    <motion.div animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4, ease: 'easeInOut' }} style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%' }} />
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} style={{ height: '10px', flexShrink: 0 }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* End of Content Area */}

                        {/* Input Area (Only visible in Chat mode) */}
                        {viewMode === 'chat' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                style={{ 
                                padding: '1.25rem', 
                                background: 'var(--bg-card)', 
                                borderTop: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 -4px 20px rgba(0,0,0,0.02)'
                            }}>
                                <form onSubmit={handleSendMessage} style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    position: 'relative',
                                    background: 'var(--bg-main)',
                                    borderRadius: '30px',
                                    padding: '0.4rem',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    transition: 'border-color 0.3s',
                                }}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your question..."
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1.25rem',
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            color: 'var(--text-main)',
                                        }}
                                        disabled={isTyping || viewMode !== 'chat'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isTyping || viewMode !== 'chat'}
                                        style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '50%',
                                            background: input.trim() && !isTyping ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'var(--bg-secondary)',
                                            color: input.trim() && !isTyping ? 'white' : 'var(--text-muted)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none',
                                            transform: input.trim() && !isTyping ? 'scale(1)' : 'scale(0.95)'
                                        }}
                                        onMouseOver={e => { if (input.trim() && !isTyping) e.currentTarget.style.transform = 'scale(1.05)'; }}
                                        onMouseOut={e => { if (input.trim() && !isTyping) e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        {isTyping ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} style={{ marginLeft: '2px', opacity: 1 }} />}
                                    </button>
                                </form>
                                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, opacity: 0.7 }}>
                                        AI-powered learning assistant. Responses may vary.
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glowing Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.45), inset 0 0 0 1px rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Glow ring animation */}
                <motion.div
                    animate={{ 
                        boxShadow: ['0 0 0 0px rgba(139, 92, 246, 0.4)', '0 0 0 20px rgba(139, 92, 246, 0)'],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
                />
                
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={32} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={34} strokeWidth={1.5} color="white" />
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }} 
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    style={{ position: 'absolute', top: -8, right: -8, color: '#fef3c7', dropShadow: '0 0 5px rgba(254, 243, 199, 0.8)' }}
                                >
                                    <Sparkles size={16} strokeWidth={2.5} fill="#fef3c7" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
            <style>
                {`
                .chatbot-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .chatbot-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chatbot-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 10px;
                }
                .chatbot-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.4);
                }
                .menu-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .menu-btn:hover {
                    background: var(--bg-secondary);
                }
                .history-card:hover {
                    background: var(--bg-card) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
                }
                .session-delete-btn:hover {
                    background: #fee2e2 !important;
                    color: #ef4444 !important;
                }
                `}
            </style>
        </div>
    );
};

export default Chatbot;
