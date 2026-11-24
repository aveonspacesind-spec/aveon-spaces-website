"use client";
import React, { useState, useRef } from "react";
import { Upload, FileText, RefreshCw, X, AlertCircle } from "lucide-react";

interface BrochureUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function BrochureUploader({ value, onChange, label = "Brochure PDF" }: BrochureUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Failed to upload brochure. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Network error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[8px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear File
          </button>
        )}
      </div>

      <div className="relative group w-full bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all p-4 flex flex-col md:flex-row items-center gap-4">
        {/* File Preview Frame */}
        <div className="w-24 h-24 rounded-xl overflow-hidden relative border border-white/5 bg-[#111111] flex-shrink-0 flex items-center justify-center">
          {value ? (
            <div className="text-center space-y-1">
              <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
              <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">Loaded</span>
            </div>
          ) : (
            <FileText className="w-8 h-8 text-white/15" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-brand-accent animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Action */}
        <div className="flex-1 w-full text-center md:text-left space-y-2">
          {value ? (
            <div className="space-y-1">
              <p className="text-[10px] text-white/60 truncate max-w-[280px] font-medium">{value.split('/').pop()}</p>
              <a 
                href={value} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block text-[9px] text-brand-accent font-bold uppercase tracking-wider hover:underline"
              >
                View Uploaded PDF
              </a>
            </div>
          ) : (
            <p className="text-[10px] text-white/40 leading-relaxed font-light">
              Upload a PDF document brochure for this product (max 10MB).
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 hover:border-white/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-brand-accent" /> {uploading ? "Uploading..." : value ? "Replace Brochure" : "Upload Brochure"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />
          </div>

          {error && (
            <div className="text-[9px] font-bold text-red-400 flex items-center gap-1.5 justify-center md:justify-start">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
