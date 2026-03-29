"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertItem {
  dot: string;
  title: string;
  subtitle: string;
  time: string;
  badge?: {
    text: string;
    variant: "lime" | "cyan" | "amber" | "red";
  };
}

const alerts: AlertItem[] = [
  {
    dot: "#ff4560",
    title: "Anomali Suhu Kargo — Tol Cipali",
    subtitle: "Kargo Cabai 1.8T · Suhu 14.2°C (max 8°C) · Klaim asuransi auto-triggered",
    time: "2 menit lalu · Contract: 9mNz...xW4k",
    badge: { text: "Kritis", variant: "red" },
  },
  {
    dot: "#ffb830",
    title: "Stok Kritis — Bawang Merah DIY",
    subtitle: "Sisa 4.2T dari kapasitas 80T · KUD Sleman · Potensi shortage",
    time: "18 menit lalu",
    badge: { text: "Warning", variant: "amber" },
  },
  {
    dot: "#ffb830",
    title: "Voucher Subsidi Belum Terpakai",
    subtitle: "342 SPL Token subsidi pupuk exp 3 hari lagi · 5 provinsi",
    time: "1 jam lalu",
    badge: { text: "Warning", variant: "amber" },
  },
  {
    dot: "#a8ff3e",
    title: "Record Transaksi Harian Tercapai",
    subtitle: "47,832 transaksi dalam 24 jam · +8.4% all-time high",
    time: "3 jam lalu",
    badge: { text: "Info", variant: "lime" },
  },
];

const badgeStyles = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.25)]",
  cyan: "bg-[rgba(56,217,245,0.1)] text-[#38d9f5] border-[rgba(56,217,245,0.25)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.25)]",
  red: "bg-[rgba(255,69,96,0.1)] text-[#ff4560] border-[rgba(255,69,96,0.25)]",
};

export function AlertFeed() {
  return (
    <div className="space-y-0">
      {alerts.map((alert, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#182030]",
            index !== alerts.length - 1 && "border-b border-[rgba(100,160,255,0.1)]"
          )}
        >
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
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
          <div className="flex-shrink-0">
            {alert.badge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] tracking-wider",
                  badgeStyles[alert.badge.variant]
                )}
              >
                {alert.badge.text}
              </Badge>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
