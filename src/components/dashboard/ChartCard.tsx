"use client";

import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#111820] border border-[rgba(100,160,255,0.1)] rounded-xl overflow-hidden"
    >
      <div className="px-4 py-3.5 border-b border-[rgba(100,160,255,0.1)] flex items-center justify-between">
        <div className="text-[13px] font-bold text-[#d0dff0]">
          {title}
        </div>
        {action && (
          <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#5a7090] cursor-pointer transition-colors hover:text-[#a8ff3e]">
            {action}
          </div>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}
