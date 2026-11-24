"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building2, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return { score, label: '', color: 'bg-gray-200 dark:bg-white/10' };
    
    if (password.length > 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-brand-accent' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        router.push('/account');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        await updateProfile(userCred.user, {
          displayName: formData.name
        });

        // Store extra user info in Firestore
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          createdAt: serverTimestamp()
        });

        router.push('/account');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        name: userCred.user.displayName || '',
        email: userCred.user.email || '',
        lastLogin: serverTimestamp()
      }, { merge: true });

      router.push('/account');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full bg-[#050505] text-white flex items-center justify-center pt-24 sm:pt-28 md:pt-32 pb-24 sm:pb-32 px-4 sm:px-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-outfit text-white uppercase tracking-tighter">
            {isLogin ? 'Welcome ' : 'Create '} 
            <span className="text-brand-accent">{isLogin ? 'Back' : 'Account'}</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 sm:mt-3">
            {isLogin ? 'Sign in to access your orders and saved items' : 'Join Aveon Spaces for a tailored experience'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required={!isLogin}
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        placeholder="Company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        required={!isLogin}
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isLogin && formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div 
                      key={level} 
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        level <= (strength.score > 4 ? 3 : strength.score > 2 ? 2 : 1)
                          ? strength.color 
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  {strength.label}
                </p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required={!isLogin}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-brand-accent/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData(prev => ({ ...prev, confirmPassword: '' }));
              }}
              className="text-xs text-gray-400 hover:text-brand-accent transition-colors"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
