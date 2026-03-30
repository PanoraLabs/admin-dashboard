"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertItem {
  dot: string;
  title: string;
  subtitle: string;
  time: string;
  badge?: {
    text: string;
    variant: "teal" | "neutral" | "orange";
  };
}

const alerts: AlertItem[] = [
  {
    dot: "#FF6B00",
    title: "anomali suhu kargo — tol cipali",
    subtitle: "kargo cabai 1.8T · suhu 14.2°C (max 8°C) · klaim asuransi auto-triggered",
    time: "2 menit lalu · contract: 9mNz...xW4k",
    badge: { text: "kritis", variant: "orange" },
  },
  {
    dot: "#FF6B00",
    title: "stok kritis — bawang merah DIY",
    subtitle: "sisa 4.2T dari kapasitas 80T · KUD sleman · potensi shortage",
    time: "18 menit lalu",
    badge: { text: "warning", variant: "orange" },
  },
  {
    dot: "#FF6B00",
    title: "voucher subsidi belum terpakai",
    subtitle: "342 SPL token subsidi pupuk exp 3 hari lagi · 5 provinsi",
    time: "1 jam lalu",
    badge: { text: "warning", variant: "orange" },
  },
  {
    dot: "#00D1FF",
    title: "record transaksi harian tercapai",
    subtitle: "47,832 transaksi dalam 24 jam · +8.4% all-time high",
    time: "3 jam lalu",
    badge: { text: "info", variant: "teal" },
  },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
};

export function AlertFeed() {
  return (
    <div className="space-y-0">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#F3F4F6]",
            index !== alerts.length - 1 && "border-b border-[#E5E7EB]"
          )}
        >
          <div 
            className="w-2 h-2 flex-shrink-0 mt-1"
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
          <div className="flex-shrink-0">
            {alert.badge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] tracking-wider rounded-none",
                  badgeStyles[alert.badge.variant]
                )}
              >
                {alert.badge.text}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
