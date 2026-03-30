"use client";

import { useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const kpiData = [
  { tag: "total pengguna", value: "203,840", label: "petani + koperasi + transporter", color: "neutral" as const },
  { tag: "KYC terverifikasi", value: "198,204", label: "97.2% dari total pengguna", color: "teal" as const },
  { tag: "antrian verifikasi", value: "12", label: "butuh review manual", color: "orange" as const },
];

interface KYCItem {
  id: number;
  name: string;
  initial: string;
  type: string;
  location: string;
  documents: string;
  status: "pending" | "approved" | "rejected";
}

const initialQueue: KYCItem[] = [
  { id: 1, name: "ahmad fauzi", initial: "A", type: "petani", location: "kulon progo, DIY", documents: "NIK 34.02.xxx · KTP + surat tanah tersedia", status: "pending" },
  { id: 2, name: "surya logistics CV", initial: "S", type: "transporter", location: "semarang", documents: "SIUP + STNK 3 armada tersedia", status: "pending" },
  { id: 3, name: "KUD baru makmur", initial: "K", type: "koperasi", location: "blora, jateng", documents: "akta notaris + SK kemenkop · 84 anggota", status: "pending" },
  { id: 4, name: "rini widiastuti", initial: "R", type: "petani", location: "sleman, DIY", documents: "NIK belum terverifikasi dukcapil", status: "pending" },
];

const userDistribution = [
  { label: "petani", count: "180,294", percentage: "88.5%", color: "#111827", width: "88%" },
  { label: "koperasi/gudang", count: "14,820", percentage: "7.3%", color: "#00D1FF", width: "7%" },
  { label: "transporter", count: "5,420", percentage: "2.7%", color: "#FF6B00", width: "3%" },
  { label: "pembeli B2B", count: "3,306", percentage: "1.5%", color: "#6B7280", width: "2%" },
];

const kycByRegion = [
  { region: "jawa", total: "142,800", kyc: "140,200", rate: "98.2%", rateColor: "#111827" },
  { region: "sumatera", total: "38,400", kyc: "36,800", rate: "95.8%", rateColor: "#111827" },
  { region: "sulawesi", total: "14,200", kyc: "12,800", rate: "90.1%", rateColor: "#FF6B00" },
  { region: "kalimantan", total: "6,840", kyc: "6,204", rate: "90.7%", rateColor: "#FF6B00" },
  { region: "papua", total: "1,600", kyc: "1,200", rate: "75.0%", rateColor: "#FF6B00" },
];

export default function KYCVerificationPage() {
  const [queue, setQueue] = useState<KYCItem[]>(initialQueue);

  const handleApprove = (id: number) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: "approved" } : item
    ));
  };

  const handleReject = (id: number) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: "rejected" } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          identity verification queue
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          verifikasi <span className="text-[#00D1FF]">KYC pengguna</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          12 pending · solana mobile stack identity · document verification required
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

      {/* KYC Queue + Distribution */}
      <div className="grid grid-cols-[2fr_3fr] gap-4">
        {/* KYC Queue */}
        <ChartCard title="antrian KYC — review manual" action={<Badge variant="outline" className="bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827] rounded-none">12 pending</Badge>}>
          <div className="space-y-0">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 border-b border-[#E5E7EB] last:border-b-0 cursor-pointer hover:bg-[#F3F4F6] transition-all",
                  idx % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white",
                  item.status === "approved" && "opacity-60",
                  item.status === "rejected" && "opacity-40"
                )}
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 bg-[#111827]"
                )}>
                  {item.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-semibold text-[#111827]",
                    item.status === "approved" && "line-through"
                  )}>
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#6B7280] truncate">
                    {item.type} · {item.location} · {item.documents}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className={cn(
                      "h-6 px-3 text-[10px] font-medium rounded-none",
                      item.status === "approved" 
                        ? "bg-[#111827] text-[#F9FAFB] hover:bg-[#111827]" 
                        : "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border border-[#111827] hover:bg-[#00D1FF] hover:text-white"
                    )}
                    onClick={() => handleApprove(item.id)}
                    disabled={item.status !== "pending"}
                  >
                    {item.status === "approved" ? "✓ disetujui" : "✓ setujui"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-6 px-2.5 text-[10px] font-medium rounded-none",
                      item.status === "rejected"
                        ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]"
                        : "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827] hover:bg-[#FF6B00] hover:text-white"
                    )}
                    onClick={() => handleReject(item.id)}
                    disabled={item.status !== "pending"}
                  >
                    {item.status === "rejected" ? "✗ ditolak" : "✗ tolak"}
                  </Button>
                </div>
              </div>
            ))}
            <div className="px-3.5 py-3 font-mono text-[10px] text-[#6B7280] text-center cursor-pointer hover:text-[#00D1FF] transition-colors border-t border-[#E5E7EB]">
              + 8 antrian lainnya →
            </div>
          </div>
        </ChartCard>

        {/* Distribution */}
        <ChartCard title="distribusi pengguna">
          <div className="p-4 space-y-3">
            {userDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-[#111827]">{item.label}</span>
                  <span className="font-mono text-[10px] text-[#6B7280]">{item.count} · {item.percentage}</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] overflow-hidden">
                  <div 
                    className="h-full"
                    style={{ 
                      width: item.width,
                      background: item.color
                    }}
                  />
                </div>
              </div>
            ))}

            {/* KYC Rate by Region */}
            <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
              <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#6B7280] mb-3">
                KYC rate per wilayah
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#111827] hover:bg-transparent">
                    <TableHead className="font-mono text-[10px] text-[#6B7280] font-normal">wilayah</TableHead>
                    <TableHead className="font-mono text-[10px] text-[#6B7280] font-normal">total</TableHead>
                    <TableHead className="font-mono text-[10px] text-[#6B7280] font-normal">KYC ✓</TableHead>
                    <TableHead className="font-mono text-[10px] text-[#6B7280] font-normal">rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycByRegion.map((region, idx) => (
                    <TableRow 
                      key={idx}
                      className={cn(
                        "border-b border-[#E5E7EB] hover:bg-[#F3F4F6]",
                        idx % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white"
                      )}
                    >
                      <TableCell className="text-xs text-[#111827]">{region.region}</TableCell>
                      <TableCell className="text-xs text-[#111827]">{region.total}</TableCell>
                      <TableCell className="text-xs text-[#111827]">{region.kyc}</TableCell>
                      <TableCell style={{ color: region.rateColor }} className="text-xs font-mono">
                        {region.rate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
