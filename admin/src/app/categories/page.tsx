"use client";
import React from 'react';
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { FolderTree, Plus, Edit2, ChevronRight, Loader2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useState, useEffect } from "react";
import { addDoc, deleteDoc, doc } from "firebase/firestore";

export default function CategoriesPage() {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await addDoc(collection(db, "categories"), {
        name: newCatName.trim(),
        slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
        icon: "FolderTree"
      });
      setNewCatName("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (await confirm({ message: "Are you sure you want to delete this category?" })) {
      try {
        await deleteDoc(doc(db, "categories", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const catData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        count: 0 // We'll need a way to count products per category later
      }));
      setCategories(catData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Manage <span className="text-brand-accent">Categories</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Organize your products by category
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/20"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 bg-white/5 rounded-[2rem] border border-white/5"
          >
            <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-brand-accent/50 outline-none transition-all"
                  placeholder="Enter category name..."
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-4 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Create Category
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={cat.name} 
            className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:border-brand-accent/20 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand-accent group-hover:text-white transition-all">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-tight">{cat.name}</h3>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-3 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-10 bg-brand-accent/5 rounded-[3rem] border border-brand-accent/10 text-center">
        <h3 className="text-xl font-black font-outfit text-white uppercase tracking-tighter mb-4">Need more categories?</h3>
        <p className="text-sm text-white/40 max-w-lg mx-auto mb-8">You can create sub-categories and nested attributes in the advanced settings section.</p>
        <button className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] border-b border-brand-accent/20 pb-1">Manage Advanced Settings</button>
      </div>
    </div>
  );
}
