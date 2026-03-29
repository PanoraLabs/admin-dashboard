"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [slot, setSlot] = useState(284751033);
  const [alertCount] = useState(5);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const p = (v: number) => v.toString().padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      setCurrentTime(
        `${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()} · ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`
      );
    };

    tick();
    const timeInterval = setInterval(tick, 1000);

    const slotInterval = setInterval(() => {
      setSlot((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 400);

    return () => {
      clearInterval(timeInterval);
      clearInterval(slotInterval);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-14 bg-[#0c1018] border-b border-[rgba(100,160,255,0.1)] flex items-center px-6 gap-4 flex-shrink-0"
    >
      {/* Title */}
      <div className="flex-1 font-serif italic text-xl text-[#d0dff0]">
        <span className="not-italic font-heading font-black text-[#a8ff3e]">PANORA</span> Command Center
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(46,220,122,0.1)] border border-[rgba(46,220,122,0.2)] rounded-full">
        <div className="w-1.5 h-1.5 bg-[#2edc7a] rounded-full animate-blink" />
        <span className="font-mono text-[10px] font-semibold text-[#2edc7a] tracking-wider">
          Live · Solana Mainnet
        </span>
      </div>

      {/* Slot */}
      <div className="font-mono text-[10px] text-[#5a7090] tracking-wider">
        Slot <span className="text-[#9945ff]">{slot.toLocaleString("id")}</span>
      </div>

      {/* Time */}
      <div className="font-mono text-[11px] text-[#5a7090]">
        {currentTime}
      </div>

      {/* Alert button */}
      <Button
        variant="outline"
        size="icon"
        className="relative h-8 w-8 bg-[rgba(255,69,96,0.1)] border-[rgba(255,69,96,0.25)] hover:bg-[rgba(255,69,96,0.15)] rounded-lg"
      >
        <Bell className="h-4 w-4 text-[#ff4560]" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ff4560] rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white">
            {alertCount}
          </span>
        )}
      </Button>
    </motion.header>
  );
}
