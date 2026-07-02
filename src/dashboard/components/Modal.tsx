import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footerActions }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside to close & Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog box frame */}
      <div 
        ref={modalRef}
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10 animate-scale-in select-none text-zinc-300 font-sans"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h4 className="text-base font-semibold text-white tracking-tight">{title}</h4>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-sm leading-relaxed">
          {children}
        </div>

        {footerActions && (
          <div className="px-6 py-5 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-end gap-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
