"use client";

import { useState, useEffect } from "react";

interface TickerItem {
  symbol: string;
  value: string;
  change: number;
}

const tickerItems: TickerItem[] = [
  { symbol: "JAGUNG", value: "Rp 4.200", change: 2.1 },
  { symbol: "PADI GKP", value: "Rp 5.500", change: 0.8 },
  { symbol: "CABAI MERAH", value: "Rp 36.800", change: -3.2 },
  { symbol: "BAWANG MERAH", value: "Rp 22.500", change: 3.2 },
  { symbol: "KEDELAI", value: "Rp 8.200", change: -1.4 },
  { symbol: "SINGKONG", value: "Rp 1.800", change: -0.5 },
];

export function Ticker() {
  const [tps, setTps] = useState(3847);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(3000 + Math.floor(Math.random() * 2000));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const renderItem = (item: TickerItem, index: number) => (
    <span key={index} className="inline-flex items-center gap-2 mr-8 font-mono text-[10px] tracking-wider text-[#6B7280]">
      {item.symbol}
      <span className={item.change >= 0 ? "text-[#111827]" : "text-[#FF6B00]"}>
        {item.value} {item.change >= 0 ? "▲" : "▼"}{Math.abs(item.change)}%
      </span>
    </span>
  );

  return (
    <div className="h-8 bg-white border-b border-[#111827] overflow-hidden">
      <div className="flex items-center h-full whitespace-nowrap animate-ticker">
        {tickerItems.map((item, i) => renderItem(item, i))}
        <span className="mx-4 text-[#D1D5DB]">|</span>
        <span className="inline-flex items-center gap-2 mr-8 font-mono text-[10px] tracking-wider text-[#6B7280]">
          SOL/USDC <span className="text-[#111827]">$142.40 ▲4.8%</span>
        </span>
        <span className="mx-4 text-[#D1D5DB]">|</span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#6B7280]">
          TPS SOLANA <span className="text-[#111827]">{tps.toLocaleString("id")}</span>
        </span>
        {/* Duplicate for seamless loop */}
        <span className="mx-8 text-[#D1D5DB]">|</span>
        {tickerItems.map((item, i) => renderItem(item, i + 100))}
      </div>
    </div>
  );
}
