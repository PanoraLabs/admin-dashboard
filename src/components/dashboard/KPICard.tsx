"use client";

import { cn } from "@/lib/utils";

interface KPICardProps {
  tag: string;
  value: string;
  label: string;
  delta?: string;
  deltaType?: "up" | "down";
  color: "teal" | "neutral" | "orange";
  index: number;
}

const colorMap = {
  teal: "#00D1FF",
  neutral: "#111827",
  orange: "#FF6B00",
};

export function KPICard({ tag, value, label, delta, deltaType, color, index }: KPICardProps) {
  return (
    <div
      className="bg-white border border-[#111827] p-4 cursor-pointer transition-all duration-150 hover:border-[#00D1FF] relative overflow-hidden group"
    >
      <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#6B7280] mb-2">
        {tag}
      </div>
      <div className="font-heading text-[24px] leading-none mb-1 text-[#111827]" style={{ color: colorMap[color] }}>
        {value}
      </div>
      <div className="text-[11px] text-[#6B7280]">
        {label}
      </div>
      {delta && (
        <div className={cn(
          "text-[10px] mt-1 font-medium font-mono",
          deltaType === "up" ? "text-[#111827]" : "text-[#FF6B00]"
        )}>
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </div>
      )}
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ 
          background: colorMap[color]
        }} 
      />
    </div>
  );
}
