"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const flowSteps = [
  { icon: "🏛️", value: "142,000", label: "Token Dicetak<br />oleh Kementan", color: "#a8ff3e" },
  { icon: "📲", value: "140,280", label: "Terkirim ke<br />Dompet Petani", color: "#38d9f5" },
  { icon: "🏪", value: "139,938", label: "Diredeem di<br />Kios Resmi", color: "#ffb830" },
  { icon: "🔥", value: "342", label: "Belum Terpakai<br />(Akan Expired)", color: "#ff4560" },
];

const subsidiTypes = [
  { type: "🌿 Pupuk Urea", minted: "68,400", redeemed: "67,820", rate: "99.2%", rateColor: "#2edc7a" },
  { type: "🌱 Benih Jagung", minted: "32,800", redeemed: "32,240", rate: "98.3%", rateColor: "#2edc7a" },
  { type: "🌾 Benih Padi", minted: "24,600", redeemed: "24,218", rate: "98.4%", rateColor: "#2edc7a" },
  { type: "💊 Pestisida", minted: "14,000", redeemed: "13,660", rate: "97.6%", rateColor: "#ffb830" },
  { type: "⚙ Alsintan", minted: "2,200", redeemed: "2,000", rate: "90.9%", rateColor: "#ff4560" },
];

const kiosList = [
  { name: "Mitra Tani Sleman", region: "DIY", redeemed: "8,420", status: "Aktif", statusColor: "lime" },
  { name: "Kios Subur Makmur", region: "Jateng", redeemed: "7,284", status: "Aktif", statusColor: "lime" },
  { name: "UD Pertiwi", region: "Jabar", redeemed: "6,840", status: "Aktif", statusColor: "lime" },
  { name: "Agro Nusantara", region: "Jatim", redeemed: "5,920", status: "Aktif", statusColor: "lime" },
  { name: "Kios Baru Brebes", region: "Jateng", redeemed: "2,140", status: "Audit", statusColor: "amber" },
];

const badgeStyles: Record<string, string> = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.25)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.25)]",
};

export default function SubsidiPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // SPL Token · Closed-Loop Subsidy
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Pantau <span className="not-italic font-heading font-black text-[#a8ff3e]">Subsidi Digital</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          Tracking SPL Token subsidi dari minting Kementan → distribusi → redeem di kios resmi on-chain
        </p>
      </motion.div>

      {/* Flow Visual */}
      <ChartCard title="Alur Subsidi On-Chain · Bulan Ini">
        <div className="grid grid-cols-4 divide-x divide-[rgba(100,160,255,0.1)]">
          {flowSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative p-4 text-center"
            >
              {/* Arrow */}
              {index < flowSteps.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-[#5a7090] text-lg z-10">
                  →
                </div>
              )}
              <div className="text-lg mb-2">{step.icon}</div>
              <div 
                className="font-serif text-[28px] italic leading-none mb-1"
                style={{ color: step.color }}
              >
                {step.value}
              </div>
              <div 
                className="text-[11px] text-[#5a7090]"
                dangerouslySetInnerHTML={{ __html: step.label }}
              />
            </motion.div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="px-4 py-3.5 border-t border-[rgba(100,160,255,0.1)] flex items-center justify-between">
          <div className="text-xs text-[#5a7090]">Realisasi Subsidi</div>
          <div className="flex-1 mx-4 h-1.5 bg-[#1e2838] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: "98.6%",
                background: "linear-gradient(90deg, #a8ff3e, #2edc7a)"
              }}
            />
          </div>
          <div className="font-mono text-xs font-bold text-[#a8ff3e]">98.6%</div>
        </div>
      </ChartCard>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Subsidi per Jenis Komoditas Input" action="Export">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Jenis Subsidi</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Token Dicetak</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Redeemed</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsidiTypes.map((item, index) => (
                <TableRow 
                  key={index}
                  className="border-b border-[rgba(100,160,255,0.1)] hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="text-xs text-[#d0dff0]">{item.type}</TableCell>
                  <TableCell className="text-xs text-[#d0dff0]">{item.minted}</TableCell>
                  <TableCell className="text-xs text-[#d0dff0]">{item.redeemed}</TableCell>
                  <TableCell style={{ color: item.rateColor }} className="text-xs">
                    {item.rate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>

        <ChartCard title="Kios Resmi Terdaftar On-Chain" action="Tambah Kios">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Kios</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Wilayah</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Redeemed</TableHead>
                <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kiosList.map((kios, index) => (
                <TableRow 
                  key={index}
                  className="border-b border-[rgba(100,160,255,0.1)] hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="text-xs font-semibold text-[#d0dff0]">{kios.name}</TableCell>
                  <TableCell className="text-xs text-[#d0dff0]">{kios.region}</TableCell>
                  <TableCell className="text-xs text-[#d0dff0]">{kios.redeemed}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium border ${badgeStyles[kios.statusColor]}`}>
                      {kios.status}
                    </span>
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
