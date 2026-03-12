import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

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
                toast.success('Removed from cart');
                // Optimistically update
                setCartItems(prev => prev.filter(item => (item._id || item) !== courseId));
                // Or re-fetch to be safe if backend returns populated list
                const data = await res.json();
                setCartItems(data); 
            }
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleCheckoutClick = () => {
        if (cartItems.length > 0) {
            setShowCheckoutConfirm(true);
        }
    };

    const performCheckout = async () => {
        if (cartItems.length === 0) return;

        try {
            const res = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}/checkout`, {
                method: 'POST'
            });
            
            if (res.ok) {
                const data = await res.json();
                toast.success('Enrollment Successful!');
                setCartItems([]);
                setShowCheckoutConfirm(false);
                
                // Update local storage user enrolledCourses if passing data back
                if (data.enrolledCourses) {
                    const updatedUser = { ...user, enrolledCourses: data.enrolledCourses };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
                
                navigate('/dashboard');
            } else {
                toast.error('Checkout failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Checkout failed');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    };

    if (!user) {
        return (
            <div style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Please log in to view your cart</h2>
                <button onClick={() => navigate('/login')} className="btn primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Login</button>
            </div>
        );
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="loading-spinner"></div></div>;

    return (
        <div style={{ padding: '6rem 2rem', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    Shopping Cart
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
                    {cartItems.length} Course{cartItems.length !== 1 ? 's' : ''} in cart
                </p>

                {cartItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                    >
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#6366f1' }}>
                            <ShoppingCart size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Your cart is empty</h2>
                        <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                            Looks like you haven't added any courses yet. Explore our catalog to find your next learning adventure!
                        </p>
                        <button 
                            onClick={() => navigate('/courses')}
                            className="btn-primary-hover"
                            style={{ padding: '1rem 2.5rem', background: '#4f46e5', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Start Learning <ArrowRight size={20} />
                        </button>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(350px, 1fr)', gap: '3rem', alignItems: 'start' }}>
                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div 
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                        layout
                                        style={{ 
                                            display: 'flex', 
                                            gap: '1.5rem', 
                                            padding: '1.5rem', 
                                            background: 'white', 
                                            borderRadius: '20px', 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -2px rgba(0,0,0,0.02)', 
                                            border: '1px solid #f1f5f9',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        className="cart-card"
                                    >
                                        <div style={{ width: '180px', height: '110px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                                            {item.thumbnail ? (
                                                 <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📚</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, paddingRight: '1rem' }}>{item.title}</h3>
                                                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.5px' }}>
                                                        {item.price > 0 ? `₹${item.price}` : 'Free'}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.95rem', color: '#64748b' }}>By <span style={{ color: '#334155', fontWeight: 600 }}>{item.instructor}</span></p>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '50px', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0' }}>{item.category}</span>
                                                    {item.rating && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: '#fffbeb', borderRadius: '50px', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #fef3c7' }}>⭐ {item.rating}</span>}
                                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: '#ecfccb', borderRadius: '50px', color: '#166534', fontWeight: 600, border: '1px solid #d9f99d' }}>Bestseller</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button 
                                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, padding: '0.5rem', borderRadius: '8px', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        onMouseEnter={e => e.target.style.color = '#4f46e5'}
                                                        onMouseLeave={e => e.target.style.color = '#64748b'}
                                                    >
                                                        Save for Later
                                                    </button>
                                                    <button 
                                                        onClick={() => removeFromCart(item._id)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                                                        className="remove-btn"
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
                        <div style={{ height: 'fit-content' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01)', position: 'sticky', top: '100px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Order Summary</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem' }}>
                                        <span>Subtotal</span>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{calculateTotal()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem' }}>
                                        <span>Discount</span>
                                        <span style={{ fontWeight: 600, color: '#166534' }}>-₹0</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem' }}>
                                        <span>Tax</span>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>₹0</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                                    <span>Total</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                
                                <button 
                                    onClick={handleCheckoutClick}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1.1rem', 
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '14px', 
                                        fontWeight: 700, 
                                        cursor: 'pointer',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Proceed to Checkout <ArrowRight size={20} />
                                </button>

                                {/* Coupon Section */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                                        <input type="text" placeholder="Coupon Code" style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.5rem', outline: 'none', fontSize: '0.9rem' }} />
                                        <button style={{ padding: '0.5rem 1rem', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Apply</button>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <AlertCircle size={16} /> Secure Checkout
                                </p>
                                
                                <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>We accept</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', opacity: 0.7 }}>
                                        {/* Mock Cards - simple divs for placeholders */}
                                        <div style={{ width: '40px', height: '25px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                                        <div style={{ width: '40px', height: '25px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                                        <div style={{ width: '40px', height: '25px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <ConfirmModal
                isOpen={showCheckoutConfirm}
                onClose={() => setShowCheckoutConfirm(false)}
                onConfirm={performCheckout}
                title="Confirm Purchase"
                message={`Are you sure you want to purchase these ${cartItems.length} course(s) for ₹${calculateTotal()}?`}
                confirmText={`Pay ₹${calculateTotal()}`}
                cancelText="Cancel"
                isDestructive={false}
                icon={ShoppingCart}
            />

            <style jsx>{`
                @media (max-width: 900px) {
                    div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                }
                .cart-card:hover { transform: translateY(-3px) !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02) !important; }
                .remove-btn:hover { background: #fef2f2 !important; }
            `}</style>
        </div>
    );
};

export default Cart;
