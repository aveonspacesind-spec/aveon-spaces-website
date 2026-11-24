"use client";

import React from 'react';

interface LoaderProps {
  size?: number | string;
  color?: string;
  className?: string;
}

/**
 * Boneyard-inspired Skeleton Loader
 * Replaces generic spinners with high-fidelity "Bone" placeholders.
 */
export default function Loader({ size = 40, className = "" }: LoaderProps) {
  return (
    <div 
      className={`relative overflow-hidden bg-zinc-900/50 rounded-lg ${className}`}
      style={{ 
        width: typeof size === 'number' ? `${size}px` : size, 
        height: typeof size === 'number' ? `${size}px` : size 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-full bg-[#111111] rounded-2xl border border-white/5 p-4 space-y-4">
      <div className="aspect-square bg-zinc-900/50 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-zinc-900/50 rounded-md w-3/4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <div className="h-4 bg-zinc-900/50 rounded-md w-1/2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-8 bg-zinc-900/50 rounded-full w-24 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <div className="h-6 bg-zinc-900/50 rounded-full w-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
