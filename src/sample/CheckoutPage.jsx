import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiLock, FiChevronDown, FiChevronUp, FiTag, FiTruck, FiShield, FiCreditCard, FiSmartphone, FiHome, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import emailjs from '@emailjs/browser';
import '../styles/CheckoutPage.css';

// ── GST rate ──────────────────────────────────────────────────
const GST_RATE = 0.05; // 5%
const PLATFORM_FEE = 5.00; // Flat ₹5 platform fee
const COD_CHARGE = 30.00; // Extra charge for COD
const COUPONS = {
  DIVINE10:  { type: 'percent', value: 10,  label: '10% off' },
  FIRST50:   { type: 'flat',    value: 50,  label: '₹50 off' },
  SAVE100:   { type: 'flat',    value: 100, label: '₹100 off (orders above ₹999)' },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const validate = {
  name:    v => !v.trim() ? 'Full name is required' : v.trim().length < 2 ? 'Enter a valid name' : '',
  email:   v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email' : '',
  phone:   v => !/^[6-9]\d{9}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 10-digit mobile number' : '',
  pincode: v => !/^\d{6}$/.test(v.trim()) ? 'Enter a valid 6-digit pincode' : '',
  door:    v => !v.trim() ? 'Door / flat number is required' : '',
  street:  v => !v.trim() ? 'Street / area is required' : '',
  city:    v => !v.trim() ? 'City is required' : '',
  state:   v => !v.trim() ? 'State is required' : '',
  card:    v => !/^\d{16}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 16-digit card number' : '',
  expiry:  v => !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? 'Format: MM/YY' : '',
  cvv:     v => !/^\d{3,4}$/.test(v) ? 'Enter 3 or 4 digit CVV' : '',
  upi:     v => !/^[\w.\-+]+@[\w]+$/.test(v.trim()) ? 'Enter a valid UPI ID (e.g. name@upi)' : '',
};

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'];

// ── Step indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="chk-steps">
    {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
      <React.Fragment key={s}>
        <div className={`chk-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
          <div className="chk-step-dot">{step > i + 1 ? <FiCheckCircle size={14} /> : i + 1}</div>
          <span>{s}</span>
        </div>
        {i < 2 && <div className={`chk-step-line ${step > i + 1 ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="chk-section">
    <h3 className="chk-section-title">{title}</h3>
    {children}
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="chk-field">
    <label className="chk-label">{label}</label>
    {children}
    {error && <span className="chk-error"><FiAlertCircle size={12} /> {error}</span>}
  </div>
);

// ════════════════════════════════════════════════════════════
//  ORDER SUMMARY (right column)
// ════════════════════════════════════════════════════════════
const OrderSummary = ({ cartItems, couponCode, setCouponCode, couponApplied, setCouponApplied, couponError, setCouponError, paymentMethod }) => {
  const [open, setOpen] = useState(true);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [inputCode, setInputCode] = useState(couponCode);

  const subtotal  = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const savings   = cartItems.reduce((s, i) => s + ((i.originalPrice ?? i.price) - i.price) * (i.quantity || 1), 0);
  const delivery  = subtotal >= 499 ? 0 : 49;
  const gst       = subtotal * GST_RATE;

  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    if (c.type === 'percent') couponDisc = subtotal * c.value / 100;
    else if (c.type === 'flat') {
      if (couponApplied === 'SAVE100' && subtotal < 999) couponDisc = 0;
      else couponDisc = c.value;
    }
  }

  const codFee    = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const billTotal = delivery + gst + PLATFORM_FEE + codFee;
  const total = subtotal + billTotal - couponDisc;

  const handleApplyCoupon = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    if (!COUPONS[code]) { setCouponError('Invalid coupon code'); setCouponApplied(''); return; }
    if (code === 'SAVE100' && subtotal < 999) { setCouponError('Minimum order ₹999 required for SAVE100'); setCouponApplied(''); return; }
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
        <span>Order Summary ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
        {open ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </div>

      {open && (
        <>
          {/* Items */}
          <div className="chk-summary-items">
            {cartItems.map(item => (
              <div key={item.uniqueId} className="chk-sum-item">
                <div className="chk-sum-img-wrap">
                  <img src={item.image} alt={item.name} className="chk-sum-img"
                    onError={e => e.target.style.display = 'none'} />
                  <span className="chk-sum-qty">{item.quantity || 1}</span>
                </div>
                <div className="chk-sum-info">
                  <p className="chk-sum-name">{item.name} - {item.unit}</p>
                  <p className="chk-sum-cat">{item.category}</p>
                </div>
                <span className="chk-sum-price">₹{fmt(item.price * (item.quantity || 1))}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="chk-coupon-wrap">
            <div className="chk-coupon-row">
              <FiTag size={15} />
              {couponApplied ? (
                <div className="chk-coupon-applied">
                  <span className="chk-coupon-tag">{couponApplied} applied ✓</span>
                  <button className="chk-coupon-remove" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <>
                  <input className="chk-coupon-input" placeholder="Enter coupon code"
                    value={inputCode} onChange={e => { setInputCode(e.target.value.toUpperCase()); setCouponError(''); }} />
                  <button className="chk-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                </>
              )}
            </div>
            {couponError && <p className="chk-coupon-error">{couponError}</p>}
            <p className="chk-coupon-hint">Try: DIVINE10 · FIRST50 · SAVE100</p>
          </div>

          {/* Price rows */}
          <div className="chk-price-rows">
            <div className="chk-price-row">
              <span>Subtotal ({cartItems.reduce((n, i) => n + (i.quantity || 1), 0)} items)</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="chk-price-row green">
                <span>Product Discount</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            {couponDisc > 0 && (
              <div className="chk-price-row green">
                <span>Coupon ({couponApplied})</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}
            <div className="chk-price-row">
              <span>Item Total ({cartItems.reduce((n, i) => n + (i.quantity || 1), 0)} items)</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="chk-price-row green">
                <span>Direct Savings</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            {couponDisc > 0 && (
              <div className="chk-price-row green">
                <span>Coupon Discount ({couponApplied})</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}
            
            {/* COLLAPSIBLE BILL DETAILS */}
            <div className={`chk-bill-details ${showBillDetails ? 'active' : ''}`}>
              <div className="chk-bill-header" onClick={() => setShowBillDetails(!showBillDetails)}>
                <span>Taxes & Extra Charges</span>
                <div className="chk-bill-summary-right">
                  <span>+₹{fmt(billTotal)}</span>
                  {showBillDetails ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </div>
              </div>
              
              {showBillDetails && (
                <div className="chk-bill-body">
                  <div className="chk-price-row small">
                    <span>Delivery Fee</span>
                    <span>{delivery === 0 ? <span className="chk-free">FREE</span> : `₹${fmt(delivery)}`}</span>
                  </div>
                  <div className="chk-price-row small">
                    <span>GST (5%)</span>
                    <span>₹{fmt(gst)}</span>
                  </div>
                  <div className="chk-price-row small">
                    <span>Platform Fee</span>
                    <span>₹{fmt(PLATFORM_FEE)}</span>
                  </div>
                  {codFee > 0 && (
                    <div className="chk-price-row small">
                      <span>COD Handling Fee</span>
                      <span>₹{fmt(codFee)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="chk-price-divider" />
            <div className="chk-price-row total">
              <span>Total Payable</span>
              <span>₹{fmt(total)}</span>
            </div>
            {(savings + couponDisc) > 0 && (
              <div className="chk-savings-tag">
                🎉 You're saving ₹{fmt(savings + couponDisc)} on this order!
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="chk-trust-row">
            <span><FiShield size={14} /> Secure Payment</span>
            <span><FiTruck size={14} /> Fast Delivery</span>
            <span><FiLock size={14} /> Safe & Private</span>
          </div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 1 — DELIVERY DETAILS
// ════════════════════════════════════════════════════════════
const DeliveryStep = ({ data, setData, onNext }) => {
  const [errors, setErrors] = useState({});

  // Pre-fill from localStorage if logged in
  useEffect(() => {
    const name  = localStorage.getItem('divine_customer_name')  || '';
    const email = localStorage.getItem('divine_customer_email') || '';
    setData(d => ({
      ...d,
      name:  d.name  || name,
      email: d.email || email,
    }));
  }, []);

  const set = (k, v) => {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleNext = () => {
    const fields = ['name', 'email', 'phone', 'door', 'street', 'city', 'state', 'pincode'];
    const newErr = {};
    fields.forEach(f => {
      const err = validate[f]?.(data[f] || '');
      if (err) newErr[f] = err;
    });
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    onNext();
  };

  const inp = (k, props = {}) => (
    <input
      className={`chk-input ${errors[k] ? 'error' : ''}`}
      value={data[k] || ''}
      onChange={e => set(k, e.target.value)}
      {...props}
    />
  );

  return (
    <div className="chk-step-body">
      <Section title="Contact Information">
        <div className="chk-grid-2">
          <Field label="Full Name *" error={errors.name}>
            {inp('name', { placeholder: 'Ramesh Kumar' })}
          </Field>
          <Field label="Email Address *" error={errors.email}>
            {inp('email', { type: 'email', placeholder: 'you@email.com' })}
          </Field>
        </div>
        <Field label="Mobile Number *" error={errors.phone}>
          {inp('phone', { type: 'tel', placeholder: '9876543210', maxLength: 10 })}
        </Field>
      </Section>

      <Section title="Delivery Address">
        <Field label="Door / Flat Number *" error={errors.door}>
          {inp('door', { placeholder: 'No. 12, 3rd Floor' })}
        </Field>
        <Field label="Street / Area / Landmark *" error={errors.street}>
          {inp('street', { placeholder: 'Anna Nagar, Near Park' })}
        </Field>
        <div className="chk-grid-2">
          <Field label="City *" error={errors.city}>
            {inp('city', { placeholder: 'Chennai' })}
          </Field>
          <Field label="Pincode *" error={errors.pincode}>
            {inp('pincode', { placeholder: '600001', maxLength: 6 })}
          </Field>
        </div>
        <Field label="State *" error={errors.state}>
          <select
            className={`chk-input ${errors.state ? 'error' : ''}`}
            value={data.state || ''}
            onChange={e => set('state', e.target.value)}
          >
            <option value="">Select State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </Section>

      <button className="chk-next-btn" onClick={handleNext}>
        Continue to Payment →
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 2 — PAYMENT
// ════════════════════════════════════════════════════════════
const PaymentStep = ({ onNext, onBack, method, setMethod, card, setCard, upi, setUpi, net, setNet }) => {
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

  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank'];

  const PayMethod = ({ id, icon, label }) => (
    <button
      className={`chk-pay-method ${method === id ? 'active' : ''}`}
      onClick={() => { setMethod(id); setErrors({}); }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="chk-step-body">
      <Section title="Select Payment Method">
        <div className="chk-pay-methods">
          <PayMethod id="card"       icon={<FiCreditCard size={18} />}  label="Card" />
          <PayMethod id="upi"        icon={<FiSmartphone size={18} />}  label="UPI" />
          <PayMethod id="netbanking" icon={<FiHome size={18} />}   label="Net Banking" />
          <PayMethod id="wallet"     icon={<FiCreditCard size={18} />}      label="Wallet" />
          <PayMethod id="cod"        icon={<FiTruck size={18} />}       label="Cash on Delivery" />
        </div>
      </Section>

      {/* CARD */}
      {method === 'card' && (
        <Section title="Card Details">
          <div className="chk-card-preview">
            <div className="chk-card-chip" />
            <p className="chk-card-num-preview">{card.number || '•••• •••• •••• ••••'}</p>
            <div className="chk-card-bottom">
              <span>{card.name || 'CARDHOLDER NAME'}</span>
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
              placeholder="As on card" value={card.name}
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
          <div className="chk-card-types">
            <span className="chk-card-type visa">VISA</span>
            <span className="chk-card-type mc">MC</span>
            <span className="chk-card-type rupay">RuPay</span>
            <span className="chk-card-type amex">AMEX</span>
          </div>
        </Section>
      )}

      {/* UPI */}
      {method === 'upi' && (
        <Section title="UPI Payment">
          <div className="chk-upi-apps">
            {[
              { id: 'GPay', logo: 'https://cdn.iconscout.com/icon/free/png-256/google-pay-2038779-1721670.png' },
              { id: 'PhonePe', logo: 'https://e7.pngegg.com/pngimages/332/615/png-clipart-phonepe-india-unified-payments-interface-india-purple-violet.png' },
              { id: 'Paytm', logo: 'https://cdn.iconscout.com/icon/free/png-256/paytm-226448.png' },
              { id: 'BHIM', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/bhim-upi-icon.png' }
            ].map(app => (
              <button key={app.id} className="chk-upi-app-btn">
                <img src={app.logo} alt={app.id} style={{ height: '32px', objectFit: 'contain', marginBottom: '4px' }} />
                <span>{app.id}</span>
              </button>
            ))}
          </div>
          <Field label="UPI ID *" error={errors.upi}>
            <input className={`chk-input ${errors.upi ? 'error' : ''}`}
              placeholder="yourname@upi" value={upi}
              onChange={e => { setUpi(e.target.value); if (errors.upi) setErrors(er => ({ ...er, upi: '' })); }} />
          </Field>
          <p className="chk-upi-note">Enter your UPI ID and a payment request will be sent to your UPI app</p>
        </Section>
      )}

      {/* NET BANKING */}
      {method === 'netbanking' && (
        <Section title="Select Your Bank">
          <div className="chk-bank-grid">
            {[
              { id: 'State Bank of India', logo: 'https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png' },
              { id: 'HDFC Bank', logo: 'https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-logo.png' },
              { id: 'ICICI Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3Yfl3u_FGS0L-sfnzW1kBeUqtwZnmAoztlg&s' },
              { id: 'Axis Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0t8puDMM1wnf7zYIbaG_DkKAhyDSLIh17UQ&s' },
              { id: 'Kotak Mahindra Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2PNtBWtngsAJBiNuJ4Jzg5cC_LM3RRATuNQ&s' },
              { id: 'Bank of Baroda', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBiBkDnKwaGRjh6dTFoCnMY_jwXWjqRAthtg&s' },
              { id: 'Punjab National Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOI4FaM2MMnDk1UbN0fsacHcypzTZHL69ftQ&s' },
              { id: 'Canara Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUqCFKNrB9QcT5gRTxDO0P1F2WuT9OlF9oIw&s' }
            ].map(b => (
              <button key={b.id} className={`chk-bank-btn ${net === b.id ? 'active' : ''}`}
                onClick={() => { setNet(b.id); setErrors(e => ({ ...e, net: '' })); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src={b.logo} alt={b.id} style={{ height: '30px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{b.id}</span>
              </button>
            ))}
          </div>
          {errors.net && <p className="chk-error" style={{marginTop:'8px'}}><FiAlertCircle size={12} /> {errors.net}</p>}
        </Section>
      )}

      {/* WALLET */}
      {method === 'wallet' && (
        <Section title="Select Wallet">
          <div className="chk-bank-grid">
            {[
              { id: 'Paytm Wallet', logo: 'https://cdn.iconscout.com/icon/free/png-256/paytm-226448.png' },
              { id: 'Amazon Pay', logo: 'https://www.vectorlogo.zone/logos/amazon/amazon-icon.svg' },
              { id: 'Mobikwik', logo: 'https://download.logo.wine/logo/MobiKwik/MobiKwik-Logo.wine.png' },
              { id: 'Freecharge', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/FreeCharge_Logo.png' },
              { id: 'Airtel Money', logo: 'https://www.vhv.rs/dpng/d/422-4221364_send-cash-to-ghana-airtel-logo-new-hd.png' },
              { id: 'JioMoney', logo: 'https://www.drupal.org/files/project-images/logo_138.png' }
            ].map(w => (
              <button key={w.id} className={`chk-bank-btn ${net === w.id ? 'active' : ''}`}
                onClick={() => setNet(w.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src={w.logo} alt={w.id} style={{ height: '32px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{w.id}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* COD */}
      {method === 'cod' && (
        <Section title="Cash on Delivery">
          <div className="chk-cod-info">
            <p>💰 Pay in cash when your order arrives at your doorstep.</p>
            <p>Note: COD is available for orders up to ₹5,000.</p>
          </div>
        </Section>
      )}

      <div className="chk-btn-row">
        <button className="chk-back-btn" onClick={onBack}>← Back</button>
        <button className="chk-next-btn" onClick={handleNext}>Review Order →</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  STEP 3 — CONFIRM
// ════════════════════════════════════════════════════════════
const ConfirmStep = ({ delivery, cartItems, couponApplied, onBack, onPlace, isProcessing, paymentMethod }) => {
  const subtotal   = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const savings    = cartItems.reduce((s, i) => s + ((i.originalPrice ?? i.price) - i.price) * (i.quantity || 1), 0);
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const gst        = subtotal * GST_RATE;
  let couponDisc   = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    couponDisc = c.type === 'percent' ? subtotal * c.value / 100 : c.value;
  }
  const codFee      = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const billTotal = deliveryFee + gst + PLATFORM_FEE + codFee;
  const total = subtotal + billTotal - couponDisc;

  return (
    <div className="chk-step-body">
      <Section title="Delivery Address">
        <div className="chk-confirm-box">
          <p className="chk-confirm-name">{delivery.name}</p>
          <p>{delivery.door}, {delivery.street}</p>
          <p>{delivery.city} — {delivery.pincode}</p>
          <p>{delivery.state}</p>
          <p>📱 {delivery.phone} &nbsp;|&nbsp; ✉️ {delivery.email}</p>
        </div>
      </Section>

      <Section title="Order Items">
        {cartItems.map(item => (
          <div key={item.uniqueId} className="chk-confirm-item">
            <span>{item.name} ({item.unit}) × {item.quantity || 1}</span>
            <span>₹{fmt(item.price * (item.quantity || 1))}</span>
          </div>
        ))}
      </Section>

      <Section title="Price Breakdown">
        <div className="chk-confirm-box">
          <div className="chk-confirm-row"><span>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
          {savings > 0 && <div className="chk-confirm-row green"><span>Product Discount</span><span>−₹{fmt(savings)}</span></div>}
          {couponDisc > 0 && <div className="chk-confirm-row green"><span>Coupon ({couponApplied})</span><span>−₹{fmt(couponDisc)}</span></div>}
          <div className="chk-confirm-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
          <div className="chk-confirm-row"><span>GST (5%)</span><span>+₹{fmt(gst)}</span></div>
          <div className="chk-confirm-row"><span>Platform Fee</span><span>+₹{fmt(PLATFORM_FEE)}</span></div>
          {codFee > 0 && <div className="chk-confirm-row"><span>COD Fee</span><span>+₹{fmt(codFee)}</span></div>}
          <div className="chk-confirm-divider" />
          <div className="chk-confirm-row total"><span>Total Payable</span><span>₹{fmt(total)}</span></div>
        </div>
      </Section>

      <div className="chk-btn-row">
        <button className="chk-back-btn" onClick={onBack} disabled={isProcessing}>← Back</button>
        <button className="chk-place-btn" onClick={onPlace} disabled={isProcessing}>
          <FiLock size={16} /> {isProcessing ? 'Processing Order...' : `Place Order · ₹${fmt(total)}`}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  SUCCESS
// ════════════════════════════════════════════════════════════
const OrderSuccess = ({ orderId, name }) => {
  const navigate = useNavigate();
  return (
    <div className="chk-success">
      <div className="chk-success-icon">🎉</div>
      <h2>Order Placed Successfully!</h2>
      <p className="chk-success-sub">Thank you, <strong>{name}</strong>! Your order has been confirmed.</p>
      <div className="chk-order-id">Order ID: <strong>{orderId}</strong></div>
      <p className="chk-success-note">You will receive a confirmation email shortly.</p>
      <div className="chk-success-btns">
        <button className="chk-next-btn" onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN CheckoutPage
// ════════════════════════════════════════════════════════════
const CheckoutPage = () => {
  const { cart: cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [step,          setStep]          = useState(1);
  const [delivery,      setDelivery]      = useState({});
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError,   setCouponError]   = useState('');
  const [orderId,       setOrderId]       = useState('');
  const [placed,        setPlaced]        = useState(false);

  // Payment states lifted for global summary access
  const [method, setMethod] = useState('card');
  const [card,   setCard]   = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi,    setUpi]    = useState('');
  const [net,    setNet]    = useState('');

  useEffect(() => {
    if (cartItems.length === 0 && !placed) navigate('/cart');
  }, [cartItems, placed, navigate]);

  // Ensure scroll top on dynamic step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlace = () => {
    setIsProcessing(true);
    const id = 'ORD-' + Date.now().toString().slice(-8);
    setOrderId(id);
    
    const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_ORDER_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    // Construct a beautiful HTML table of items
    const orderItemsHtml = cartItems.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; text-align: left;">
          <div style="font-weight: 600; color: #111827;">${item.name}</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">QTY: ${item.quantity || 1} &times; ${item.unit}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #10b981;">
          ₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const subtotal = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const gstRate = 0.05;
    const gst = subtotal * gstRate;
    const total = subtotal + deliveryFee + gst + 5.00; // Manual calc for email total to match UI logic (5 platform fee)

    const templateParams = {
      to_name: delivery.name || 'Customer',
      name: delivery.name || 'Customer', // fallback
      to_email: delivery.email,
      email: delivery.email, // fallback
      reply_to: delivery.email,
      order_id: id,
      order_items_html: orderItemsHtml,
      subtotal: `₹${subtotal.toLocaleString('en-IN')}`,
      shipping: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`,
      total: `₹${total.toLocaleString('en-IN')}`,
      delivery_address: delivery.street || '(No address provided)'
    };

    if (delivery.email) {
      emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
        .then(response => {
          console.log('Order email sent successfully!', response.status);
        })
        .catch(err => {
          console.error('EmailJS Error Details:', err?.text || err);
          alert('Could not send the email receipt. Reason: ' + (err?.text || 'Invalid Template ID or EmailJS Config.'));
        })
        .finally(() => {
          setIsProcessing(false);
          clearCart();
          setPlaced(true);
        });
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        setPlaced(true);
      }, 800);
    }
  };

  if (placed) {
    return (
      <div className="chk-page">
        <OrderSuccess orderId={orderId} name={delivery.name || 'Devotee'} />
      </div>
    );
  }

  return (
    <div className="chk-page">
      <div className="chk-top-bar">
        <div className="chk-brand">🛒 FreshBasket — Secure Checkout</div>
        <div className="chk-secure"><FiLock size={14} /> SSL Secured</div>
      </div>

      <StepBar step={step} />

      <div className="chk-layout">
        {/* LEFT — form steps */}
        <div className="chk-left">
          {step === 1 && (
            <DeliveryStep
              data={delivery}
              setData={setDelivery}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <PaymentStep
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              method={method} setMethod={setMethod}
              card={card} setCard={setCard}
              upi={upi} setUpi={setUpi}
              net={net} setNet={setNet}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              delivery={delivery}
              cartItems={cartItems}
              couponApplied={couponApplied}
              onBack={() => setStep(2)}
              onPlace={handlePlace}
              isProcessing={isProcessing}
              paymentMethod={method}
            />
          )}
        </div>

        {/* RIGHT — order summary */}
        <div className="chk-right">
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
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;