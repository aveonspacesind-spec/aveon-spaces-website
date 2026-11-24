"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context.confirm;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    setOptions(options);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter text-white mb-2">
                {options.title || "Are you sure?"}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{options.message}</p>
            </div>
            <div className="flex border-t border-white/5 bg-white/[0.02]">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors hover:bg-white/5 border-r border-white/5"
              >
                {options.cancelText || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                  options.isDestructive !== false 
                    ? "text-red-500 hover:text-white hover:bg-red-500" 
                    : "text-brand-accent hover:text-white hover:bg-brand-accent"
                }`}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
