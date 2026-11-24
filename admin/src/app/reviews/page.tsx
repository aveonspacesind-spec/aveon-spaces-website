"use client";

import React, { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  MessageSquare, 
  Trash2, 
  Star, 
  Search, 
  CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhotoURL?: string;
  rating: number;
  comment: string;
  photoURL?: string;
  createdAt: any;
}

export default function ReviewsPage() {
  const confirm = useConfirm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (await confirm({ message: "Are you sure you want to delete this review? This action cannot be undone." })) {
      try {
        await deleteDoc(doc(db, "reviews", id));
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete review. Check console for details.");
      }
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-black dark:text-white mb-2">
            Product <span className="text-brand-accent">Reviews</span>
          </h1>
          <p className="text-gray-500 font-medium">Manage and moderate customer reviews</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reviews by product, user, or comment..."
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-black dark:text-white focus:outline-none focus:border-brand-accent transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl shadow-sm">
        {filteredReviews.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">No Reviews Found</h3>
            <p className="max-w-md mx-auto">There are currently no reviews matching your search criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Product & User</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Rating</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Comment</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Photo</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="font-bold text-black dark:text-white flex items-center gap-2">
                        {review.productName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {review.userPhotoURL ? (
                          <img src={review.userPhotoURL} alt={review.userName} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-bold">
                            {(review.userName || "?")[0]}
                          </div>
                        )}
                        <span>{review.userName}</span>
                        <span className="flex items-center gap-1 text-[10px] text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded ml-2">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {review.createdAt ? review.createdAt.toDate().toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center text-brand-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                      {review.comment}
                    </p>
                  </td>
                  <td className="p-5">
                    {review.photoURL ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                        <img src={review.photoURL} alt="Review Photo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
