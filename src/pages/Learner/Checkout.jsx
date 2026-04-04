import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronDown, ChevronUp, Tag, Truck, Shield, CreditCard, Smartphone, Home, CheckCircle, AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../../styles/Checkout.css';

// ── Constants ────────────────────────────────────────────────
const GST_RATE = 0.18; // 18% GST for digital services
const PLATFORM_FEE = 0.00; // No platform fee for learning
const COUPONS = {
  DIVINE10:  { type: 'percent', value: 10,  label: '10% off' },
  SKILLUP20: { type: 'percent', value: 20,  label: '20% off for new learners' },
  SAVE500:   { type: 'flat',    value: 500, label: '₹500 off (orders above ₹2000)' },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const validate = {
  card:    v => !/^\d{16}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 16-digit card number' : '',
  expiry:  v => !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? 'Format: MM/YY' : '',
  cvv:     v => !/^\d{3,4}$/.test(v) ? 'Enter 3 or 4 digit CVV' : '',
  upi:     v => !/^[\w.\-+]+@[\w]+$/.test(v.trim()) ? 'Enter a valid UPI ID (e.g. name@upi)' : '',
};

// ── Step indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="chk-steps">
    {['Payment', 'Confirm', 'Result'].map((s, i) => (
      <React.Fragment key={s}>
        <div className={`chk-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
          <div className="chk-step-dot">{step > i + 1 ? <CheckCircle size={14} /> : i + 1}</div>
          <span>{s}</span>
        </div>
        {i < 2 && <div className={`chk-step-line ${step > i + 1 ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, children, icon: Icon }) => (
  <div className="chk-section">
    <h3 className="chk-section-title">
        {Icon && <Icon size={20} style={{ color: 'var(--primary)' }} />}
        {title}
    </h3>
    {children}
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="chk-field">
    <label className="chk-label">{label}</label>
    {children}
    {error && <span className="chk-error"><AlertCircle size={12} /> {error}</span>}
  </div>
);

// ════════════════════════════════════════════════════════════
//  ORDER SUMMARY (right column)
// ════════════════════════════════════════════════════════════
const OrderSummary = ({ cartItems, couponCode, setCouponCode, couponApplied, setCouponApplied, couponError, setCouponError, paymentMethod }) => {
  const [open, setOpen] = useState(true);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [inputCode, setInputCode] = useState(couponCode);

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
    const code = inputCode.trim().toUpperCase();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    if (!COUPONS[code]) { setCouponError('Invalid coupon code'); setCouponApplied(''); return; }
    if (code === 'SAVE500' && subtotal < 2000) { setCouponError('Minimum order ₹2000 required for SAVE500'); setCouponApplied(''); return; }
    setCouponApplied(code);
    setCouponCode(code);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setCouponApplied('');
    setCouponCode('');
    setInputCode('');
    setCouponError('');
  };

  return (
    <div className="chk-summary">
      <div className="chk-summary-header" onClick={() => setOpen(o => !o)}>
        <span>{cartItems.length} Course{cartItems.length !== 1 ? 's' : ''} in Checkout</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      <AnimatePresence>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
          {/* Items */}
          <div className="chk-summary-items">
            {cartItems.map(item => (
              <div key={item._id} className="chk-sum-item">
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={item.thumbnail || 'https://via.placeholder.com/150'} alt={item.title} className="chk-sum-img"
                    onError={e => e.target.style.display = 'none'} />
                </div>
                <div className="chk-sum-info">
                  <p className="chk-sum-name">{item.title}</p>
                  <p className="chk-sum-cat">{item.category}</p>
                </div>
                <span className="chk-sum-price">₹{fmt(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="chk-coupon-wrap">
            <div className="chk-coupon-row">
              <Tag size={15} style={{ color: '#64748b' }} />
              {couponApplied ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span className="chk-coupon-tag">{couponApplied} applied ✓</span>
                  <button style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }} onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <>
                  <input className="chk-coupon-input" placeholder="Coupon Code"
                    value={inputCode} onChange={e => { setInputCode(e.target.value.toUpperCase()); setCouponError(''); }} />
                  <button className="chk-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                </>
              )}
            </div>
            {couponError && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '8px', fontWeight: 500 }}>{couponError}</p>}
            {!couponApplied && <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>Try: SKILLUP20 · DIVINE10</p>}
          </div>

          {/* Price rows */}
          <div className="chk-price-rows">
            <div className="chk-price-row">
              <span>Subtotal</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            {couponDisc > 0 && (
              <div className="chk-price-row green">
                <span>Coupon Discount ({couponApplied})</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}
            
            {/* COLLAPSIBLE BILL DETAILS */}
            <div className={`chk-bill-details`}>
              <div className="chk-bill-header" onClick={() => setShowBillDetails(!showBillDetails)}>
                <span>Taxes & Fees</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <span>+₹{fmt(billTotal)}</span>
                  {showBillDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
              
              {showBillDetails && (
                <div className="chk-bill-body">
                  <div className="chk-price-row">
                    <span style={{ fontSize: '0.85rem' }}>GST (18%)</span>
                    <span style={{ fontSize: '0.85rem' }}>₹{fmt(gst)}</span>
                  </div>
                  <div className="chk-price-row">
                    <span style={{ fontSize: '0.85rem' }}>Platform Fee</span>
                    <span style={{ fontSize: '0.85rem' }}>₹{fmt(PLATFORM_FEE)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="chk-confirm-divider" style={{ borderTop: '2px dashed #e2e8f0', margin: '15px 0' }} />
            <div className="chk-price-row total">
              <span>Total Payable</span>
              <span>₹{fmt(total)}</span>
            </div>
            {couponDisc > 0 && (
              <div className="chk-savings-tag">
                🎉 Saving ₹{fmt(couponDisc)} on your education!
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="chk-trust-row">
            <span><Shield size={14} /> Secure Payment</span>
            <span><Lock size={14} /> SSL Encryption</span>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 1 — PAYMENT SELECTION
// ════════════════════════════════════════════════════════════
const PaymentStep = ({ onNext, method, setMethod, card, setCard, upi, setUpi, net, setNet }) => {
  const [errors, setErrors] = useState({});

  const setC = (k, v) => {
    setCard(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const formatCardNum = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry  = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleNext = () => {
    const newErr = {};
    if (method === 'card') {
      const cardErr   = validate.card(card.number);
      const expiryErr = validate.expiry(card.expiry);
      const cvvErr    = validate.cvv(card.cvv);
      if (cardErr)   newErr.number = cardErr;
      if (expiryErr) newErr.expiry = expiryErr;
      if (cvvErr)    newErr.cvv    = cvvErr;
      if (!card.name.trim()) newErr.cardName = 'Cardholder name is required';
    } else if (method === 'upi') {
      const upiErr = validate.upi(upi);
      if (upiErr) newErr.upi = upiErr;
    } else if (method === 'netbanking') {
      if (!net) newErr.net = 'Please select a bank';
    }
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    onNext();
  };

  const PayMethod = ({ id, icon: Icon, label }) => (
    <button
      className={`chk-pay-method ${method === id ? 'active' : ''}`}
      onClick={() => { setMethod(id); setErrors({}); }}
    >
      <Icon size={24} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="chk-step-body">
      <Section title="Payment Method" icon={CreditCard}>
        <div className="chk-pay-methods">
          <PayMethod id="card"       icon={CreditCard}  label="Debit / Credit Card" />
          <PayMethod id="upi"        icon={Smartphone}  label="UPI Payment" />
          <PayMethod id="netbanking" icon={Home}        label="Net Banking" />
        </div>
      </Section>

      <AnimatePresence mode="wait">
      {/* CARD */}
      {method === 'card' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <Section title="Card Information">
          <div className="chk-card-preview">
            <div className="chk-card-chip" />
            <p className="chk-card-num-preview">{card.number || '•••• •••• •••• ••••'}</p>
            <div className="chk-card-bottom">
              <span>{card.name || 'USER NAME'}</span>
              <span>{card.expiry || 'MM/YY'}</span>
            </div>
          </div>
          <Field label="Card Number *" error={errors.number}>
            <input className={`chk-input ${errors.number ? 'error' : ''}`}
              placeholder="1234 5678 9012 3456" maxLength={19}
              value={card.number} onChange={e => setC('number', formatCardNum(e.target.value))} />
          </Field>
          <Field label="Cardholder Name *" error={errors.cardName}>
            <input className={`chk-input ${errors.cardName ? 'error' : ''}`}
              placeholder="Full name as on card" value={card.name}
              onChange={e => setC('name', e.target.value.toUpperCase())} />
          </Field>
          <div className="chk-grid-2">
            <Field label="Expiry Date *" error={errors.expiry}>
              <input className={`chk-input ${errors.expiry ? 'error' : ''}`}
                placeholder="MM/YY" maxLength={5}
                value={card.expiry} onChange={e => setC('expiry', formatExpiry(e.target.value))} />
            </Field>
            <Field label="CVV *" error={errors.cvv}>
              <input className={`chk-input ${errors.cvv ? 'error' : ''}`}
                placeholder="•••" maxLength={4} type="password"
                value={card.cvv} onChange={e => setC('cvv', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>
        </Section>
        </motion.div>
      )}

      {/* UPI */}
      {method === 'upi' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <Section title="UPI ID">
          <div className="chk-upi-apps">
            {[
              { id: 'GPay', logo: 'https://cdn.iconscout.com/icon/free/png-256/google-pay-2038779-1721670.png' },
              { id: 'PhonePe', logo: 'https://e7.pngegg.com/pngimages/332/615/png-clipart-phonepe-india-unified-payments-interface-india-purple-violet.png' },
              { id: 'Paytm', logo: 'https://cdn.iconscout.com/icon/free/png-256/paytm-226448.png' }
            ].map(app => (
              <button key={app.id} className="chk-upi-app-btn" onClick={() => setUpi(u => u || '@upi')}>
                <img src={app.logo} alt={app.id} style={{ height: '32px', objectFit: 'contain', marginBottom: '4px' }} />
                <span>{app.id}</span>
              </button>
            ))}
          </div>
          <Field label="Virtual Payment Address (VPA) *" error={errors.upi}>
            <input className={`chk-input ${errors.upi ? 'error' : ''}`}
              placeholder="username@upi" value={upi}
              onChange={e => { setUpi(e.target.value); if (errors.upi) setErrors(er => ({ ...er, upi: '' })); }} />
          </Field>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>A notification will be sent to your UPI app for authorization.</p>
        </Section>
        </motion.div>
      )}

      {/* NET BANKING */}
      {method === 'netbanking' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <Section title="Choose Your Bank">
          <div className="chk-bank-grid">
            {[
              { id: 'SBI', logo: 'https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png' },
              { id: 'HDFC', logo: 'https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-logo.png' },
              { id: 'ICICI', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3Yfl3u_FGS0L-sfnzW1kBeUqtwZnmAoztlg&s' },
              { id: 'Axis', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0t8puDMM1wnf7zYIbaG_DkKAhyDSLIh17UQ&s' }
            ].map(b => (
              <button key={b.id} className={`chk-bank-btn ${net === b.id ? 'active' : ''}`}
                onClick={() => { setNet(b.id); setErrors(e => ({ ...e, net: '' })); }}>
                <img src={b.logo} alt={b.id} style={{ height: '24px', objectFit: 'contain' }} />
                <span>{b.id} Bank</span>
              </button>
            ))}
          </div>
          {errors.net && <p className="chk-error" style={{marginTop:'8px'}}><AlertCircle size={12} /> {errors.net}</p>}
        </Section>
        </motion.div>
      )}
      </AnimatePresence>

      <button className="chk-next-btn" onClick={handleNext}>
        Review Secure Order →
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 2 — CONFIRM
// ════════════════════════════════════════════════════════════
const ConfirmStep = ({ user, cartItems, couponApplied, onBack, onPlace, isProcessing, paymentMethod }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  const gst = subtotal * GST_RATE;
  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    couponDisc = c.type === 'percent' ? subtotal * c.value / 100 : c.value;
  }
  const total = subtotal + gst + PLATFORM_FEE - couponDisc;

  return (
    <div className="chk-step-body">
      <Section title="Account Details" icon={CheckCircle}>
        <div className="chk-confirm-box">
          <p style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>{user.name}</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>✉️ {user.email}</p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>Courses will be added to your profile immediately after payment.</p>
        </div>
      </Section>

      <Section title="Enrollment Summary" icon={ShoppingCart}>
        {cartItems.map(item => (
          <div key={item._id} className="chk-confirm-item">
            <span>{item.title}</span>
            <span>₹{fmt(item.price)}</span>
          </div>
        ))}
        <div className="chk-confirm-row total">
            <span>Total to Pay</span>
            <span>₹{fmt(total)}</span>
        </div>
      </Section>

      <div className="chk-btn-row">
        <button className="chk-back-btn" onClick={onBack} disabled={isProcessing}>← Change Payment</button>
        <button className="chk-place-btn" onClick={onPlace} disabled={isProcessing} style={{ background: 'var(--primary)' }}>
          <Lock size={16} /> {isProcessing ? 'Processing Enrollment...' : `Secure Enroll · ₹${fmt(total)}`}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  RESULT SUCCESS
// ════════════════════════════════════════════════════════════
const OrderSuccess = ({ name, navigate }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="chk-success">
      <div className="chk-success-icon">🏆</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Enrollment Confirmed!</h2>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>Congratulations, <strong>{name}</strong>! Your courses are now available in your dashboard.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="chk-next-btn" onClick={() => navigate('/dashboard')}>
           Go to My Learning Dashboard
        </button>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/courses')}>
            Keep Browsing Courses
        </button>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN Checkout Component
// ════════════════════════════════════════════════════════════
const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [step,          setStep]          = useState(1);
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError,   setCouponError]   = useState('');
  const [placed,        setPlaced]        = useState(false);
  const [isProcessing,  setIsProcessing]  = useState(false);

  // Payment states
  const [method, setMethod] = useState('card');
  const [card,   setCard]   = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi,    setUpi]    = useState('');
  const [net,    setNet]    = useState('');

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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate payment gateway delay
    await new Promise(r => setTimeout(r, 1500));

    try {
        const res = await fetch(`http://localhost:5000/api/cart/${user.id || user._id}/checkout`, {
            method: 'POST'
        });
        
        if (res.ok) {
            const data = await res.json();
            toast.success('Course Access Granted!');
            
            // Update local user data
            if (data.enrolledCourses) {
                const updatedUser = { ...user, enrolledCourses: data.enrolledCourses };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
            
            setPlaced(true);
        } else {
            toast.error('Payment verification failed. Please try again.');
        }
    } catch (error) {
        toast.error('Network error. Check your connection.');
    } finally {
        setIsProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Securing checkout environment...</p>
    </div>
  );

  if (placed) return (
     <div className="chk-page">
        <OrderSuccess name={user.name} navigate={navigate} />
     </div>
  );

  return (
    <div className="chk-page">
      <StepBar step={step} />

      <div className="chk-layout">
        <main style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <PaymentStep
                onNext={() => setStep(2)}
                method={method} setMethod={setMethod}
                card={card} setCard={setCard}
                upi={upi} setUpi={setUpi}
                net={net} setNet={setNet}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ConfirmStep
                user={user}
                cartItems={cartItems}
                couponApplied={couponApplied}
                onBack={() => setStep(1)}
                onPlace={handlePlaceOrder}
                isProcessing={isProcessing}
                paymentMethod={method}
              />
            </motion.div>
          )}
          </AnimatePresence>
        </main>

        <aside className="chk-right">
          <OrderSummary
            cartItems={cartItems}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
            couponError={couponError}
            setCouponError={setCouponError}
            paymentMethod={method}
          />
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
