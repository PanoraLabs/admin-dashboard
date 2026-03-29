"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const kpiData = [
  { tag: "Total Pengguna", value: "203,840", label: "Petani + Koperasi + Transporter", color: "lime" as const },
  { tag: "KYC Terverifikasi", value: "198,204", label: "97.2% dari total pengguna", color: "green" as const },
  { tag: "Antrian Verifikasi", value: "12", label: "Butuh review manual", color: "red" as const },
];

interface KYCItem {
  id: number;
  name: string;
  initial: string;
  gradient: string;
  type: string;
  location: string;
  documents: string;
  status: "pending" | "approved" | "rejected";
}

const initialQueue: KYCItem[] = [
  { id: 1, name: "Ahmad Fauzi", initial: "A", gradient: "from-[#38d9f5] to-[#1a7ab8]", type: "Petani", location: "Kulon Progo, DIY", documents: "NIK 34.02.xxx · KTP + Surat Tanah tersedia", status: "pending" },
  { id: 2, name: "Surya Logistics CV", initial: "S", gradient: "from-[#ffb830] to-[#b87820]", type: "Transporter", location: "Semarang", documents: "SIUP + STNK 3 armada tersedia", status: "pending" },
  { id: 3, name: "KUD Baru Makmur", initial: "K", gradient: "from-[#c47aff] to-[#6a40c0]", type: "Koperasi", location: "Blora, Jateng", documents: "Akta notaris + SK Kemenkop · 84 anggota", status: "pending" },
  { id: 4, name: "Rini Widiastuti", initial: "R", gradient: "from-[#2edc7a] to-[#1a6a3a]", type: "Petani", location: "Sleman, DIY", documents: "NIK belum terverifikasi Dukcapil", status: "pending" },
];

const userDistribution = [
  { label: "🌾 Petani", count: "180,294", percentage: "88.5%", color: "#a8ff3e", width: "88%" },
  { label: "🏛 Koperasi/Gudang", count: "14,820", percentage: "7.3%", color: "#38d9f5", width: "7%" },
  { label: "🚛 Transporter", count: "5,420", percentage: "2.7%", color: "#ffb830", width: "3%" },
  { label: "🏢 Pembeli B2B", count: "3,306", percentage: "1.5%", color: "#c47aff", width: "2%" },
];

const kycByRegion = [
  { region: "Jawa", total: "142,800", kyc: "140,200", rate: "98.2%", rateColor: "#2edc7a" },
  { region: "Sumatera", total: "38,400", kyc: "36,800", rate: "95.8%", rateColor: "#2edc7a" },
  { region: "Sulawesi", total: "14,200", kyc: "12,800", rate: "90.1%", rateColor: "#ffb830" },
  { region: "Kalimantan", total: "6,840", kyc: "6,204", rate: "90.7%", rateColor: "#ffb830" },
  { region: "Papua", total: "1,600", kyc: "1,200", rate: "75.0%", rateColor: "#ff4560" },
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
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // Identity Verification Queue
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Verifikasi <span className="not-italic font-heading font-black text-[#a8ff3e]">KYC Pengguna</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          12 pending · Solana Mobile Stack identity · Document verification required
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

      {/* KYC Queue + Distribution */}
      <div className="grid grid-cols-[2fr_3fr] gap-4">
        {/* KYC Queue */}
        <ChartCard title="Antrian KYC — Review Manual" action={<Badge variant="outline" className="bg-[rgba(255,69,96,0.1)] text-[#ff4560] border-[rgba(255,69,96,0.25)]">12 Pending</Badge>}>
          <div className="space-y-0">
            {queue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 border-b border-[rgba(100,160,255,0.1)] last:border-b-0 cursor-pointer hover:bg-[#182030] transition-all",
                  item.status === "approved" && "opacity-50",
                  item.status === "rejected" && "opacity-40"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-extrabold text-white flex-shrink-0 bg-gradient-to-br",
                  item.gradient
                )}>
                  {item.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-semibold text-[#d0dff0]",
                    item.status === "approved" && "line-through"
                  )}>
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#5a7090] truncate">
                    {item.type} · {item.location} · {item.documents}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className={cn(
                      "h-6 px-3 text-[10px] font-bold",
                      item.status === "approved" 
                        ? "bg-[#2edc7a] text-[#070a0f] hover:bg-[#2edc7a]" 
                        : "bg-[rgba(46,220,122,0.1)] text-[#2edc7a] border border-[rgba(46,220,122,0.3)] hover:bg-[#2edc7a] hover:text-[#070a0f]"
                    )}
                    onClick={() => handleApprove(item.id)}
                    disabled={item.status !== "pending"}
                  >
                    {item.status === "approved" ? "✓ Disetujui" : "✓ Setujui"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-6 px-2.5 text-[10px] font-bold",
                      item.status === "rejected"
                        ? "bg-[#ff4560] text-white hover:bg-[#ff4560]"
                        : "bg-[rgba(255,69,96,0.1)] text-[#ff4560] border-[rgba(255,69,96,0.25)] hover:bg-[#ff4560] hover:text-white"
                    )}
                    onClick={() => handleReject(item.id)}
                    disabled={item.status !== "pending"}
                  >
                    {item.status === "rejected" ? "✗ Ditolak" : "✗ Tolak"}
                  </Button>
                </div>
              </motion.div>
            ))}
            <div className="px-3.5 py-3 font-mono text-[10px] text-[#5a7090] text-center cursor-pointer hover:text-[#a8ff3e] transition-colors border-t border-[rgba(100,160,255,0.1)]">
              + 8 antrian lainnya →
            </div>
          </div>
        </ChartCard>

        {/* Distribution */}
        <ChartCard title="Distribusi Pengguna">
          <div className="p-4 space-y-3">
            {userDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-[#d0dff0]">{item.label}</span>
                  <span className="font-mono text-[10px] text-[#5a7090]">{item.count} · {item.percentage}</span>
                </div>
                <div className="h-1.5 bg-[#1e2838] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: item.width,
                      background: `linear-gradient(90deg, ${item.color}, ${index === 0 ? '#2edc7a' : index === 1 ? '#4a8eff' : index === 2 ? '#b87820' : '#7a40c0'})`
                    }}
                  />
                </div>
              </div>
            ))}

            {/* KYC Rate by Region */}
            <div className="mt-5 pt-4 border-t border-[rgba(100,160,255,0.1)]">
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] mb-3">
                KYC Rate per Wilayah
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                    <TableHead className="font-mono text-[9px] text-[#5a7090] font-normal">Wilayah</TableHead>
                    <TableHead className="font-mono text-[9px] text-[#5a7090] font-normal">Total</TableHead>
                    <TableHead className="font-mono text-[9px] text-[#5a7090] font-normal">KYC ✓</TableHead>
                    <TableHead className="font-mono text-[9px] text-[#5a7090] font-normal">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycByRegion.map((region, index) => (
                    <TableRow 
                      key={index}
                      className="border-b border-[rgba(100,160,255,0.1)] hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-xs text-[#d0dff0]">{region.region}</TableCell>
                      <TableCell className="text-xs text-[#d0dff0]">{region.total}</TableCell>
                      <TableCell className="text-xs text-[#d0dff0]">{region.kyc}</TableCell>
                      <TableCell style={{ color: region.rateColor }} className="text-xs">
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
