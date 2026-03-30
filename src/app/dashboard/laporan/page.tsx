"use client";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const generateButtons = [
  {
    icon: "▤",
    title: "laporan ketahanan pangan",
    subtitle: "kementan · bulanan · juli 2025",
    action: "generate PDF",
    primary: true,
  },
  {
    icon: "◉",
    title: "laporan audit subsidi",
    subtitle: "BPKP · kuartalan · Q2 2025",
    action: "generate PDF",
    primary: true,
  },
  {
    icon: "▦",
    title: "data produksi komoditas",
    subtitle: "BPS · tahunan · 2025",
    action: "generate PDF",
    primary: true,
  },
  {
    icon: "∞",
    title: "blockchain audit trail",
    subtitle: "semua transaksi · CSV · immutable",
    action: "export CSV",
    primary: false,
  },
];

const recentReports = [
  { name: "ketahanan pangan", period: "jun 2025", created: "1 jul", status: "terkirim", statusColor: "teal" },
  { name: "audit subsidi", period: "Q1 2025", created: "2 apr", status: "terkirim", statusColor: "teal" },
  { name: "data produksi", period: "2024", created: "15 jan", status: "terkirim", statusColor: "teal" },
  { name: "audit keuangan", period: "mei 2025", created: "3 jun", status: "review", statusColor: "neutral" },
  { name: "distribusi logistik", period: "jun 2025", created: "5 jul", status: "draft", statusColor: "orange" },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
};

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          kementan · BPKP · BPS
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          laporan <span className="text-[#00D1FF]">regulasi</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          generate laporan on-chain untuk kementan, BPKP, dan BPS · data immutable dari solana blockchain
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        {/* Generate Reports */}
        <ChartCard title="generate laporan otomatis">
          <div className="p-4 space-y-2.5">
            {generateButtons.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer hover:border-[#111827] transition-colors"
              >
                <div>
                  <div className="text-xs font-medium text-[#111827] mb-0.5 flex items-center gap-2">
                    <span className="text-[#6B7280]">{item.icon}</span> {item.title}
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {item.subtitle}
                  </div>
                </div>
                <Button
                  variant={item.primary ? "default" : "outline"}
                  size="sm"
                  className={item.primary 
                    ? "bg-[#111827] text-[#F9FAFB] hover:bg-[#111827]/90 font-medium text-[11px] h-7 px-4 rounded-none"
                    : "bg-transparent border-[#111827] hover:bg-[#F3F4F6] text-[11px] h-7 px-4 rounded-none"
                  }
                >
                  {item.action}
                </Button>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Reports */}
        <ChartCard title="laporan terakhir digenerate">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#111827] hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">laporan</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">periode</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">dibuat</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report, idx) => (
                <TableRow 
                  key={idx}
                  className={cn(
                    "border-b border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors cursor-pointer",
                    idx % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white"
                  )}
                >
                  <TableCell className="text-xs font-medium text-[#111827]">{report.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#111827]">{report.period}</TableCell>
                  <TableCell className="font-mono text-xs text-[#111827]">{report.created}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${badgeStyles[report.statusColor as keyof typeof badgeStyles]} rounded-none text-[9px]`}>
                      {report.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Solana Proof of Audit */}
          <div className="p-4 border-t border-[#E5E7EB]">
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#6B7280] mb-2.5">
              solana proof of audit
            </div>
            <div className="bg-[#F3F4F6] p-3 font-mono text-[10px] text-[#6B7280] leading-relaxed border border-[#E5E7EB]">
              root hash: <span className="text-[#111827]">a8f3...d12e</span><br />
              block: <span className="text-[#111827]">284,720,001 – 284,751,033</span><br />
              verified: <span className="text-[#00D1FF]">✓ immutable on solana mainnet</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
