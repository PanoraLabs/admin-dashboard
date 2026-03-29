"use client";

import { useState, useEffect } from "react";

interface TickerItem {
  symbol: string;
  emoji: string;
  value: string;
  change: number;
}

const tickerItems: TickerItem[] = [
  { symbol: "JAGUNG", emoji: "🌽", value: "Rp 4.200", change: 2.1 },
  { symbol: "PADI GKP", emoji: "🌾", value: "Rp 5.500", change: 0.8 },
  { symbol: "CABAI MERAH", emoji: "🥬", value: "Rp 36.800", change: -3.2 },
  { symbol: "BAWANG MERAH", emoji: "🧅", value: "Rp 22.500", change: 3.2 },
  { symbol: "KEDELAI", emoji: "🫘", value: "Rp 8.200", change: -1.4 },
  { symbol: "SINGKONG", emoji: "🥔", value: "Rp 1.800", change: -0.5 },
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
    <span key={index} className="inline-flex items-center gap-1.5 mr-8 font-mono text-[9px] tracking-wider text-[#5a7090]">
      {item.emoji} {item.symbol}{" "}
      <span className={item.change >= 0 ? "text-[#2edc7a]" : "text-[#ff4560]"}>
        {item.value} {item.change >= 0 ? "▲" : "▼"}{Math.abs(item.change)}%
      </span>
    </span>
  );

  return (
    <div className="h-7 bg-[#0c1018] border-b border-[rgba(100,160,255,0.1)] overflow-hidden">
      <div className="flex items-center h-full whitespace-nowrap animate-ticker">
        {tickerItems.map((item, i) => renderItem(item, i))}
        <span className="mx-4 text-[rgba(100,160,255,0.22)]">|</span>
        <span className="inline-flex items-center gap-1.5 mr-8 font-mono text-[9px] tracking-wider text-[#5a7090]">
          SOL/USDC <span className="text-[#2edc7a]">$142.40 ▲4.8%</span>
        </span>
        <span className="mx-4 text-[rgba(100,160,255,0.22)]">|</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-wider text-[#5a7090]">
          TPS SOLANA <span className="text-[#2edc7a]">{tps.toLocaleString("id")}</span>
        </span>
        {/* Duplicate for seamless loop */}
        <span className="mx-8 text-[rgba(100,160,255,0.22)]">|</span>
        {tickerItems.map((item, i) => renderItem(item, i + 100))}
      </div>
    </div>
  );
}
