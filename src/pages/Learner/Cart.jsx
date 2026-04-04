import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, AlertCircle, ShoppingCart, ArrowRight, ShieldCheck, Heart, Star, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showTaxDetails, setShowTaxDetails] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}`);
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (courseId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}/${courseId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Course removed from cart');
                const data = await res.json();
                setCartItems(data); 
            }
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleCheckoutClick = () => {
        if (cartItems.length > 0) {
            navigate('/checkout');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    };

    const subtotal = calculateSubtotal();
    const gst = subtotal * 0.18;
    const platformFee = 0;
    const totalPayable = subtotal + gst + platformFee;

    if (!user) {
        return (
            <div className="cart-page">
                <div className="cart-container" style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <h2 className="empty-title">Please log in to view your cart</h2>
                    <p className="empty-desc">Your learning journey is waiting for you. Log in to access your curated selection.</p>
                    <button onClick={() => navigate('/login')} className="explore-btn" style={{ border: 'none', cursor: 'pointer' }}>Login to Account</button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="cart-page">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );

    return (
        <div className="cart-page">
            <section className="cart-hero">
                <div className="cart-container">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="cart-title">My Learning Cart</h1>
                        <p className="cart-subtitle">
                            <ShoppingCart size={22} color="#4f46e5" />
                            Review your <strong>{cartItems.length} course{cartItems.length !== 1 ? 's' : ''}</strong> and complete your enrollment
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="cart-main-content">
                <div className="cart-container">
                    {cartItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="empty-cart-container"
                    >
                        <div className="empty-icon">
                            <ShoppingCart size={60} strokeWidth={1.5} />
                        </div>
                        <h2 className="empty-title">Your cart is feeling light</h2>
                        <p className="empty-desc">
                            Looks like you haven't discovered your next favorite course yet. Start exploring our world-class catalog today!
                        </p>
                        <Link to="/courses" className="explore-btn">
                            Explore All Courses <ArrowRight size={22} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="cart-content">
                        {/* Cart Items List */}
                        <div className="cart-items-list">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div 
                                        key={item._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                        layout
                                        className="cart-item-card"
                                    >
                                        <div className="cart-item-image">
                                            {item.thumbnail ? (
                                                 <img src={item.thumbnail} alt={item.title} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#f1f5f9' }}>📚</div>
                                            )}
                                        </div>
                                        <div className="cart-item-details">
                                            <div className="cart-item-header">
                                                <div>
                                                    <h3 className="cart-item-title">{item.title}</h3>
                                                    <p className="cart-item-instructor">By <span>{item.instructor}</span></p>
                                                </div>
                                                <div className="cart-item-price">
                                                    {item.price > 0 ? `₹${item.price}` : 'Free'}
                                                </div>
                                            </div>
                                            
                                            <div className="cart-item-footer">
                                                <div className="cart-item-tags">
                                                    <span className="tag tag-cat">{item.category}</span>
                                                    {item.rating && (
                                                        <span className="tag tag-rate">
                                                            <Star size={12} fill="#d97706" /> {item.rating}
                                                        </span>
                                                    )}
                                                    <span className="tag tag-best">Bestseller</span>
                                                </div>
                                                <div className="cart-item-actions">
                                                    <button 
                                                        className="btn-action btn-save"
                                                        onClick={() => toast('Saved to wishlist!', { icon: '❤️' })}
                                                    >
                                                        <Heart size={16} /> Save for Later
                                                    </button>
                                                    <button 
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="btn-action btn-remove"
                                                    >
                                                        <Trash2 size={16} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary Card */}
                        <div className="cart-summary-sticky">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="summary-card"
                            >
                                <h3 className="summary-title">Order Summary</h3>
                                
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                
                                <div className={`tax-box ${showTaxDetails ? 'active' : ''}`}>
                                    <button className="tax-header" onClick={() => setShowTaxDetails(!showTaxDetails)}>
                                        <span className="tax-title">Taxes & Fees</span>
                                        <div className="tax-right">
                                            <span className="tax-amount">+₹{gst.toFixed(2)}</span>
                                            {showTaxDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {showTaxDetails && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="tax-details"
                                            >
                                                <div className="tax-detail-row">
                                                    <span>GST (18%)</span>
                                                    <span>₹{gst.toFixed(2)}</span>
                                                </div>
                                                <div className="tax-detail-row">
                                                    <span>Platform Fee</span>
                                                    <span>₹{platformFee.toFixed(2)}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="summary-row total">
                                    <span>Total Payable</span>
                                    <span>₹{totalPayable.toFixed(2)}</span>
                                </div>
                                
                                <button className="checkout-btn" onClick={handleCheckoutClick}>
                                    Proceed to Payment <ArrowRight size={22} />
                                </button>

                                <div className="coupon-section">
                                    <div className="coupon-input-group">
                                        <input type="text" placeholder="Enter coupon code" />
                                        <button onClick={() => toast.error('Invalid coupon code')}>Apply</button>
                                    </div>
                                </div>

                                <div className="secure-info">
                                    <ShieldCheck size={18} color="#10b981" />
                                    <span>Secure 256-bit SSL encryption</span>
                                </div>
                                
                                <div className="payment-methods">
                                    <p>We Accept</p>
                                    <div className="method-icons">
                                        <div className="icon-placeholder"></div>
                                        <div className="icon-placeholder"></div>
                                        <div className="icon-placeholder"></div>
                                        <div className="icon-placeholder"></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
