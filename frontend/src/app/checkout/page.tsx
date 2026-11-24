"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  CheckCircle2, ShoppingBag, ArrowLeft, Loader2, X, Plus, Minus, Star,
  Truck, Calendar, MapPin, Phone, CreditCard, AlertCircle, ChevronRight,
  Check, Send, Package, MessageCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Address } from '@/app/account/page';

const FINANCE_PHONE = '1234567890';

function generateOrderRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AVN-${yy}${mm}-${rand}`;
}

function getEstimatedDeliveryDate(postalCode: string): Date {
  const date = new Date();
  let daysToAdd = 7;
  if (postalCode) {
    const start = postalCode.substring(0, 2);
    if (start === '56') daysToAdd = 2;
    else if (['50', '51', '52', '53', '57', '58', '59', '60', '61', '62', '63', '64', '68', '69'].includes(start)) daysToAdd = 4;
  }
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirm', icon: CheckCircle2 },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buynow';
  const { user } = useAuth();
  const { items, itemCount, updateItem, removeItem, clearCart, isLoaded } = useCart();

  // Buy Now override
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  useEffect(() => {
    if (isBuyNow) {
      try {
        const raw = sessionStorage.getItem('aveon_buy_now');
        if (raw) setBuyNowItem(JSON.parse(raw));
      } catch { }
    }
  }, [isBuyNow]);

  const checkoutItems = isBuyNow && buyNowItem ? [{ ...buyNowItem, quantity: buyNowItem.quantity || 1 }] : items;
  const checkoutItemCount = checkoutItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Address step state
  const [formData, setFormData] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '' });
  const [addressForm, setAddressForm] = useState<Partial<Address>>({ country: 'India', isDefault: false });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Order state
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Prefill user data
  useEffect(() => {
    if (user) {
      const parts = user.displayName ? user.displayName.split(' ') : [];
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || ''
      }));
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData(prev => ({ ...prev, phone: data.phone || prev.phone, company: data.company || prev.company }));
            if (data.addresses && data.addresses.length > 0) {
              setSavedAddresses(data.addresses);
              const def = data.addresses.find((a: Address) => a.isDefault);
              setSelectedAddressId(def ? def.id : data.addresses[0].id);
            } else {
              setShowNewAddressForm(true);
            }
          }
        } catch (e) { console.error(e); }
      };
      fetchUserData();
    } else {
      setShowNewAddressForm(true);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const t = e.target as HTMLInputElement;
    setAddressForm(prev => ({ ...prev, [t.name]: t.type === 'checkbox' ? t.checked : t.value }));
  };

  // Step 1 → 2: validate address and move forward
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItemCount === 0) return;

    let finalAddress: any = null;
    if (showNewAddressForm) {
      finalAddress = {
        ...addressForm,
        id: Date.now().toString(),
        firstName: addressForm.firstName || formData.firstName,
        lastName: addressForm.lastName || formData.lastName,
        phone: addressForm.phone || formData.phone,
        altPhone: addressForm.altPhone || '',
        label: addressForm.label || 'Other'
      };
      if (!finalAddress.street || !finalAddress.city || !finalAddress.postalCode) {
        alert('Please fill in all required address fields.');
        return;
      }
    } else if (selectedAddressId) {
      finalAddress = savedAddresses.find(a => a.id === selectedAddressId);
    }

    if (!finalAddress?.street || !finalAddress?.city || !finalAddress?.postalCode) {
      alert('Please provide a valid shipping address.');
      return;
    }

    setPendingOrderDetails({
      customer: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: finalAddress
      },
      items: [...checkoutItems]
    });

    // Save address to profile if needed
    if (showNewAddressForm && user && addressForm.isDefault) {
      (async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          let newAddresses = savedAddresses.map(a => ({ ...a, isDefault: false }));
          newAddresses.push({ ...finalAddress, isDefault: true });
          await updateDoc(userRef, { addresses: newAddresses });
        } catch (err) { console.error(err); }
      })();
    }

    setCurrentStep(2);
  };

  // Step 3: Place order
  const handlePlaceOrder = async () => {
    if (!pendingOrderDetails) return;
    setIsSubmitting(true);
    const ref = generateOrderRef();
    try {
      await addDoc(collection(db, 'enquiries'), {
        orderRef: ref,
        orderType: 'Order',
        userId: user ? user.uid : null,
        customer: pendingOrderDetails.customer,
        items: pendingOrderDetails.items,
        paymentConfirmed,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setIsSubmitting(false);
      setSubmittedOrder({ ref, address: pendingOrderDetails.customer.address, items: pendingOrderDetails.items, date: new Date() });
      if (isBuyNow) sessionStorage.removeItem('aveon_buy_now');
      else clearCart();
    } catch (error) {
      console.error(error);
      alert('There was an error placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  // ─── Success Page ──────────────────────────────────────────────────────────
  if (submittedOrder) {
    const estDate = getEstimatedDeliveryDate(submittedOrder.address.postalCode);
    const dateStr = estDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white pt-32 pb-32 px-4 md:px-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="max-w-3xl mx-auto bg-[#111111] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Success Header */}
          <div className="p-8 md:p-12 text-center bg-gradient-to-b from-green-50/60 to-white dark:from-green-900/10 dark:to-[#111] border-b border-gray-100 dark:border-white/5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-black dark:text-white mb-2">Order Placed!</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
              Your order has been received. Our team will get in touch shortly.
            </p>
            {/* Payment pending notice */}
            <div className="inline-flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-2xl px-5 py-4 text-left max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">
                <strong>Payment Verification Pending —</strong> If your payment is not confirmed within 24 hours, our finance team will contact you to complete the process.
              </p>
            </div>
            <div className="mt-5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 inline-block shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Order Reference</span>
              <span className="text-2xl font-bold font-outfit text-brand-accent">{submittedOrder.ref}</span>
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Items */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {submittedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-[#F8F9FA] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl items-center">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-black/30 overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-black dark:text-white">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping + Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">Shipping To</h3>
                <div className="flex gap-3 p-4 bg-[#F8F9FA] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-black dark:text-white">{submittedOrder.address.firstName} {submittedOrder.address.lastName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {submittedOrder.address.street}<br />
                      {submittedOrder.address.city}, {submittedOrder.address.state} {submittedOrder.address.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-4">
                <Truck className="w-4 h-4 text-brand-accent shrink-0" />
                <div>
                  <p className="text-xs font-bold text-black dark:text-white">Estimated Delivery</p>
                  <p className="text-xs text-gray-500">{dateStr}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {user ? (
                  <Link href="/account" className="w-full text-center px-6 py-3.5 bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                    Track Order in Profile
                  </Link>
                ) : (
                  <Link href="/login" className="w-full text-center px-6 py-3.5 bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                    Create Account to Track
                  </Link>
                )}
                <Link href="/products" className="w-full text-center px-6 py-3.5 bg-[#F8F9FA] dark:bg-white/10 text-black dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // ─── Checkout Wizard ───────────────────────────────────────────────────────
  const inputCls = "w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 sm:px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-500 transition-all";
  const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pt-24 sm:pt-28 pb-32 px-3 sm:px-6 selection:bg-brand-accent selection:text-black">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-accent transition-colors mb-6 sm:mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Cart
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black font-outfit uppercase tracking-tighter text-white mb-8">
          Secure <span className="text-brand-accent">Checkout</span>
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      backgroundColor: isDone ? '#22c55e' : isActive ? 'var(--color-brand-accent, #C62828)' : 'transparent',
                      borderColor: isDone ? '#22c55e' : isActive ? 'var(--color-brand-accent, #C62828)' : '#333333',
                    }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all"
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs font-black ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.id}</span>
                    )}
                  </motion.div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mb-5 transition-colors ${currentStep > step.id ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left — Step Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: ADDRESS ─────────────────────────────────────── */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">

                  <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-accent text-white flex items-center justify-center text-xs">1</span>
                    Delivery Address
                  </h2>

                  {!user && (
                    <div className="mb-6 p-4 bg-[#161616] border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Already have an account?</p>
                        <p className="text-xs text-gray-400 mt-0.5">Sign in to use saved addresses.</p>
                      </div>
                      <Link href="/login" className="px-4 py-2 border border-white/20 text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-all">
                        Sign In
                      </Link>
                    </div>
                  )}

                  <form id="step1-form" onSubmit={handleAddressSubmit} className="space-y-5">
                    {/* Contact */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Contact Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>First Name</label><input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputCls} /></div>
                        <div><label className={labelCls}>Last Name</label><input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputCls} /></div>
                        <div><label className={labelCls}>Email</label><input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} /></div>
                        <div><label className={labelCls}>Phone</label><input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputCls} /></div>
                      </div>
                      <div className="mt-4"><label className={labelCls}>Company (Optional)</label><input type="text" name="company" value={formData.company} onChange={handleChange} className={inputCls} /></div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Shipping Address</p>

                      {savedAddresses.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {savedAddresses.map(addr => (
                            <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id && !showNewAddressForm ? 'border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                              <input type="radio" name="addrSel" checked={selectedAddressId === addr.id && !showNewAddressForm} onChange={() => { setSelectedAddressId(addr.id); setShowNewAddressForm(false); }} className="mt-1 accent-brand-accent" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-sm text-black dark:text-white">{addr.firstName} {addr.lastName}</span>
                                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 rounded text-[10px] font-bold">{addr.label}</span>
                                  {addr.isDefault && <Star className="w-3 h-3 text-brand-accent fill-brand-accent" />}
                                </div>
                                <p className="text-xs text-gray-500">{addr.street}, {addr.city} {addr.postalCode}</p>
                              </div>
                            </label>
                          ))}
                          <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${showNewAddressForm ? 'border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                            <input type="radio" name="addrSel" checked={showNewAddressForm} onChange={() => setShowNewAddressForm(true)} className="accent-brand-accent" />
                            <span className="font-bold text-sm text-black dark:text-white">Use a different address</span>
                          </label>
                        </div>
                      )}

                      {showNewAddressForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelCls}>First Name</label><input required={showNewAddressForm} type="text" name="firstName" value={addressForm.firstName || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div><label className={labelCls}>Last Name</label><input required={showNewAddressForm} type="text" name="lastName" value={addressForm.lastName || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div><label className={labelCls}>Phone</label><input required={showNewAddressForm} type="tel" name="phone" value={addressForm.phone || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div><label className={labelCls}>Alt Phone</label><input type="tel" name="altPhone" value={addressForm.altPhone || ''} onChange={handleAddressChange} className={inputCls} /></div>
                          </div>
                          <div><label className={labelCls}>Street Address</label><input required={showNewAddressForm} type="text" name="street" value={addressForm.street || ''} onChange={handleAddressChange} className={inputCls} placeholder="House no. and street name" /></div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className={labelCls}>City</label><input required={showNewAddressForm} type="text" name="city" value={addressForm.city || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div><label className={labelCls}>State</label><input required={showNewAddressForm} type="text" name="state" value={addressForm.state || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div><label className={labelCls}>PIN Code</label><input required={showNewAddressForm} type="text" name="postalCode" value={addressForm.postalCode || ''} onChange={handleAddressChange} className={inputCls} /></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Country</label><input required={showNewAddressForm} type="text" name="country" value={addressForm.country || ''} onChange={handleAddressChange} className={inputCls} /></div>
                            <div>
                              <label className={labelCls}>Label</label>
                              <select name="label" value={addressForm.label || 'Home'} onChange={handleAddressChange as any} className={inputCls}>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          {user && (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" name="isDefault" checked={addressForm.isDefault || false} onChange={handleAddressChange} className="w-4 h-4 accent-brand-accent rounded" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">Save address to my profile</span>
                            </label>
                          )}
                        </motion.div>
                      )}
                    </div>

                    <button type="submit" form="step1-form"
                      className="w-full flex items-center justify-center gap-2 py-4 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2: PAYMENT ─────────────────────────────────────── */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">

                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-accent text-white flex items-center justify-center text-xs">2</span>
                    Payment
                  </h2>

                  {/* How it works */}
                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-brand-accent" />
                      <p className="text-xs font-black uppercase tracking-widest text-white">How Payment Works</p>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Our payment process is handled <strong className="text-white">externally</strong> by our finance team.
                      Please contact us directly using the details below to complete your payment before dispatch.
                    </p>
                  </div>

                  {/* Payment rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">100% Advance Required</p>
                        <p className="text-xs text-amber-300">Full payment must be completed before we dispatch your order.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                      <Package className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Custom Manufacturing</p>
                        <p className="text-xs text-blue-300">Each order is custom built. Payment confirms your production slot.</p>
                      </div>
                    </div>
                  </div>

                  {/* Finance Contact Card */}
                  <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/5 border border-brand-accent/40 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-2">Contact Finance Team</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white tracking-widest">{FINANCE_PHONE}</p>
                        <p className="text-xs text-gray-400">Mon – Sat, 9:00 AM – 6:00 PM IST</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a href={`tel:${FINANCE_PHONE}`}
                        className="flex items-center gap-2 px-5 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                        <Phone className="w-4 h-4" /> Call Finance Team
                      </a>
                      <a href={`https://wa.me/91${FINANCE_PHONE}?text=Hi%2C%20I%20want%20to%20pay%20for%20my%20order`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setCurrentStep(1)} className="px-6 py-3.5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                      ← Back
                    </button>
                    <button onClick={() => setCurrentStep(3)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                      I've Contacted — Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: CONFIRM & PLACE ─────────────────────────────── */}
              {currentStep === 3 && pendingOrderDetails && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">

                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-accent text-white flex items-center justify-center text-xs">3</span>
                    Place Your Order
                  </h2>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Shipping Address</p>
                      <p className="text-sm font-bold text-white">{pendingOrderDetails.customer.address.firstName} {pendingOrderDetails.customer.address.lastName}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        {pendingOrderDetails.customer.address.street}<br />
                        {pendingOrderDetails.customer.address.city}, {pendingOrderDetails.customer.address.state} {pendingOrderDetails.customer.address.postalCode}
                      </p>
                    </div>
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Contact</p>
                      <p className="text-sm font-bold text-white">{pendingOrderDetails.customer.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{pendingOrderDetails.customer.email}</p>
                      <p className="text-xs text-gray-400">{pendingOrderDetails.customer.phone}</p>
                    </div>
                  </div>

                  {/* Payment confirmation checkbox */}
                  <div className={`rounded-2xl border-2 p-5 transition-all cursor-pointer ${paymentConfirmed ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-[#141414]'}`}
                    onClick={() => setPaymentConfirmed(v => !v)}>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${paymentConfirmed ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                        {paymentConfirmed && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${paymentConfirmed ? 'text-green-400' : 'text-white'}`}>
                          I have completed my payment
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          I confirm that I have contacted the finance team and completed the payment of 100% of the order value.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Important Note */}
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Important Note</p>
                      <p className="text-xs text-amber-300 leading-relaxed">
                        If your payment is not confirmed by our team, we will contact you soon to complete the payment before processing your order.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setCurrentStep(2)} className="px-6 py-3.5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                      ← Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right — Order Summary (sticky) */}
          <div className="lg:col-span-5">
            <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl sticky top-28">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-accent" />
                Order Summary
                {isBuyNow && <span className="ml-auto text-[9px] font-black bg-brand-accent text-white px-2.5 py-1 rounded-full">Buy Now</span>}
              </h3>

              {checkoutItemCount === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-bold">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5 max-h-[350px] overflow-y-auto pr-1">
                  {checkoutItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-[#141414] border border-white/10 rounded-xl relative group">
                      {!isBuyNow && (
                        <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-brand-accent text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow" aria-label="Remove item">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-brand-accent uppercase tracking-widest mb-1">{item.category}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold">Qty:</span>
                          {isBuyNow ? (
                            <span className="text-xs font-bold text-white">{item.quantity}</span>
                          ) : (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5">
                              <button type="button" onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold">Total Items</span>
                  <span className="font-black text-white">{checkoutItemCount} units</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Payment</span>
                  <span className="text-brand-accent font-bold">Direct Invoice / Corporate Dispatch</span>
                </div>
              </div>

              {/* Step CTA mirror */}
              {currentStep === 1 && checkoutItemCount > 0 && (
                <button form="step1-form" type="submit"
                  className="mt-5 w-full flex items-center justify-center gap-2 py-4 bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90">
                  <ChevronRight className="w-4 h-4" /> Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
