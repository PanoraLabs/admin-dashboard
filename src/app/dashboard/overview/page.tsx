"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const kpiData = [
  { tag: "transaksi on-chain", value: "284,751", label: "total bulan ini", delta: "18.4% vs Juli lalu", deltaType: "up" as const, color: "teal" as const },
  { tag: "volume komoditas", value: "48,240 T", label: "tersalurkan bulan ini", delta: "12.1% vs Juli lalu", deltaType: "up" as const, color: "neutral" as const },
  { tag: "nilai transaksi", value: "Rp 2.1T", label: "gross merchandise value", delta: "8.3% vs Juli lalu", deltaType: "up" as const, color: "orange" as const },
  { tag: "petani aktif", value: "180,294", label: "terdaftar & KYC", delta: "2,840 bulan ini", deltaType: "up" as const, color: "teal" as const },
  { tag: "subsidi tersalurkan", value: "Rp 84.2M", label: "SPL token redeemed", delta: "98.6% realisasi", deltaType: "up" as const, color: "neutral" as const },
  { tag: "pNFT aktif", value: "4,281", label: "warehouse receipts", delta: "340 mint bulan ini", deltaType: "up" as const, color: "teal" as const },
];

const topProvinces = [
  { rank: "01", name: "jawa tengah", volume: "12,840T", share: 85, trend: "▲ 14%", trendColor: "#111827" },
  { rank: "02", name: "jawa timur", volume: "10,290T", share: 68, trend: "▲ 9%", trendColor: "#111827" },
  { rank: "03", name: "DI yogyakarta", volume: "8,420T", share: 56, trend: "▲ 22%", trendColor: "#111827" },
  { rank: "04", name: "sulawesi sel.", volume: "7,180T", share: 48, trend: "▲ 6%", trendColor: "#111827" },
  { rank: "05", name: "sumatera utara", volume: "5,940T", share: 39, trend: "▼ 2%", trendColor: "#FF6B00" },
];

const commodityData = [
  { name: "jagung", val: 14280, color: "#111827" },
  { name: "padi", val: 12840, color: "#00D1FF" },
  { name: "cabai", val: 8420, color: "#FF6B00" },
  { name: "bawang", val: 6380, color: "#6B7280" },
  { name: "kedelai", val: 4120, color: "#111827" },
  { name: "lain", val: 2200, color: "#9CA3AF" },
];

const auditTrail = [
  { type: "MATCH_ORDER", color: "#00D1FF", label: "panora-match", loc: "sleman", amount: "2.4T", hash: "a8f3...d12e", time: "baru saja", status: "selesai" },
  { type: "MINT_pNFT", color: "#111827", label: "pNFT mint", loc: "bantul", amount: "5.2T", hash: "b9e4...e23f", time: "1 menit lalu", status: "aktif" },
  { type: "REDEEM_SUBSIDI", color: "#FF6B00", label: "subsidi redeemed", loc: "magelang", amount: "1.8T", hash: "c0f5...f34g", time: "2 menit lalu", status: "selesai" },
  { type: "LOG_SENSOR", color: "#00D1FF", label: "IoT log", loc: "brebes", amount: "350kg", hash: "d1g6...g45h", time: "3 menit lalu", status: "aktif" },
  { type: "SETTLE_PAYMENT", color: "#111827", label: "payment settled", loc: "malang", amount: "12T", hash: "e2h7...h56i", time: "4 menit lalu", status: "selesai" },
  { type: "CLAIM_INSURANCE", color: "#FF6B00", label: "insurance claim", loc: "makassar", amount: "2.4T", hash: "f3i8...i67j", time: "5 menit lalu", status: "bermasalah" },
];

const statusStyles = {
  aktif: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  pending: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
  bermasalah: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
  selesai: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
};

export default function OverviewPage() {
  const maxCommodity = Math.max(...commodityData.map(d => d.val));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          dashboard nasional
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          overview <span className="text-[#00D1FF]">kpi nasional</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          real-time metrics across all 34 active provinces · updated every 30s via solana state
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-4">
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
          title="volume transaksi harian (ton)"
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
                  stroke="rgba(17,24,39,0.08)"
                  strokeWidth="1"
                />
              ))}
              {/* Lines */}
              {[
                { points: [[0, 120], [100, 70], [200, 100], [300, 50], [400, 80], [500, 40], [600, 60]], color: "rgba(0,209,255,0.7)" },
                { points: [[0, 100], [100, 80], [200, 90], [300, 70], [400, 75], [500, 55], [600, 65]], color: "rgba(17,24,39,0.7)" },
                { points: [[0, 110], [100, 95], [200, 100], [300, 85], [400, 90], [500, 75], [600, 80]], color: "rgba(255,107,0,0.7)" },
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
          <div className="flex justify-between mt-2">
            {["sen", "sel", "rab", "kam", "jum", "sab", "min"].map((day) => (
              <span key={day} className="font-mono text-[9px] text-[#6B7280]">
                {day}
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Alert Feed */}
        <ChartCard 
          title="alert feed"
          action="lihat semua"
        >
          <AlertFeed />
        </ChartCard>
      </div>

      {/* Top Provinces + Commodity Chart */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="top 5 provinsi — volume transaksi" action="lihat peta">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#111827] hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">#</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">provinsi</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">volume</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">share</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProvinces.map((province, idx) => (
                <TableRow 
                  key={province.rank}
                  className={`border-b border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6] transition-colors ${idx % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'}`}
                >
                  <TableCell className="font-mono text-[10px] text-[#6B7280]">{province.rank}</TableCell>
                  <TableCell className="text-xs font-medium text-[#111827]">{province.name}</TableCell>
                  <TableCell className="text-xs text-[#111827]">{province.volume}</TableCell>
                  <TableCell>
                    <div className="h-1 bg-[#E5E7EB] overflow-hidden w-20">
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${province.share}%`,
                          background: province.rank === "01" ? "#00D1FF" : 
                                     province.rank === "02" ? "#111827" : 
                                     province.rank === "03" ? "#FF6B00" : 
                                     province.rank === "04" ? "#6B7280" : "#9CA3AF"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell style={{ color: province.trendColor }} className="text-xs font-mono">
                    {province.trend}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>

        <ChartCard title="distribusi komoditas bulan ini" action="export">
          <div className="flex items-end gap-2 h-[100px] pt-2">
            {commodityData.map((item, index) => {
              const pct = Math.round((item.val / maxCommodity) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[9px] text-[#9CA3AF]">
                    {(item.val / 1000).toFixed(1)}K
                  </span>
                  <div 
                    className="w-full cursor-pointer transition-all hover:brightness-110"
                    style={{ 
                      height: `${pct}%`, 
                      background: item.color,
                      minHeight: "3px"
                    }}
                  />
                  <span className="font-mono text-[9px] text-[#6B7280]">{item.name}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Audit Trail */}
      <ChartCard 
        title="audit trail on-chain · live"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#00D1FF] animate-blink" />
              <span className="font-mono text-[9px] text-[#00D1FF]">auto-refresh 30s</span>
            </div>
            <span className="font-mono text-[9px] text-[#6B7280] cursor-pointer hover:text-[#00D1FF]">solana explorer ↗</span>
          </div>
        }
      >
        <div className="space-y-0">
          {auditTrail.map((audit, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F3F4F6] transition-colors border-b border-[#E5E7EB] last:border-b-0 ${index % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'}`}
            >
              <div 
                className="w-1.5 h-1.5 flex-shrink-0"
                style={{ background: audit.color }}
              />
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-[#111827]">
                  {audit.type} · {audit.loc} · {audit.amount}
                </div>
                <div className="font-mono text-[9px] text-[#6B7280] mt-0.5">
                  {audit.label} · {audit.time}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-[9px] rounded-none ${statusStyles[audit.status as keyof typeof statusStyles]}`}
              >
                {audit.status}
              </Badge>
              <div className="font-mono text-[9px] text-[#6B7280]">
                {audit.hash}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
