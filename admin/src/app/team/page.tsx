"use client";
import React, { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Info
} from "lucide-react";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
);

export default function TeamCMSPage() {
  const confirm = useConfirm();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "team"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading team members:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!name.trim()) missingFields.push("Name");
    if (!role.trim()) missingFields.push("Role / Designation");
    if (!bio.trim()) missingFields.push("Short Bio");

    if (missingFields.length > 0) {
      setFormError(`${missingFields.join(", ")} ${missingFields.length === 1 ? 'is' : 'are'} required.`);
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "team", editingId);
        await updateDoc(docRef, {
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          image: image.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim()
        });
      } else {
        // Add new
        await addDoc(collection(db, "team"), {
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          image: image.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim()
        });
      }
      resetForm();
      toast.success(editingId ? "Team member updated!" : "Team member created!");
    } catch (error) {
      console.error("Error saving team member:", error);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (member: any) => {
    setEditingId(member.id);
    setName(member.name || "");
    setRole(member.role || "");
    setBio(member.bio || "");
    setImage(member.image || "");
    setLinkedin(member.linkedin || "");
    setTwitter(member.twitter || "");
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this team member?" })) return;
    try {
      await deleteDoc(doc(db, "team", id));
      toast.success("Team member deleted.");
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setBio("");
    setImage("");
    setLinkedin("");
    setTwitter("");
    setFormError("");
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Team / Founders <span className="text-brand-accent">CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage the founders and key team members displayed on the About Us page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Member" : "Add Member"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify team profile" : "Create a new team profile"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-3">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Role / Designation</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CEO & Founder"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Short Bio</label>
                <textarea 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description about the member..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">LinkedIn URL (Optional)</label>
                <input 
                  type="text" 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Twitter URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Twitter URL (Optional)</label>
                <input 
                  type="text" 
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Profile Image"
                  value={image}
                  onChange={setImage}
                  fallback=""
                  sizeHint="600x800px (Portrait format recommended)"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  disabled={submitting}
                  type="submit"
                  className="flex-1 py-4 bg-brand-accent text-white hover:bg-red-700 font-bold rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
                >
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Member")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Team Members List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <Users className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Team Members Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fill out the editor form on the left and submit to populate the team section on the About page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] overflow-hidden flex flex-col transition-all group"
                >
                  {/* Image Header */}
                  <div className="h-48 relative bg-[#111111] w-full">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-white/20 bg-white/5">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Actions overlaid */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                       <button 
                        onClick={() => startEdit(member)}
                        className="p-2 bg-black/50 backdrop-blur-md border border-white/10 hover:border-white/30 text-white transition-all rounded-lg cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="p-2 bg-red-500/80 backdrop-blur-md border border-red-500/20 hover:bg-red-500 text-white transition-all rounded-lg cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                       <h4 className="font-black font-outfit text-2xl text-white truncate drop-shadow-md">
                          {member.name}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent drop-shadow-md">
                          {member.role}
                        </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 min-h-0">
                    <p className="text-xs text-white/60 leading-relaxed font-light mb-4 line-clamp-4 flex-1">
                      {member.bio}
                    </p>

                    <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                      {member.linkedin && (
                         <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-[#0A66C2] transition-colors">
                           <LinkedinIcon className="w-4 h-4" />
                         </a>
                      )}
                      {member.twitter && (
                         <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-[#1DA1F2] transition-colors">
                           <TwitterIcon className="w-4 h-4" />
                         </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
