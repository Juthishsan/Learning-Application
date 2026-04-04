import React, { useState } from 'react';
import { Star, Camera, ThumbsUp, ChevronRight, X, Image as ImageIcon, Send, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseReviews = ({ courseId, reviews = [], rating = 0, numReviews = 0, onReviewAdded }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const ratingsCount = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        const percentage = numReviews > 0 ? (count / numReviews) * 100 : 0;
        return { star, count, percentage };
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        setImages([...images, ...files]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            toast.error('Please login to post a review');
            return;
        }

        if (newRating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        const user = JSON.parse(storedUser);
        setSubmitting(true);

        const formData = new FormData();
        formData.append('rating', newRating);
        formData.append('comment', comment);
        formData.append('userId', user.id || user._id);
        formData.append('userName', user.name);
        images.forEach(image => {
            formData.append('images', image);
        });

        try {
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}/reviews`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success('Review posted successfully!');
                setNewRating(0);
                setComment('');
                setImages([]);
                setImagePreviews([]);
                setShowReviewForm(false);
                if (onReviewAdded) onReviewAdded();
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Failed to post review');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    // Review Images Gallery (all images from all reviews)
    const allReviewImages = reviews.reduce((acc, r) => [...acc, ...(r.images || [])], []);

    return (
        <div style={{ marginTop: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Learner Reviews</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 350px) 1fr', gap: '4rem', marginBottom: '4rem' }}>
                {/* Left: Rating Summary */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                    key={s} 
                                    size={24} 
                                    fill={s <= Math.round(rating) ? "#fbbf24" : "none"} 
                                    stroke={s <= Math.round(rating) ? "#fbbf24" : "#cbd5e1"} 
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{rating.toFixed(1)} out of 5</span>
                    </div>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>{numReviews} global ratings</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ratingsCount.map(({ star, count, percentage }) => (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#64748b', width: '45px', fontWeight: 600 }}>{star} star</span>
                                <div style={{ flex: 1, height: '20px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${percentage}%`, 
                                        height: '100%', 
                                        background: percentage > 0 ? '#fbbf24' : '#f1f5f9',
                                        transition: 'width 0.5s ease-out'
                                    }}></div>
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#64748b', width: '35px', textAlign: 'right' }}>{Math.round(percentage)}%</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '2rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Review this course</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Share your thoughts with other learners</p>
                        <button 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem', 
                                border: '1px solid #cbd5e1', background: 'white', 
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseOut={(e) => e.target.style.background = 'white'}
                        >
                            Write a review
                        </button>
                    </div>
                </div>

                {/* Right: Images and Content */}
                <div>
                    {allReviewImages.length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reviews with images</h3>
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                                {allReviewImages.map((img, i) => (
                                    <img 
                                        key={i} 
                                        src={img} 
                                        alt={`Review image ${i}`} 
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, cursor: 'pointer', border: '1px solid #e2e8f0' }} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {showReviewForm && (
                        <form className="card" onSubmit={handleSubmitReview} style={{ padding: '2rem', marginBottom: '3rem', borderRadius: '1rem', border: '2px solid #6366f1', background: 'rgba(99, 102, 241, 0.02)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Send size={20} color="#6366f1" /> Submit your review
                            </h3>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Overall rating</p>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star 
                                            key={s} 
                                            size={32} 
                                            className="star-input"
                                            fill={s <= newRating ? "#fbbf24" : "none"} 
                                            stroke={s <= newRating ? "#fbbf24" : "#cbd5e1"} 
                                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                            onClick={() => setNewRating(s)}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Add a written review</p>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike? How was the teaching quality?"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Add photos</p>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <label style={{ width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', background: 'white' }}>
                                            <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                            <Camera size={24} />
                                            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Add</span>
                                        </label>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Upload up to 5 images (JPG, PNG)</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', background: '#6366f1', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowReviewForm(false)}
                                    style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', background: '#f1f5f9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {reviews.length > 0 ? (
                            reviews.map((review, i) => (
                                <div key={i} className="review-card" style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#475569' }}>
                                            {review.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, color: '#0f172a' }}>{review.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex' }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={16} fill={s <= review.rating ? "#fbbf24" : "none"} stroke={s <= review.rating ? "#fbbf24" : "#cbd5e1"} />
                                            ))}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verified Purchase</span>
                                    </div>

                                    <p style={{ color: '#334155', lineHeight: '1.6', marginBottom: '1.5rem' }}>{review.comment}</p>
                                    
                                    {review.images && review.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            {review.images.map((img, idx) => (
                                                <img key={idx} src={img} alt="Review" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in' }} />
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                            <ThumbsUp size={14} /> Helpful
                                        </button>
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer' }}>Report</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem' }}>
                                <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No reviews yet. Be the first to review this course!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style sx>{`
                .star-input:hover { transform: scale(1.1); }
                .review-card:hover { background: #fcfdfe; transition: background 0.3s; }
            `}</style>
        </div>
    );
};

export default CourseReviews;
