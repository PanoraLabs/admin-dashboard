"use client";

import { motion } from "framer-motion";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kpiData = [
  { tag: "Kontrak Aktif", value: "2,847", label: "Program calls hari ini", color: "lime" as const },
  { tag: "Klaim Asuransi", value: "12", label: "Auto-triggered bulan ini", delta: "4 vs bulan lalu", deltaType: "up" as const, color: "red" as const },
  { tag: "Avg Finality", value: "0.42s", label: "Waktu konfirmasi Solana", delta: "SLA 99.9% terpenuhi", deltaType: "up" as const, color: "cyan" as const },
];

const alerts = [
  {
    dot: "#ff4560",
    dotBlink: true,
    title: "Klaim Asuransi Auto-Triggered",
    subtitle: "Trip T-2025-0142 · Suhu 14.2°C selama 24 menit · Kargo Cabai 1.8T terdampak · Nilai klaim Rp 8.5jt",
    time: "2 menit lalu · Tx: 9mNz...xW4k · Slot 284,751,031",
    badge: { text: "Kritis", variant: "red" },
    action: "Investigasi",
  },
  {
    dot: "#ffb830",
    title: "Subsidi Voucher Menumpuk Tidak Terpakai",
    subtitle: "342 SPL Token pupuk urea · Akan expired 3 hari lagi · 5 wilayah terdampak",
    time: "18 menit lalu",
    badge: { text: "Warning", variant: "amber" },
    action: "Cek Subsidi",
  },
  {
    dot: "#ffb830",
    title: "pNFT Expired Tidak Di-Redeem",
    subtitle: "18 pNFT warehouse receipt lewat masa berlaku · Nilai agunan Rp 420jt terikat",
    time: "2 jam lalu",
    badge: { text: "Warning", variant: "amber" },
  },
  {
    dot: "#a8ff3e",
    title: "Milestone: 100K pNFT Diterbitkan",
    subtitle: "Total pNFT on-chain melampaui 100,000 sejak launch · All-time record",
    time: "Hari ini 06:14",
    badge: { text: "Milestone", variant: "lime" },
  },
];

const contracts = [
  { name: "Panora-Match Engine", id: "PNRmtch...4xkL", status: "Healthy", statusColor: "#2edc7a", calls: "1,284 calls/hr", blink: true },
  { name: "Warehouse Receipt (pNFT)", id: "Metaplex Core · PNRwhr...9pQr", status: "Healthy", statusColor: "#2edc7a", calls: "342 calls/hr", blink: true },
  { name: "Insurance Auto-Claim", id: "PNRins...7mPq · 1 klaim aktif", status: "Alert!", statusColor: "#ff4560", calls: "12 triggers bulan ini", blink: true, alert: true },
  { name: "Subsidi SPL Token Distributor", id: "PNRsub...2pKq", status: "Warning", statusColor: "#ffb830", calls: "342 unspent tokens", blink: true },
  { name: "DeFi Loan Protocol Bridge", id: "PNRloan...3sLm", status: "Healthy", statusColor: "#2edc7a", calls: "Rp 2.4M TVL", blink: true },
];

const badgeStyles: Record<string, string> = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.25)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.25)]",
  red: "bg-[rgba(255,69,96,0.1)] text-[#ff4560] border-[rgba(255,69,96,0.25)]",
};

export default function SmartContractPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // Solana · Anchor Framework
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Smart Contract <span className="not-italic font-heading font-black text-[#a8ff3e]">Monitor</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          Real-time status semua smart contract aktif · Anomali auto-detected via on-chain events
        </p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3">
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
        <ChartCard title="⚠ Alert Anomali — Butuh Tindakan" action="Tandai Semua Dibaca">
          <div className="space-y-0">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[#182030] transition-colors",
                  index !== alerts.length - 1 && "border-b border-[rgba(100,160,255,0.1)]"
                )}
              >
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-1",
                    alert.dotBlink && "animate-blink"
                  )}
                  style={{ background: alert.dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#d0dff0] mb-0.5">
                    {alert.title}
                  </div>
                  <div className="text-[11px] text-[#5a7090] mb-1">
                    {alert.subtitle}
                  </div>
                  <div className="font-mono text-[9px] text-[rgba(208,223,240,0.25)]">
                    {alert.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {alert.badge && (
                    <Badge
                      variant="outline"
                      className={badgeStyles[alert.badge.variant]}
                    >
                      {alert.badge.text}
                    </Badge>
                  )}
                  {alert.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[10px] h-6 px-2.5 bg-transparent border-[rgba(100,160,255,0.22)] hover:bg-[#182030]"
                    >
                      {alert.action}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Contract Status */}
        <ChartCard title="Status Smart Contract">
          <div className="p-4 space-y-2">
            {contracts.map((contract, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 bg-[#182030] border rounded-lg cursor-pointer transition-colors hover:border-[rgba(100,160,255,0.22)]",
                  contract.alert 
                    ? "border-[rgba(255,69,96,0.3)] bg-[rgba(255,69,96,0.1)]" 
                    : "border-[rgba(100,160,255,0.1)]"
                )}
              >
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    contract.blink && "animate-blink"
                  )}
                  style={{ background: contract.statusColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#d0dff0]">
                    {contract.name}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a7090] mt-0.5">
                    {contract.id}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div 
                    className="text-[11px] font-semibold"
                    style={{ color: contract.statusColor }}
                  >
                    {contract.status}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a7090] mt-0.5">
                    {contract.calls}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
