"use client";

import { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { 
  Mail,
  Search, 
  Trash2, 
  Clock, 
  User, 
  Calendar,
  Phone,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Subscriber {
  id: string;
  email: string;
  phone: string;
  createdAt: any;
}

export default function NewsletterPage() {
  const confirm = useConfirm();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "newsletter_subscriptions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscriber[];
      setSubscribers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching newsletter subscribers:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (await confirm({ message: "Are you sure you want to remove this subscriber?" })) {
      try {
        await deleteDoc(doc(db, "newsletter_subscriptions", id));
      } catch (error) {
        console.error("Error deleting subscriber:", error);
        toast.error("Failed to delete subscriber. Please try again.");
      }
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const email = (sub.email || "").toLowerCase();
    const phone = (sub.phone || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    
    return email.includes(query) || phone.includes(query);
  });

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Newsletter <span className="text-brand-accent">Subscribers</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage your audience and updates reach
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Audience</span>
              <span className="text-xs font-bold text-emerald-400">{subscribers.length} Active Subscribers</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search by email or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all"
          />
        </div>
      </div>

      {/* SUBSCRIBERS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
            <Inbox className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight">No Subscribers Found</h3>
            <p className="text-white/40 text-xs mt-1">Try refining your search terms or verify subscriptions exist.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredSubscribers.map((subscriber) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={subscriber.id}
                  className="bg-white/5 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight flex items-center gap-2">
                        {subscriber.email}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-brand-accent" /> {subscriber.phone || "No phone number"}
                        </span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {subscriber.createdAt?.toDate 
                            ? new Date(subscriber.createdAt.toDate()).toLocaleDateString() 
                            : subscriber.createdAt?.seconds 
                              ? new Date(subscriber.createdAt.seconds * 1000).toLocaleDateString()
                              : 'Just now'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <button 
                      onClick={() => handleDelete(subscriber.id)}
                      className="w-12 h-12 rounded-2xl bg-white/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
