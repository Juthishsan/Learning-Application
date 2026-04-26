import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, Heart, Star, ChevronDown, ChevronUp, Tag, Receipt, CreditCard } from 'lucide-react';
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

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
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <h1 className="cart-title">My Learning Cart</h1>
                        <p className="cart-subtitle">
                            <ShoppingCart size={20} strokeWidth={2.5} color="#5c38ed" />
                            Review your <strong>{cartItems.length} course{cartItems.length !== 1 ? 's' : ''}</strong>
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="cart-main-content">
                <div className="cart-container">
                    {cartItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="empty-cart-container"
                    >
                        <div className="empty-icon-wrap">
                            <div className="empty-icon-bg"></div>
                            <div className="empty-icon">
                                <ShoppingCart size={65} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="empty-title">Your cart feels light</h2>
                        <p className="empty-desc">
                            Discover new skills and elevate your career. Explore our premium courses and start learning today.
                        </p>
                        <Link to="/courses" className="explore-btn">
                            Explore Courses <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="cart-content">
                        {/* Cart Items List */}
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="cart-items-list"
                        >
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div 
                                        key={item._id}
                                        variants={itemVariants}
                                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
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
                                                <div className="cart-item-price-wrapper">
                                                    <div className={`cart-item-price ${item.price === 0 ? 'free' : ''}`}>
                                                        {item.price > 0 ? `₹${item.price}` : 'Free'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="cart-item-footer">
                                                <div className="cart-item-tags">
                                                    <span className="tag tag-cat">{item.category || "Development"}</span>
                                                    {item.rating && (
                                                        <span className="tag tag-rate">
                                                            <Star size={12} fill="currentColor" /> {item.rating}
                                                        </span>
                                                    )}
                                                    <span className="tag tag-best">Bestseller</span>
                                                </div>
                                                <div className="cart-item-actions">
                                                    <button 
                                                        className="action-btn-icon save"
                                                        onClick={() => toast('Saved to wishlist!', { icon: '❤️' })}
                                                        title="Save for Later"
                                                    >
                                                        <Heart size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="action-btn-icon remove"
                                                        title="Remove from Cart"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Summary Card */}
                        <div className="cart-summary-sticky">
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="summary-card"
                            >
                                <h3 className="summary-title">
                                    <Receipt size={24} color="#5c38ed" />
                                    Order Summary
                                </h3>
                                
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                
                                <div className="tax-box">
                                    <button className="tax-header" onClick={() => setShowTaxDetails(!showTaxDetails)}>
                                        <span className="tax-title">
                                            <Tag size={16} /> Taxes & Fees
                                        </span>
                                        <div className="tax-right">
                                            <span>+₹{gst.toFixed(2)}</span>
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
                                    <span>Total</span>
                                    <span>₹{totalPayable.toFixed(2)}</span>
                                </div>
                                
                                <button className="checkout-btn" onClick={handleCheckoutClick}>
                                    Checkout <ArrowRight size={20} />
                                </button>

                                <div className="coupon-section">
                                    <div className="coupon-input-group">
                                        <input type="text" placeholder="Promo code" />
                                        <button onClick={() => toast.error('Invalid code')}>Apply</button>
                                    </div>
                                </div>

                                <div className="secure-info">
                                    <ShieldCheck size={18} strokeWidth={2.5} />
                                    <span>Guaranteed Safe & Secure Checkout</span>
                                </div>
                                
                                <div className="payment-methods">
                                    <p>Supported Payments</p>
                                    <div className="method-icons">
                                        <div className="icon-placeholder" title="Credit Card"><CreditCard size={20} /></div>
                                        <div className="icon-placeholder" style={{fontSize: '0.8rem', fontWeight: 700}}>UPI</div>
                                        <div className="icon-placeholder" style={{fontSize: '0.8rem', fontWeight: 700}}>NET</div>
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
