"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const generateButtons = [
  {
    icon: "📋",
    title: "Laporan Ketahanan Pangan",
    subtitle: "Kementan · Bulanan · Juli 2025",
    action: "Generate PDF",
    primary: true,
  },
  {
    icon: "🔍",
    title: "Laporan Audit Subsidi",
    subtitle: "BPKP · Kuartalan · Q2 2025",
    action: "Generate PDF",
    primary: true,
  },
  {
    icon: "📊",
    title: "Data Produksi Komoditas",
    subtitle: "BPS · Tahunan · 2025",
    action: "Generate PDF",
    primary: true,
  },
  {
    icon: "⛓",
    title: "Blockchain Audit Trail",
    subtitle: "Semua transaksi · CSV · Immutable",
    action: "Export CSV",
    primary: false,
  },
];

const recentReports = [
  { name: "Ketahanan Pangan", period: "Jun 2025", created: "1 Jul", status: "Terkirim", statusColor: "lime" },
  { name: "Audit Subsidi", period: "Q1 2025", created: "2 Apr", status: "Terkirim", statusColor: "lime" },
  { name: "Data Produksi", period: "2024", created: "15 Jan", status: "Terkirim", statusColor: "lime" },
  { name: "Audit Keuangan", period: "Mei 2025", created: "3 Jun", status: "Review", statusColor: "cyan" },
  { name: "Distribusi Logistik", period: "Jun 2025", created: "5 Jul", status: "Draft", statusColor: "amber" },
];

const badgeStyles: Record<string, string> = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.25)]",
  cyan: "bg-[rgba(56,217,245,0.1)] text-[#38d9f5] border-[rgba(56,217,245,0.25)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.25)]",
};

export default function LaporanPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // Kementan · BPKP · BPS
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Laporan <span className="not-italic font-heading font-black text-[#a8ff3e]">Regulasi</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          Generate laporan on-chain untuk Kementan, BPKP, dan BPS · Data immutable dari Solana blockchain
        </p>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        {/* Generate Reports */}
        <ChartCard title="Generate Laporan Otomatis">
          <div className="p-4 space-y-2.5">
            {generateButtons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3.5 bg-[#182030] border border-[rgba(100,160,255,0.1)] rounded-lg cursor-pointer hover:border-[rgba(100,160,255,0.22)] transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-[#d0dff0] mb-0.5">
                    {item.icon} {item.title}
                  </div>
                  <div className="text-[11px] text-[#5a7090]">
                    {item.subtitle}
                  </div>
                </div>
                <Button
                  variant={item.primary ? "default" : "outline"}
                  size="sm"
                  className={item.primary 
                    ? "bg-[#a8ff3e] text-[#070a0f] hover:bg-[#c8ff5e] font-bold text-[11px] h-7 px-4 border-0"
                    : "bg-transparent border-[rgba(100,160,255,0.22)] hover:bg-[#182030] text-[11px] h-7 px-4"
                  }
                >
                  {item.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Reports */}
        <ChartCard title="Laporan Terakhir Digenerate">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Laporan</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Periode</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Dibuat</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report, index) => (
                <TableRow 
                  key={index}
                  className="border-b border-[rgba(100,160,255,0.1)] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <TableCell className="text-xs font-semibold text-[#d0dff0]">{report.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#d0dff0]">{report.period}</TableCell>
                  <TableCell className="font-mono text-xs text-[#d0dff0]">{report.created}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium border ${badgeStyles[report.statusColor]}`}>
                      {report.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Solana Proof of Audit */}
          <div className="p-4 border-t border-[rgba(100,160,255,0.1)]">
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] mb-2.5">
              Solana Proof of Audit
            </div>
            <div className="bg-[#182030] rounded-md p-3 font-mono text-[10px] text-[#5a7090] leading-relaxed">
              Root Hash: <span className="text-[#9945ff]">a8f3...d12e</span><br />
              Block: <span className="text-[#a8ff3e]">284,720,001 – 284,751,033</span><br />
              Verified: <span className="text-[#2edc7a]">✓ Immutable on Solana Mainnet</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
