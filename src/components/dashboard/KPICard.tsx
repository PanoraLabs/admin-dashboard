"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KPICardProps {
  tag: string;
  value: string;
  label: string;
  delta?: string;
  deltaType?: "up" | "down";
  color: "lime" | "cyan" | "amber" | "green" | "purple" | "blue" | "red";
  index: number;
}

const colorMap = {
  lime: "#a8ff3e",
  cyan: "#38d9f5",
  amber: "#ffb830",
  green: "#2edc7a",
  purple: "#c47aff",
  blue: "#4a8eff",
  red: "#ff4560",
};

export function KPICard({ tag, value, label, delta, deltaType, color, index }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-[#111820] border border-[rgba(100,160,255,0.1)] rounded-xl p-4 cursor-pointer transition-colors duration-200 hover:border-[rgba(100,160,255,0.22)] relative overflow-hidden group"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-[#5a7090] mb-2">
        {tag}
      </div>
      <div className="font-serif text-[26px] leading-none mb-1" style={{ color: colorMap[color] }}>
        {value}
      </div>
      <div className="text-[11px] text-[#5a7090]">
        {label}
      </div>
      {delta && (
        <div className={cn(
          "text-[10px] mt-1 font-semibold",
          deltaType === "up" ? "text-[#2edc7a]" : "text-[#ff4560]"
        )}>
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </div>
      )}
      {/* Bottom bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ 
          background: `linear-gradient(90deg, ${colorMap[color]}, transparent)` 
        }} 
      />
    </motion.div>
  );
}
