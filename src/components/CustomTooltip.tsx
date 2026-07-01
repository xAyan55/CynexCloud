import React, { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className = "relative inline-block" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-4 py-2.5 rounded-xl whitespace-normal max-w-[260px] sm:max-w-xs text-center shadow-2xl glass-dark leading-relaxed">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
