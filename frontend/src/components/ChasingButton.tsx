import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ChasingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export default function ChasingButton({ href, icon: Icon, className = "", children, ...props }: ChasingButtonProps) {
  const content = (
    <div className="relative inline-flex overflow-hidden rounded-2xl p-[1px] focus:outline-none group w-full h-full">
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#111_0%,var(--color-brand-accent)_50%,#111_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`inline-flex h-full w-full items-center justify-center rounded-2xl bg-brand-accent group-hover:bg-[#0A0A0A] transition-colors duration-500 text-white font-black uppercase tracking-widest text-xs z-10 ${className}`}>
        <span className="relative z-20 flex items-center justify-center gap-3">
          {Icon && <Icon className="w-5 h-5 group-hover:text-brand-accent transition-colors duration-500" />}
          <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-accent transition-all duration-500">
            {children}
          </span>
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block relative">
        {content}
      </Link>
    );
  }

  return (
    <button {...props} className="relative inline-block">
      {content}
    </button>
  );
}
