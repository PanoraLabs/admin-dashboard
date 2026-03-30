"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kpiData = [
  { tag: "kontrak aktif", value: "2,847", label: "program calls hari ini", color: "neutral" as const },
  { tag: "klaim asuransi", value: "12", label: "auto-triggered bulan ini", delta: "4 vs bulan lalu", deltaType: "up" as const, color: "orange" as const },
  { tag: "avg finality", value: "0.42s", label: "waktu konfirmasi solana", delta: "SLA 99.9% terpenuhi", deltaType: "up" as const, color: "teal" as const },
];

const alerts = [
  {
    dot: "#FF6B00",
    dotBlink: true,
    title: "klaim asuransi auto-triggered",
    subtitle: "trip T-2025-0142 · suhu 14.2°C selama 24 menit · kargo cabai 1.8T terdampak · nilai klaim Rp 8.5jt",
    time: "2 menit lalu · tx: 9mNz...xW4k · slot 284,751,031",
    badge: { text: "kritis", variant: "orange" as const },
    action: "investigasi",
  },
  {
    dot: "#FF6B00",
    title: "subsidi voucher menumpuk tidak terpakai",
    subtitle: "342 SPL token pupuk urea · akan expired 3 hari lagi · 5 wilayah terdampak",
    time: "18 menit lalu",
    badge: { text: "warning", variant: "orange" as const },
    action: "cek subsidi",
  },
  {
    dot: "#FF6B00",
    title: "pNFT expired tidak di-redeem",
    subtitle: "18 pNFT warehouse receipt lewat masa berlaku · nilai agunan Rp 420jt terikat",
    time: "2 jam lalu",
    badge: { text: "warning", variant: "orange" as const },
  },
  {
    dot: "#00D1FF",
    title: "milestone: 100K pNFT diterbitkan",
    subtitle: "total pNFT on-chain melampaui 100,000 sejak launch · all-time record",
    time: "hari ini 06:14",
    badge: { text: "milestone", variant: "teal" as const },
  },
];

const contracts = [
  { name: "panora-match engine", id: "PNRmtch...4xkL", status: "aktif", statusColor: "#111827", calls: "1,284 calls/hr", alert: false },
  { name: "warehouse receipt (pNFT)", id: "metaplex core · PNRwhr...9pQr", status: "aktif", statusColor: "#111827", calls: "342 calls/hr", alert: false },
  { name: "insurance auto-claim", id: "PNRins...7mPq · 1 klaim aktif", status: "bermasalah", statusColor: "#FF6B00", calls: "12 triggers bulan ini", alert: true },
  { name: "subsidi SPL token distributor", id: "PNRsub...2pKq", status: "pending", statusColor: "#FF6B00", calls: "342 unspent tokens", alert: false },
  { name: "DeFi loan protocol bridge", id: "PNRloan...3sLm", status: "aktif", statusColor: "#111827", calls: "Rp 2.4M TVL", alert: false },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
};

export default function SmartContractPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          solana · anchor framework
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          smart contract <span className="text-[#00D1FF]">monitor</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          real-time status semua smart contract aktif · anomali auto-detected via on-chain events
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            {...kpi}
            index={index}
          />
        ))}
      </div>

      {/* Alerts + Contracts */}
      <div className="grid grid-cols-[2fr_3fr] gap-4">
        {/* Alert Anomali */}
        <ChartCard title="alert anomali — butuh tindakan" action="tandai semua dibaca">
          <div className="space-y-0">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[#F3F4F6] transition-colors",
                  index !== alerts.length - 1 && "border-b border-[#E5E7EB]"
                )}
              >
                <div 
                  className={cn(
                    "w-2 h-2 flex-shrink-0 mt-1",
                    alert.dotBlink && "animate-blink"
                  )}
                  style={{ background: alert.dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#111827] mb-0.5">
                    {alert.title}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mb-1">
                    {alert.subtitle}
                  </div>
                  <div className="font-mono text-[9px] text-[#9CA3AF]">
                    {alert.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {alert.badge && (
                    <Badge
                      variant="outline"
                      className={`${badgeStyles[alert.badge.variant]} rounded-none text-[9px]`}
                    >
                      {alert.badge.text}
                    </Badge>
                  )}
                  {alert.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[10px] h-6 px-2.5 bg-transparent border-[#111827] hover:bg-[#F3F4F6] rounded-none"
                    >
                      {alert.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Contract Status */}
        <ChartCard title="status smart contract">
          <div className="p-4 space-y-2">
            {contracts.map((contract, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 bg-[#F9FAFB] border cursor-pointer transition-colors hover:border-[#111827]",
                  contract.alert 
                    ? "border-[#FF6B00] bg-[rgba(255,107,0,0.05)]" 
                    : "border-[#E5E7EB]"
                )}
              >
                <div 
                  className="w-2 h-2 flex-shrink-0"
                  style={{ background: contract.statusColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#111827]">
                    {contract.name}
                  </div>
                  <div className="font-mono text-[9px] text-[#6B7280] mt-0.5">
                    {contract.id}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div 
                    className="text-[11px] font-medium"
                    style={{ color: contract.statusColor }}
                  >
                    {contract.status}
                  </div>
                  <div className="font-mono text-[9px] text-[#6B7280] mt-0.5">
                    {contract.calls}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
