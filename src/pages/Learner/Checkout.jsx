import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronDown, ChevronUp, Tag, Shield, ShoppingCart, CheckCircle, AlertCircle, Receipt, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../../styles/Checkout.css';

const GST_RATE = 0.18;
const PLATFORM_FEE = 10.00;
const COUPONS = {
  DIVINE10:  { type: 'percent', value: 10,  label: '10% off' },
  SKILLUP20: { type: 'percent', value: 20,  label: '20% off for new learners' },
  SAVE500:   { type: 'flat',    value: 500, label: '₹500 off (orders above ₹2000)' },
};

const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StepBar = ({ step }) => (
  <div className="chk-steps">
    {['Review Order', 'Payment', 'Result'].map((s, i) => (
      <React.Fragment key={s}>
        <div className={`chk-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
          <div className="chk-step-dot">{step > i + 1 ? <CheckCircle size={14} /> : i + 1}</div>
          <span style={{fontWeight: step >= i + 1 ? 700 : 500}}>{s}</span>
        </div>
        {i < 2 && <div className={`chk-step-line ${step > i + 1 ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

const Section = ({ title, children, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="chk-section glass-panel"
  >
    <h3 className="chk-section-title">
        {Icon && <Icon size={22} style={{ color: 'var(--chk-primary)' }} strokeWidth={2.5} />}
        {title}
    </h3>
    {children}
  </motion.div>
);

const OrderSuccess = ({ name, navigate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="chk-success glass-panel"
    >
      <div className="chk-success-icon"><CheckCircle size={60} color="#10b981" /></div>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#0f172a' }}>Payment Successful!</h2>
      <p style={{ color: '#64748b', fontSize: '1.15rem', marginBottom: '2.5rem' }}>Awesome, <strong>{name}</strong>! Your transaction is verified and you are now enrolled.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <button className="chk-btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', maxWidth: '300px' }}>
           Go to Dashboard <ArrowRight size={18} />
        </button>
        <button className="chk-btn-text" onClick={() => navigate('/courses')}>
            Keep Browsing Courses
        </button>
      </div>
    </motion.div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(true);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}`);
        if (res.ok) {
            const data = await res.json();
            setCartItems(data);
            if (data.length === 0) navigate('/cart');
        }
    } catch (error) {
        console.error('Failed to fetch cart');
    } finally {
        setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  const gst = subtotal * GST_RATE;

  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    if (c.type === 'percent') couponDisc = subtotal * c.value / 100;
    else if (c.type === 'flat') {
      if (couponApplied === 'SAVE500' && subtotal < 2000) couponDisc = 0;
      else couponDisc = c.value;
    }
  }

  const billTotal = gst + PLATFORM_FEE;
  const total = subtotal + billTotal - couponDisc;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    if (!COUPONS[code]) { setCouponError('Invalid coupon code'); setCouponApplied(''); return; }
    if (code === 'SAVE500' && subtotal < 2000) { setCouponError('Minimum order ₹2000 required for SAVE500'); setCouponApplied(''); return; }
    setCouponApplied(code);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setCouponApplied('');
    setCouponCode('');
    setCouponError('');
  };

  const displayRazorpay = async () => {
      setIsProcessing(true);
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
      }

      try {
          // 0. Fetch Config
          const keyResponse = await fetch(`http://localhost:5000/api/cart/config/razorpay`);
          const { key } = await keyResponse.json();

          // 1. Create order
          const orderResponse = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: total })
          });

          if (!orderResponse.ok) throw new Error("Failed to create order");
          const orderData = await orderResponse.json();

          // 2. Open Razorpay Interface
          const options = {
              key: key,
              amount: orderData.amount,
              currency: orderData.currency,
              name: "EroSkillUp",
              description: "Course Enrollment Subscriptions",
              image: "https://your-logo-url.com/logo.png",
              order_id: orderData.id,
              handler: async function (response) {
                  setStep(2); // Move to validating step
                  const verifyRes = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}/verify-payment`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_signature: response.razorpay_signature
                      })
                  });
                  
                  if (verifyRes.ok) {
                      const data = await verifyRes.json();
                      toast.success('Payment Verified!');
                      if (data.enrolledCourses) {
                          const updatedUser = { ...user, enrolledCourses: data.enrolledCourses };
                          localStorage.setItem('user', JSON.stringify(updatedUser));
                          setUser(updatedUser);
                      }
                      setStep(3); // Result step
                  } else {
                      toast.error('Payment Verification Failed!');
                      setStep(1); // Back to review on failure
                  }
              },
              prefill: {
                  name: user.name,
                  email: user.email,
                  contact: "9999999999" // Dummy contact
              },
              theme: {
                  color: "#5c38ed"
              }
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();

          paymentObject.on('payment.failed', function (response){
                toast.error("Payment Cancelled or Failed");
                setIsProcessing(false);
          });
      } catch (err) {
          toast.error("An error occurred during checkout setup");
          console.error(err);
      } finally {
          setIsProcessing(false);
      }
  };

  if (loading) return (
    <div className="chk-page chk-loading">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner">
            <Zap size={32} color="#5c38ed" />
        </motion.div>
    </div>
  );

  return (
    <div className="chk-page">
      <div className="chk-hero-bg">
          <div className="chk-blob shape-1"></div>
          <div className="chk-blob shape-2"></div>
      </div>

      <div className="chk-container">
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="chk-header">
              <h1>Secure Checkout</h1>
              <p>Complete your purchase and start your learning journey.</p>
          </motion.div>
          
          <StepBar step={step} />

          {step === 3 ? (
             <OrderSuccess name={user.name} navigate={navigate} />
          ) : (
             <div className="chk-layout">
                <main>
                  <Section title="Account Details" icon={CheckCircle}>
                    <div className="chk-user-card">
                      <div className="chk-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                          <p className="chk-user-name">{user.name}</p>
                          <p className="chk-user-email">{user.email}</p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Review Your Courses" icon={ShoppingCart}>
                    <div className="chk-cart-items-preview">
                        {cartItems.map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={item._id} 
                                className="chk-preview-card"
                            >
                                <img src={item.thumbnail} alt={item.title} />
                                <div className="chk-preview-details">
                                    <h4>{item.title}</h4>
                                    <p>By {item.instructor || 'EroSkillUp Instructor'}</p>
                                </div>
                                <div className="chk-preview-price">
                                    ₹{fmt(item.price)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                  </Section>
                </main>

                <aside>
                   <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="chk-summary glass-panel"
                   >
                       <h3 className="chk-summary-title">Order Summary</h3>

                       <div className="chk-coupon-wrap">
                            <div className="chk-coupon-row">
                                <Tag size={16} color="#64748b" />
                                {couponApplied ? (
                                    <div className="coupon-applied-box">
                                        <span>{couponApplied} APPLIED</span>
                                        <button onClick={handleRemoveCoupon}>✕</button>
                                    </div>
                                ) : (
                                    <div className="coupon-input-box">
                                        <input 
                                            placeholder="Promo Code" 
                                            value={couponCode} 
                                            onChange={e => setCouponCode(e.target.value)} 
                                        />
                                        <button onClick={handleApplyCoupon}>Apply</button>
                                    </div>
                                )}
                            </div>
                            {couponError && <p className="chk-error-text">{couponError}</p>}
                       </div>

                       <div className="chk-price-rows">
                           <div className="chk-price-row">
                               <span>Subtotal</span>
                               <span>₹{fmt(subtotal)}</span>
                           </div>
                           
                           {couponDisc > 0 && (
                               <div className="chk-price-row discount-row">
                                   <span>Coupon Discount</span>
                                   <span>- ₹{fmt(couponDisc)}</span>
                               </div>
                           )}

                           <div className="chk-tax-container">
                               <button className="chk-tax-header" onClick={() => setShowBillDetails(!showBillDetails)}>
                                   <span>Taxes & Fees</span>
                                   <div className="chk-tax-right">
                                       <span>+ ₹{fmt(billTotal)}</span>
                                       {showBillDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                   </div>
                               </button>
                               <AnimatePresence>
                                   {showBillDetails && (
                                       <motion.div 
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: 'auto', opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           className="chk-tax-body"
                                       >
                                           <div className="chk-price-row text-sm">
                                               <span>GST (18%)</span>
                                               <span>₹{fmt(gst)}</span>
                                           </div>
                                           <div className="chk-price-row text-sm">
                                               <span>Platform Fee</span>
                                               <span>₹{fmt(PLATFORM_FEE)}</span>
                                           </div>
                                       </motion.div>
                                   )}
                               </AnimatePresence>
                           </div>

                           <div className="chk-total-divider"></div>
                           
                           <div className="chk-price-row total-row">
                               <span>Total Payable</span>
                               <span>₹{fmt(total)}</span>
                           </div>
                           
                           {couponDisc > 0 && (
                               <div className="chk-saving-badge">
                                   🎉 You save ₹{fmt(couponDisc)} today!
                               </div>
                           )}
                       </div>

                       <button 
                         className="chk-btn-primary play-btn" 
                         onClick={displayRazorpay} 
                         disabled={isProcessing}
                       >
                           {isProcessing ? (
                               <span><Zap size={18} className="spin-icon" /> Processing...</span>
                           ) : (
                               <span><Shield size={18} /> Pay with Razorpay</span>
                           )}
                       </button>

                       <p className="chk-secure-foot"><Lock size={12} /> SSL Secured & Encrypted Transaction by Razorpay</p>
                   </motion.div>
                </aside>
             </div>
          )}
      </div>
    </div>
  );
};

export default Checkout;
