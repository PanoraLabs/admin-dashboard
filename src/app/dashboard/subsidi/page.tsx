"use client";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const flowSteps = [
  { value: "142,000", label: "token dicetak oleh kementan", color: "#111827" },
  { value: "140,280", label: "terkirim ke dompet petani", color: "#00D1FF" },
  { value: "139,938", label: "diredeem di kios resmi", color: "#FF6B00" },
  { value: "342", label: "belum terpakai (akan expired)", color: "#FF6B00" },
];

const subsidiTypes = [
  { type: "pupuk urea", minted: "68,400", redeemed: "67,820", rate: "99.2%", rateColor: "#111827" },
  { type: "benih jagung", minted: "32,800", redeemed: "32,240", rate: "98.3%", rateColor: "#111827" },
  { type: "benih padi", minted: "24,600", redeemed: "24,218", rate: "98.4%", rateColor: "#111827" },
  { type: "pestisida", minted: "14,000", redeemed: "13,660", rate: "97.6%", rateColor: "#FF6B00" },
  { type: "alsintan", minted: "2,200", redeemed: "2,000", rate: "90.9%", rateColor: "#FF6B00" },
];

const kiosList = [
  { name: "mitra tani sleman", region: "DIY", redeemed: "8,420", status: "aktif", statusColor: "teal" },
  { name: "kios subur makmur", region: "jateng", redeemed: "7,284", status: "aktif", statusColor: "teal" },
  { name: "UD pertiwi", region: "jabar", redeemed: "6,840", status: "aktif", statusColor: "teal" },
  { name: "agro nusantara", region: "jatim", redeemed: "5,920", status: "aktif", statusColor: "teal" },
  { name: "kios baru brebes", region: "jateng", redeemed: "2,140", status: "audit", statusColor: "orange" },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
};

export default function SubsidiPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          SPL token · closed-loop subsidy
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          pantau <span className="text-[#00D1FF]">subsidi digital</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          tracking SPL token subsidi dari minting kementan → distribusi → redeem di kios resmi on-chain
        </p>
      </div>

      {/* Flow Visual */}
      <ChartCard title="alur subsidi on-chain · bulan ini">
        <div className="grid grid-cols-4 divide-x divide-[#E5E7EB]">
          {flowSteps.map((step, index) => (
            <div
              key={index}
              className="relative p-4 text-center"
            >
              {/* Arrow */}
              {index < flowSteps.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-[#D1D5DB] text-lg z-10">
                  →
                </div>
              )}
              <div 
                className="font-heading text-[28px] leading-none mb-1"
                style={{ color: step.color }}
              >
                {step.value}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {step.label}
              </div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="px-4 py-3.5 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="text-xs text-[#6B7280]">realisasi subsidi</div>
          <div className="flex-1 mx-4 h-1.5 bg-[#E5E7EB] overflow-hidden">
            <div 
              className="h-full transition-all duration-1000"
              style={{ 
                width: "98.6%",
                background: "#111827"
              }}
            />
          </div>
          <div className="font-mono text-xs font-bold text-[#111827]">98.6%</div>
        </div>
      </ChartCard>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="subsidi per jenis komoditas input" action="export">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#111827] hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">jenis subsidi</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">token dicetak</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">redeemed</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsidiTypes.map((item, idx) => (
                <TableRow 
                  key={idx}
                  className={cn(
                    "border-b border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors",
                    idx % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white"
                  )}
                >
                  <TableCell className="text-xs text-[#111827]">{item.type}</TableCell>
                  <TableCell className="text-xs text-[#111827]">{item.minted}</TableCell>
                  <TableCell className="text-xs text-[#111827]">{item.redeemed}</TableCell>
                  <TableCell style={{ color: item.rateColor }} className="text-xs font-mono">
                    {item.rate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>

        <ChartCard title="kios resmi terdaftar on-chain" action="tambah kios">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#111827] hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">kios</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">wilayah</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">redeemed</TableHead>
                <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kiosList.map((kios, idx) => (
                <TableRow 
                  key={idx}
                  className={cn(
                    "border-b border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors",
                    idx % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white"
                  )}
                >
                  <TableCell className="text-xs font-medium text-[#111827]">{kios.name}</TableCell>
                  <TableCell className="text-xs text-[#111827]">{kios.region}</TableCell>
                  <TableCell className="text-xs text-[#111827]">{kios.redeemed}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${badgeStyles[kios.statusColor as keyof typeof badgeStyles]} rounded-none text-[9px]`}>
                      {kios.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>
      </div>
    </div>
  );
}
