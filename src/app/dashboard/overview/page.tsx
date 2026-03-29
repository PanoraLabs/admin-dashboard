"use client";

import { motion } from "framer-motion";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const kpiData = [
  { tag: "Transaksi On-Chain", value: "284,751", label: "Total bulan ini", delta: "18.4% vs Juli lalu", deltaType: "up" as const, color: "lime" as const },
  { tag: "Volume Komoditas", value: "48,240 T", label: "Tersalurkan bulan ini", delta: "12.1% vs Juli lalu", deltaType: "up" as const, color: "cyan" as const },
  { tag: "Nilai Transaksi", value: "Rp 2.1T", label: "Gross merchandise value", delta: "8.3% vs Juli lalu", deltaType: "up" as const, color: "amber" as const },
  { tag: "Petani Aktif", value: "180,294", label: "Terdaftar & KYC", delta: "2,840 bulan ini", deltaType: "up" as const, color: "green" as const },
  { tag: "Subsidi Tersalurkan", value: "Rp 84.2M", label: "SPL Token redeemed", delta: "98.6% realisasi", deltaType: "up" as const, color: "purple" as const },
  { tag: "pNFT Aktif", value: "4,281", label: "Warehouse receipts", delta: "340 mint bulan ini", deltaType: "up" as const, color: "blue" as const },
];

const topProvinces = [
  { rank: "01", name: "Jawa Tengah", volume: "12,840T", share: 85, trend: "▲ 14%", trendColor: "#2edc7a" },
  { rank: "02", name: "Jawa Timur", volume: "10,290T", share: 68, trend: "▲ 9%", trendColor: "#2edc7a" },
  { rank: "03", name: "DI Yogyakarta", volume: "8,420T", share: 56, trend: "▲ 22%", trendColor: "#2edc7a" },
  { rank: "04", name: "Sulawesi Sel.", volume: "7,180T", share: 48, trend: "▲ 6%", trendColor: "#2edc7a" },
  { rank: "05", name: "Sumatera Utara", volume: "5,940T", share: 39, trend: "▼ 2%", trendColor: "#ff4560" },
];

const commodityData = [
  { name: "Jagung", val: 14280, color: "#a8ff3e" },
  { name: "Padi", val: 12840, color: "#38d9f5" },
  { name: "Cabai", val: 8420, color: "#ffb830" },
  { name: "Bawang", val: 6380, color: "#c47aff" },
  { name: "Kedelai", val: 4120, color: "#4a8eff" },
  { name: "Lain", val: 2200, color: "#5a7090" },
];

const auditTrail = [
  { type: "MATCH_ORDER", color: "#a8ff3e", label: "Panora-Match", loc: "Sleman", amount: "2.4T", hash: "a8f3...d12e", time: "Baru saja" },
  { type: "MINT_pNFT", color: "#c47aff", label: "pNFT Mint", loc: "Bantul", amount: "5.2T", hash: "b9e4...e23f", time: "1 menit lalu" },
  { type: "REDEEM_SUBSIDI", color: "#ffb830", label: "Subsidi Redeemed", loc: "Magelang", amount: "1.8T", hash: "c0f5...f34g", time: "2 menit lalu" },
  { type: "LOG_SENSOR", color: "#38d9f5", label: "IoT Log", loc: "Brebes", amount: "350kg", hash: "d1g6...g45h", time: "3 menit lalu" },
  { type: "SETTLE_PAYMENT", color: "#2edc7a", label: "Payment Settled", loc: "Malang", amount: "12T", hash: "e2h7...h56i", time: "4 menit lalu" },
  { type: "CLAIM_INSURANCE", color: "#ff4560", label: "Insurance Claim", loc: "Makassar", amount: "2.4T", hash: "f3i8...i67j", time: "5 menit lalu" },
];

export default function OverviewPage() {
  const maxCommodity = Math.max(...commodityData.map(d => d.val));

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // Dashboard Nasional
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Overview <span className="not-italic font-heading font-black text-[#a8ff3e]">KPI Nasional</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          Real-time metrics across all 34 active provinces · Updated every 30s via Solana State
        </p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-3">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            {...kpi}
            index={index}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[3fr_2fr] gap-4">
        {/* Volume Chart */}
        <ChartCard 
          title="Volume Transaksi Harian (Ton)"
          action="7D ▾"
        >
          <div className="h-[140px] relative">
            {/* Simple SVG line chart */}
            <svg width="100%" height="100%" viewBox="0 0 600 140" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  x2="600"
                  y1={10 + i * 30}
                  y2={10 + i * 30}
                  stroke="rgba(100,160,255,0.06)"
                  strokeWidth="1"
                />
              ))}
              {/* Lines */}
              {[
                { points: [[0, 120], [100, 70], [200, 100], [300, 50], [400, 80], [500, 40], [600, 60]], color: "rgba(56,217,245,0.7)" },
                { points: [[0, 100], [100, 80], [200, 90], [300, 70], [400, 75], [500, 55], [600, 65]], color: "rgba(168,255,62,0.7)" },
                { points: [[0, 110], [100, 95], [200, 100], [300, 85], [400, 90], [500, 75], [600, 80]], color: "rgba(255,184,48,0.7)" },
              ].map((line, i) => (
                <polyline
                  key={i}
                  points={line.points.map(p => p.join(",")).join(" ")}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-1.5">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <span key={day} className="font-mono text-[8px] text-[#5a7090]">
                {day}
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Alert Feed */}
        <ChartCard 
          title="🔴 Alert Feed"
          action="Lihat Semua"
        >
          <AlertFeed />
        </ChartCard>
      </div>

      {/* Top Provinces + Commodity Chart */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Top 5 Provinsi — Volume Transaksi" action="Lihat Peta">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">#</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Provinsi</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Volume</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Share</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProvinces.map((province) => (
                <TableRow 
                  key={province.rank}
                  className="border-b border-[rgba(100,160,255,0.1)] cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="font-mono text-[10px] text-[#5a7090]">{province.rank}</TableCell>
                  <TableCell className="text-xs font-semibold text-[#d0dff0]">{province.name}</TableCell>
                  <TableCell className="text-xs text-[#d0dff0]">{province.volume}</TableCell>
                  <TableCell>
                    <div className="h-1 bg-[#1e2838] rounded-full overflow-hidden w-20">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${province.share}%`,
                          background: province.rank === "01" ? "#a8ff3e" : 
                                     province.rank === "02" ? "#38d9f5" : 
                                     province.rank === "03" ? "#ffb830" : 
                                     province.rank === "04" ? "#c47aff" : "#4a8eff"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell style={{ color: province.trendColor }} className="text-xs">
                    {province.trend}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>

        <ChartCard title="Distribusi Komoditas Bulan Ini" action="Export">
          <div className="flex items-end gap-1.5 h-[100px] pt-2">
            {commodityData.map((item, index) => {
              const pct = Math.round((item.val / maxCommodity) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[8px] text-[rgba(208,223,240,0.25)]">
                    {(item.val / 1000).toFixed(1)}K
                  </span>
                  <div 
                    className="w-full rounded-t cursor-pointer transition-all hover:brightness-125"
                    style={{ 
                      height: `${pct}%`, 
                      background: item.color,
                      opacity: 0.8,
                      minHeight: "3px"
                    }}
                  />
                  <span className="font-mono text-[8px] text-[#5a7090]">{item.name}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Audit Trail */}
      <ChartCard 
        title="⛓ Audit Trail On-Chain · Live"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#2edc7a] rounded-full animate-blink" />
              <span className="font-mono text-[9px] text-[#2edc7a]">Auto-refresh 30s</span>
            </div>
            <span className="font-mono text-[9px] text-[#5a7090] cursor-pointer hover:text-[#a8ff3e]">Solana Explorer ↗</span>
          </div>
        }
      >
        <div className="space-y-0">
          {auditTrail.map((audit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#182030] transition-colors border-b border-[rgba(100,160,255,0.1)] last:border-b-0"
            >
              <div 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: audit.color }}
              />
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-[#d0dff0]">
                  {audit.type} · {audit.loc} · {audit.amount}
                </div>
                <div className="font-mono text-[9px] text-[#5a7090] mt-0.5">
                  {audit.label} · {audit.time}
                </div>
              </div>
              <div className="font-mono text-[9px] text-[#c47aff]">
                {audit.hash}
              </div>
            </motion.div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
