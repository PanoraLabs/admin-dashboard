"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [slot, setSlot] = useState(284751033);
  const [alertCount] = useState(5);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const p = (v: number) => v.toString().padStart(2, "0");
      const months = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
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
    <header className="h-14 bg-white border-b border-[#111827] flex items-center px-6 gap-4 flex-shrink-0">
      {/* Title */}
      <div className="flex-1 font-heading text-lg text-[#111827] tracking-tight">
        <span className="text-[#00D1FF]">panora</span> command center
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] border border-[#111827]">
        <Search className="h-3.5 w-3.5 text-[#6B7280]" />
        <input
          type="text"
          placeholder="cari transaksi, user, atau hash..."
          className="bg-transparent border-none outline-none text-xs text-[#111827] placeholder:text-[#6B7280] w-[240px] font-mono"
        />
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(0,209,255,0.1)] border border-[#111827]">
        <div className="w-1.5 h-1.5 bg-[#00D1FF] animate-blink" />
        <span className="font-mono text-[10px] font-medium text-[#111827] tracking-wider">
          live · solana mainnet
        </span>
      </div>

      {/* Slot */}
      <div className="font-mono text-[10px] text-[#6B7280] tracking-wider">
        slot <span className="text-[#111827]">{slot.toLocaleString("id")}</span>
      </div>

      {/* Time */}
      <div className="font-mono text-[11px] text-[#6B7280]">
        {currentTime}
      </div>

      {/* Alert button */}
      <Button
        variant="outline"
        size="icon"
        className="relative h-8 w-8 bg-[rgba(255,107,0,0.1)] border-[#111827] hover:bg-[rgba(255,107,0,0.15)]"
      >
        <Bell className="h-4 w-4 text-[#FF6B00]" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] flex items-center justify-center text-[8px] font-mono font-bold text-white">
            {alertCount}
          </span>
        )}
      </Button>
    </header>
  );
}
