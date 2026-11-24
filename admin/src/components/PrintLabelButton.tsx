"use client";

import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { ShippingLabel } from "./ShippingLabel";
import { Printer, Info } from "lucide-react";

export function PrintLabelButton({ order }: { order: any }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (handlePrint) handlePrint();
          }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg text-brand-accent transition-all"
        >
          <Printer className="w-3 h-3" />
          Generate Label
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(!showInfo);
          }}
          className={`p-2 rounded-lg transition-all border ${
            showInfo 
              ? "bg-white/10 border-white/20 text-white" 
              : "bg-white/5 border-transparent text-white/40 hover:text-white"
          }`}
          title="Printing Instructions"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="bg-black/50 border border-brand-accent/20 rounded-xl p-4 text-[11px] text-white/70 leading-relaxed space-y-2 shadow-lg shadow-black/50"
        >
          <p className="text-brand-accent font-bold uppercase tracking-widest text-[9px] mb-2 border-b border-white/10 pb-2">
            Printer Settings Guide
          </p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li><strong>Paper Size:</strong> Select <span className="text-white font-bold">4" x 6"</span> (Thermal) or <span className="text-white font-bold">A6</span>. <br/><em className="text-white/50 text-[10px]">No A6? Select <strong>A4</strong>. It will print perfectly in the top corner so you can cut it out.</em></li>
            <li><strong>Margins:</strong> Set to <span className="text-white font-bold">None</span> or Minimum.</li>
            <li><strong>Scale:</strong> Set to <span className="text-white font-bold">100%</span> or Fit to Paper.</li>
            <li><strong>Background Graphics:</strong> Ensure this is <span className="text-white font-bold">Checked</span>.</li>
            <li><strong>Headers/Footers:</strong> Make sure this is <span className="text-white font-bold">Turned Off</span>.</li>
          </ul>
        </div>
      )}

      <div className="hidden">
        <ShippingLabel ref={contentRef} order={order} />
      </div>
    </div>
  );
}
