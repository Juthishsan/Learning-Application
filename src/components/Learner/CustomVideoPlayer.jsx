import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RotateCcw, RotateCw, Check } from 'lucide-react';

const CustomVideoPlayer = ({ src, title, seekTo = 0, onTimeUpdate, onEnded }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // External Seek Handler
    useEffect(() => {
        if (videoRef.current && seekTo > 0) {
            videoRef.current.currentTime = seekTo;
            setCurrentTime(seekTo);
            if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    }, [seekTo]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            setCurrentTime(video.currentTime);
            if (onTimeUpdate) onTimeUpdate(video.currentTime);
        };
        const updateDuration = () => setDuration(video.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            if (onEnded) onEnded();
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onTimeUpdate, onEnded]);

    // Handle Source Change
    useEffect(() => {
        if(videoRef.current) {
            videoRef.current.load();
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [src]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (isMuted) {
            videoRef.current.volume = volume || 1;
            setIsMuted(false);
        } else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const changePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        videoRef.current.playbackRate = rate;
        setShowSpeedMenu(false);
    };

    const skipForward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
    };

    const skipBackward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                skipForward();
            } else if (e.key === 'ArrowLeft') {
                skipBackward();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div 
            ref={containerRef}
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%', 
                background: '#000', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                style={{ width: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onClick={togglePlay}
            />

            {/* Overlay Play Button (Big Center) */}
            {!isPlaying && (
                <div 
                    onClick={togglePlay}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
                >
                    <Play size={40} fill="white" color="white" style={{ marginLeft: '4px' }} />
                </div>
            )}

            {/* Controls Bar */}
            <div 
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.9))',
                    padding: '0 20px 15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    opacity: showControls || !isPlaying ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
                    paddingTop: '40px' // Initial space for gradient
                }}
            >
                {/* Progress Bar Container */}
                <div 
                    style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '6px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '3px', 
                        cursor: 'pointer',
                        marginBottom: '4px' 
                    }}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        if(videoRef.current) {
                            videoRef.current.currentTime = percent * duration;
                            setCurrentTime(percent * duration);
                        }
                    }}
                >
                    {/* Buffered/Loaded (Optional - not implemented but good for design) */}
                    
                    {/* Current Progress */}
                   <div 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            height: '100%', 
                            width: `${(currentTime / duration) * 100}%`, 
                            background: '#3b82f6', 
                            borderRadius: '3px',
                            transition: 'width 0.1s linear',
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                        }}
                   >
                        {/* Playhead Handle */}
                       <div style={{
                           position: 'absolute',
                           right: '-6px',
                           top: '50%',
                           transform: 'translateY(-50%)',
                           width: '12px',
                           height: '12px',
                           borderRadius: '50%',
                           background: '#fff',
                           boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                           transform: 'scale(1)', 
                           transition: 'transform 0.1s'
                       }}></div>
                   </div>
                   
                   <input 
                        type="range" 
                        min="0" 
                        max={duration || 0} 
                        value={currentTime} 
                        onChange={handleSeek}
                        style={{
                            position: 'absolute',
                            top: -10,
                            left: 0,
                            width: '100%',
                            height: '26px',
                            opacity: 0,
                            cursor: 'pointer',
                            margin: 0
                        }}
                   />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                    
                    {/* Left Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button onClick={skipBackward} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.9 }}>
                                <RotateCcw size={22} />
                                <span style={{ fontSize: '10px', position: 'absolute', transform: 'translate(6px, 6px)', fontWeight: 800 }}>10</span>
                            </button>
                            <button onClick={skipForward} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.9 }}>
                                <RotateCw size={22} />
                                <span style={{ fontSize: '10px', position: 'absolute', transform: 'translate(6px, 6px)', fontWeight: 800 }}>10</span>
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="volume-container">
                            <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={isMuted ? 0 : volume} 
                                onChange={handleVolumeChange}
                                style={{ width: '80px', accentColor: 'white', cursor: 'pointer', height: '4px' }}
                            />
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', opacity: 0.9 }}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                         {/* Settings (Visual Only) */}
                         <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, opacity: 0.9 }}>
                            <Settings size={20} />
                        </button>

                        {/* Playback Speed */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                style={{ 
                                    background: 'rgba(255,255,255,0.1)', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    color: 'white', 
                                    cursor: 'pointer', 
                                    fontSize: '12px', 
                                    fontWeight: 700, 
                                    padding: '4px 8px', 
                                    borderRadius: '4px',
                                    transition: 'all 0.2s' 
                                }}
                            >
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '45px', 
                                    right: '-10px', 
                                    background: 'rgba(15, 23, 42, 0.95)', 
                                    borderRadius: '8px', 
                                    padding: '6px', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    minWidth: '100px',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                                    zIndex: 20,
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                        <button 
                                            key={rate} 
                                            onClick={() => changePlaybackRate(rate)}
                                            style={{ 
                                                background: playbackRate === rate ? 'rgba(59, 130, 246, 0.2)' : 'transparent', 
                                                border: 'none', 
                                                color: playbackRate === rate ? '#60a5fa' : 'white', 
                                                padding: '8px 12px', 
                                                textAlign: 'left', 
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontWeight: playbackRate === rate ? 600 : 400
                                            }}
                                        >
                                           {rate}x {playbackRate === rate && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
