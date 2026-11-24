  "use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Package, LogOut, User, Clock, CheckCircle2, XCircle, Truck, Calendar, Save, Edit2, MapPin, Plus, Trash2, Star, Camera, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Address {
  id: string;
  label: string; // e.g., Home, Work
  firstName: string;
  lastName: string;
  phone: string;
  altPhone?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  orderRef: string;
  status: string;
  createdAt: Timestamp;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  addresses: Address[];
  photoURL?: string;
}

const ORDER_STEPS = [
  { label: 'Placed', key: 'pending' },
  { label: 'Confirmed', key: 'confirmed' },
  { label: 'In Transit', key: 'transit' },
  { label: 'Delivered', key: 'delivered' }
];

function getStepIndex(status: string) {
  const s = status?.toLowerCase() || 'pending';
  if (s.includes('cancel')) return -1;
  if (s.includes('deliver') || s.includes('complet')) return 3;
  if (s.includes('transit') || s.includes('dispatch') || s.includes('ship')) return 2;
  if (s.includes('confirm') || s.includes('progress') || s.includes('process') || s.includes('invoice')) return 1;
  return 0; // Default: Placed/Pending
}

function AccountContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'reviews'>('orders');

  useEffect(() => {
    if (tabParam && ['orders', 'profile', 'addresses', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [reviews, setReviews] = useState<any[]>([]);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    addresses: [],
    photoURL: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Address Management State
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Fetch Orders
      const q = query(
        collection(db, 'enquiries'), 
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let fetchedOrders: Order[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        
        // Sort in memory to avoid needing a Firestore composite index
        fetchedOrders = fetchedOrders.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        // Optionally filter out quotes if you only want 'Order' types
        // fetchedOrders = fetchedOrders.filter(o => o.orderType === 'Order');
        
        setOrders(fetchedOrders);
        setLoadingOrders(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoadingOrders(false);
      });

      // Fetch Reviews
      const reviewsQ = query(
        collection(db, 'reviews'),
        where('userId', '==', user.uid)
      );
      const unsubscribeReviews = onSnapshot(reviewsQ, (snapshot) => {
        let fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedReviews = fetchedReviews.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setReviews(fetchedReviews as any);
      });

      // Fetch Profile Data
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || user.displayName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            company: data.company || '',
            addresses: data.addresses || [],
            photoURL: data.photoURL || user.photoURL || ''
          });
        } else {
          setProfile({
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            company: '',
            addresses: [],
            photoURL: user.photoURL || ''
          });
        }
      };
      fetchProfile();

      return () => {
        unsubscribe();
        unsubscribeReviews();
      };
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const url = data.url;
      
      await updateProfile(user, { photoURL: url });
      await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });
      
      setProfile(prev => ({ ...prev, photoURL: url }));
    } catch (error) {
      console.error("Error uploading photo", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!user || !profile.photoURL) return;
    
    setUploadingPhoto(true);
    try {
      // 1. Delete from Cloudflare R2 Storage
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: profile.photoURL }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo from storage");
      }

      // 2. Update Firebase Auth & Firestore
      await updateProfile(user, { photoURL: "" });
      await setDoc(doc(db, 'users', user.uid), { photoURL: "" }, { merge: true });
      
      setProfile(prev => ({ ...prev, photoURL: "" }));
    } catch (error) {
      console.error("Error removing photo", error);
      alert("Failed to remove photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: profile.name,
        phone: profile.phone,
        company: profile.company
      }, { merge: true });

      if (user.displayName !== profile.name) {
        await updateProfile(user, { displayName: profile.name });
      }

      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      let updatedAddresses = [...profile.addresses];
      const newAddress = {
        ...addressForm,
        id: editingAddressId || Date.now().toString(),
        isDefault: addressForm.isDefault || profile.addresses.length === 0 // Force default if it's the first one
      } as Address;

      if (newAddress.isDefault) {
        // Remove default from others
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      }

      if (editingAddressId) {
        updatedAddresses = updatedAddresses.map(a => a.id === editingAddressId ? newAddress : a);
      } else {
        updatedAddresses.push(newAddress);
      }

      await setDoc(doc(db, 'users', user.uid), { addresses: updatedAddresses }, { merge: true });
      setProfile(prev => ({ ...prev, addresses: updatedAddresses }));
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({});
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address.");
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const updatedAddresses = profile.addresses.filter(a => a.id !== id);
      // If we deleted the default, make the first remaining one default
      if (profile.addresses.find(a => a.id === id)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      await setDoc(doc(db, 'users', user.uid), { addresses: updatedAddresses }, { merge: true });
      setProfile(prev => ({ ...prev, addresses: updatedAddresses }));
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address.");
    }
  };

  const setAsDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      const updatedAddresses = profile.addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      }));
      await setDoc(doc(db, 'users', user.uid), { addresses: updatedAddresses }, { merge: true });
      setProfile(prev => ({ ...prev, addresses: updatedAddresses }));
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user || !confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    }
  };

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      firstName: profile.name.split(' ')[0] || '',
      lastName: profile.name.split(' ').slice(1).join(' ') || '',
      country: 'India'
    });
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return <Clock className="w-4 h-4 text-orange-500" />;
    if (s.includes('transit')) return <Truck className="w-4 h-4 text-blue-500" />;
    if (s.includes('progress')) return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
    if (s.includes('cancel')) return <XCircle className="w-4 h-4 text-brand-accent" />;
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (s.includes('transit')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s.includes('progress')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (s.includes('cancel')) return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-28 md:pt-32 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* ── Left Sidebar (Desktop) ───────────────────── */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 sticky top-28 lg:top-32 shadow-xl">
          {/* User quick info */}
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3 mb-1">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="avatar" className="w-11 h-11 rounded-full object-cover border-2 border-brand-accent/30" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-black text-lg uppercase">
                  {(profile.name || user?.email || '?')[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{profile.name || 'My Account'}</p>
                <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            <button
              onClick={() => { setActiveTab('orders'); setShowAddressForm(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-left ${activeTab === 'orders' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Package className="w-4 h-4 shrink-0" />
              Order History
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setShowAddressForm(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-left ${activeTab === 'profile' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <User className="w-4 h-4 shrink-0" />
              Profile Details
            </button>
            <button
              onClick={() => { setActiveTab('addresses'); setShowAddressForm(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-left ${activeTab === 'addresses' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              Saved Addresses
            </button>
            <button
              onClick={() => { setActiveTab('reviews'); setShowAddressForm(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-left ${activeTab === 'reviews' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              My Reviews
            </button>
          </nav>

          <div className="border-t border-white/10 pt-4 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-red-400 hover:text-red-300 hover:bg-brand-accent/10"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────── */}
        <div className="flex-1 min-w-0 w-full">
          {/* Mobile Tab Selector */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {(['orders', 'profile', 'addresses', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowAddressForm(false); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
              >
                {tab === 'orders' ? 'Orders' : tab === 'profile' ? 'Profile' : tab === 'addresses' ? 'Addresses' : 'Reviews'}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-brand-accent/10 border border-brand-accent/20 text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>

          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter text-white mb-6 sm:mb-8">
              My <span className="text-brand-accent">Account</span>
            </h1>
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl font-black font-outfit uppercase tracking-tighter text-white mb-6">Your Orders</h2>
                
                {loadingOrders ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-8 sm:p-12 text-center">
                    <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 text-sm mb-6">You haven't placed any orders. Start browsing our products to find the perfect seating solution.</p>
                    <button onClick={() => router.push('/products')} className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-accent/20">
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all">
                        <div className="bg-[#161616] p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Order Ref</span>
                              <span className="text-sm font-bold text-white font-outfit">{order.orderRef}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                              <Calendar className="w-3 h-3" />
                              {order.createdAt ? order.createdAt.toDate().toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              }) : 'Recent'}
                            </div>
                          </div>
                          
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider w-fit ${getStatusColor(order.status || 'Pending')}`}>
                            {getStatusIcon(order.status || 'Pending')}
                            {order.status || 'Pending'}
                          </div>
                        </div>

                        {getStepIndex(order.status || 'Pending') >= 0 ? (
                          <div className="px-3 sm:px-10 py-6 sm:py-8 bg-[#111111] border-b border-white/10 overflow-x-auto">
                            <div className="relative max-w-lg mx-auto">
                              {/* Track Background */}
                              <div className="absolute top-4 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
                              
                              {/* Active Track */}
                              <div 
                                className="absolute top-4 left-0 h-1 bg-brand-accent -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(getStepIndex(order.status || 'Pending') / (ORDER_STEPS.length - 1)) * 100}%` }}
                              />
                              
                              {/* Steps */}
                              <div className="relative flex justify-between">
                                {ORDER_STEPS.map((step, index) => {
                                  const stepIndex = getStepIndex(order.status || 'Pending');
                                  const isActive = index <= stepIndex;
                                  const isCurrent = index === stepIndex;
                                  
                                  return (
                                    <div key={step.key} className="flex flex-col items-center gap-3 z-10 w-16">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                        ${isActive 
                                          ? 'bg-brand-accent border-brand-accent/40 text-white shadow-md shadow-brand-accent/25' 
                                          : 'bg-[#161616] border-white/10 text-gray-600'
                                        }`}
                                      >
                                        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                      </div>
                                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center whitespace-nowrap
                                        ${isCurrent ? 'text-brand-accent' 
                                          : isActive ? 'text-white' 
                                          : 'text-gray-500'}`
                                      }>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 py-4 bg-brand-accent/10 border-b border-brand-accent/20 text-red-400 text-xs font-bold uppercase tracking-widest text-center">
                            Order Cancelled
                          </div>
                        )}

                        <div className="p-5 divide-y divide-white/5">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-black/50 overflow-hidden shrink-0 border border-white/10">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-8 h-8 text-white/20 m-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-gray-400">Qty:</span>
                                <span className="text-sm font-black text-white ml-2">{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl font-black font-outfit uppercase tracking-tighter text-white mb-6">My Reviews</h2>
                
                {reviews.length === 0 ? (
                  <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
                    <p className="text-gray-400 text-sm mb-6">You haven't written any reviews. Share your thoughts on our products!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 relative group">
                        <button 
                          onClick={() => deleteReview(review.id)}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 rounded-full"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            {review.productImage ? (
                              <img src={review.productImage} alt={review.productName} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{review.productName}</h4>
                            <div className="flex items-center text-brand-accent mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`} />
                              ))}
                              <span className="text-gray-500 text-[10px] ml-2">
                                {review.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {review.comment}
                        </p>

                        {review.photoURL && (
                          <div className="w-32 h-32 rounded-xl border border-white/10 overflow-hidden">
                            <img src={review.photoURL} alt="Review Photo" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
                    <div className="relative group shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-[#161616] border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl md:text-6xl font-black text-gray-600 uppercase">
                            {(profile.name || user.email || '?')[0]}
                          </span>
                        )}
                      </div>
                      <label className={`absolute inset-0 bg-black/60 transition-opacity flex items-center justify-center ${uploadingPhoto ? 'cursor-not-allowed opacity-100' : 'cursor-pointer opacity-0 group-hover:opacity-100'} rounded-[2rem]`}>
                        {uploadingPhoto ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                      </label>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left mt-2 sm:mt-6">
                      <h2 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter text-white mb-2">
                        {profile.name || "Set your name"}
                      </h2>
                      <p className="text-gray-400 font-medium">{profile.email}</p>
                      
                      <div className="mt-6 flex items-center justify-center sm:justify-start gap-4">
                        {!isEditingProfile ? (
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="flex items-center gap-2 text-sm font-bold text-brand-accent hover:text-white transition-colors bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/20 px-6 py-3 rounded-xl"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </button>
                        ) : (
                          <button 
                            onClick={saveProfile}
                            disabled={savingProfile}
                            className="flex items-center gap-2 text-sm font-bold text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors px-6 py-3 rounded-xl disabled:opacity-50 shadow-lg shadow-brand-accent/20"
                          >
                            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                        )}

                        {profile.photoURL && (
                          <button
                            onClick={handlePhotoRemove}
                            disabled={uploadingPhoto}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-brand-accent/10 border border-white/10 px-6 py-3 rounded-xl disabled:opacity-50"
                          >
                            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-white">
                            {profile.name || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                        <div className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-gray-400">
                          {profile.email}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">Email cannot be changed.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                        {isEditingProfile ? (
                          <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-white min-h-[46px]">
                            {profile.phone || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Company Name</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="company"
                            value={profile.company}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-white min-h-[46px]">
                            {profile.company || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {showAddressForm ? (
                  <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-6 sm:p-8">
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tighter text-white mb-6">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <form onSubmit={saveAddress} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                          <input required type="text" name="firstName" value={addressForm.firstName || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                          <input required type="text" name="lastName" value={addressForm.lastName || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                          <input required type="tel" name="phone" value={addressForm.phone || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Alternative Phone (Optional)</label>
                          <input type="tel" name="altPhone" value={addressForm.altPhone || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                        <input required type="text" name="street" value={addressForm.street || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" placeholder="House number and street name" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                          <input required type="text" name="city" value={addressForm.city || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">State / Province</label>
                          <input required type="text" name="state" value={addressForm.state || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Postal Code</label>
                          <input required type="text" name="postalCode" value={addressForm.postalCode || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Country</label>
                          <input required type="text" name="country" value={addressForm.country || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address Label (e.g. Home, Office)</label>
                          <input required type="text" name="label" value={addressForm.label || ''} onChange={handleAddressChange} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-brand-accent text-white placeholder:text-gray-600" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <input 
                          type="checkbox" 
                          id="isDefault" 
                          checked={addressForm.isDefault || false}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="w-4 h-4 accent-brand-accent"
                        />
                        <label htmlFor="isDefault" className="text-sm font-bold text-gray-300">Set as default shipping address</label>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
                        <button type="submit" disabled={savingProfile} className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-accent/20">
                          {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />} Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black font-outfit uppercase tracking-tighter text-white">Your Addresses</h2>
                      <button 
                        onClick={openNewAddressForm}
                        className="flex items-center gap-2 text-xs font-bold text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors px-4 py-2.5 rounded-xl shadow-lg shadow-brand-accent/20"
                      >
                        <Plus className="w-4 h-4" /> Add New Address
                      </button>
                    </div>

                    {profile.addresses.length === 0 ? (
                      <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-12 text-center">
                        <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Saved Addresses</h3>
                        <p className="text-gray-400 text-sm mb-6">You haven't saved any addresses yet. Add one for faster checkout.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.addresses.map(address => (
                          <div key={address.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 relative group hover:border-brand-accent/40 hover:shadow-xl transition-all">
                            {address.isDefault && (
                              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1 shadow-md">
                                <Star className="w-3 h-3 fill-white" /> Default
                              </div>
                            )}
                            <div className="mb-4">
                              <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-bold mb-3">{address.label}</span>
                              <h3 className="font-bold text-white text-lg">{address.firstName} {address.lastName}</h3>
                              <p className="text-gray-400 text-sm mt-1">{address.street}</p>
                              <p className="text-gray-400 text-sm">{address.city}, {address.state} {address.postalCode}</p>
                              <p className="text-gray-400 text-sm">{address.country}</p>
                              <p className="text-gray-400 text-sm mt-2"><span className="font-medium text-gray-300">Phone:</span> {address.phone}</p>
                              {address.altPhone && <p className="text-gray-400 text-sm"><span className="font-medium text-gray-300">Alt Phone:</span> {address.altPhone}</p>}
                            </div>
                            
                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                              <button onClick={() => openEditAddressForm(address)} className="text-xs font-bold text-brand-accent hover:underline transition-colors">Edit</button>
                              <span className="text-white/10">|</span>
                              <button onClick={() => deleteAddress(address.id)} className="text-xs font-bold text-gray-400 hover:text-brand-accent transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
                              {!address.isDefault && (
                                <>
                                  <span className="text-white/10">|</span>
                                  <button onClick={() => setAsDefaultAddress(address.id)} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Set as Default</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    }>
      <AccountContent />
    </React.Suspense>
  );
}
