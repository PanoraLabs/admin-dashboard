"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Province {
  id: string;
  name: string;
  path: string;
  fill: string;
  stroke: string;
  volume: string;
  kop: string;
  petani: string;
}

const provinces: Province[] = [
  { 
    id: "sumatera",
    name: "Sumatera",
    path: "M60 180 Q90 140 130 120 Q165 105 195 115 Q220 125 235 150 Q245 170 235 190 Q215 205 185 208 Q150 210 110 200 Q75 192 60 180Z",
    fill: "rgba(168,255,62,0.18)",
    stroke: "rgba(168,255,62,0.5)",
    volume: "8,420T Jagung + Padi",
    kop: "62 koperasi",
    petani: "3,840 petani",
  },
  { 
    id: "jawa",
    name: "Jawa",
    path: "M255 185 Q290 175 340 170 Q395 168 440 173 Q470 178 475 190 Q472 202 445 207 Q395 212 340 210 Q285 207 258 198 Q250 193 255 185Z",
    fill: "rgba(56,217,245,0.25)",
    stroke: "rgba(56,217,245,0.6)",
    volume: "21,130T Jagung + Padi + Sayur",
    kop: "148 koperasi",
    petani: "82,400 petani",
  },
  { 
    id: "kalimantan",
    name: "Kalimantan",
    path: "M290 80 Q330 58 380 52 Q430 48 465 62 Q492 76 496 98 Q498 118 480 134 Q458 148 425 150 Q390 148 360 134 Q326 118 310 98 Q298 88 290 80Z",
    fill: "rgba(255,184,48,0.15)",
    stroke: "rgba(255,184,48,0.4)",
    volume: "4,820T Padi + Kedelai",
    kop: "38 koperasi",
    petani: "18,200 petani",
  },
  { 
    id: "sulawesi",
    name: "Sulawesi",
    path: "M500 95 Q520 82 540 88 Q554 98 550 115 Q545 130 532 134 Q518 136 508 126 Q498 114 500 95Z M548 105 Q566 94 578 100 Q585 112 577 122 Q567 130 558 124 Q548 116 548 105Z",
    fill: "rgba(196,122,255,0.18)",
    stroke: "rgba(196,122,255,0.5)",
    volume: "7,180T Jagung + Padi",
    kop: "52 koperasi",
    petani: "24,600 petani",
  },
  { 
    id: "papua",
    name: "Papua",
    path: "M588 148 Q620 132 655 135 Q678 140 682 158 Q680 176 660 184 Q638 190 615 182 Q596 170 588 148Z",
    fill: "rgba(74,142,255,0.15)",
    stroke: "rgba(74,142,255,0.4)",
    volume: "2,240T Padi + Sagu",
    kop: "14 koperasi",
    petani: "6,800 petani",
  },
];

const flowLines = [
  { d: "M255 190 Q215 175 200 175", color: "#a8ff3e", dur: "2s" },
  { d: "M360 170 Q355 140 360 135", color: "#38d9f5", dur: "2.5s" },
  { d: "M470 180 Q495 155 500 130", color: "#c47aff", dur: "3s" },
];

const routes = [
  { from: "Jawa Tengah", to: "Jakarta", commodity: "Cabai", vol: "42T", status: "Optimal", statusColor: "lime" },
  { from: "DIY", to: "Bekasi", commodity: "Jagung", vol: "38T", status: "Optimal", statusColor: "lime" },
  { from: "Jawa Timur", to: "Kaltim", commodity: "Padi", vol: "31T", status: "Pending", statusColor: "amber" },
  { from: "Sul. Sel", to: "Maluku", commodity: "Beras", vol: "18T", status: "Berjalan", statusColor: "cyan" },
  { from: "Sulawesi", to: "Papua", commodity: "Kedelai", vol: "12T", status: "Shortage", statusColor: "amber" },
];

const badgeStyles: Record<string, string> = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.25)]",
  cyan: "bg-[rgba(56,217,245,0.1)] text-[#38d9f5] border-[rgba(56,217,245,0.25)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.25)]",
};

export default function PetaPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#5a7090] mb-1.5">
          // Choropleth · Real-time Stock Flow
        </div>
        <h1 className="font-serif italic text-[28px] text-[#d0dff0] mb-1">
          Peta <span className="not-italic font-heading font-black text-[#a8ff3e]">Distribusi Nasional</span>
        </h1>
        <p className="text-[13px] text-[#5a7090]">
          Visualisasi aliran pangan antar-provinsi · Intensitas warna = volume stok · Click provinsi untuk detail
        </p>
      </motion.div>

      {/* Map + Detail */}
      <div className="grid grid-cols-[3fr_2fr] gap-4">
        {/* Map */}
        <ChartCard title="Peta Stok & Aliran Pangan Indonesia">
          <div className="relative bg-[#182030] rounded-lg overflow-hidden min-h-[280px]">
            <svg viewBox="0 0 700 340" width="100%" className="block">
              <defs>
                <filter id="glow2">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(56,217,245,0.04)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="700" height="340" fill="url(#bgGrad)" />
              {/* Grid lines */}
              <path d="M0 170 H700 M350 0 V340" stroke="rgba(100,160,255,0.04)" strokeWidth="1" />
              
              {/* Provinces */}
              {provinces.map((prov) => (
                <g key={prov.id} className="cursor-pointer group">
                  <path
                    d={prov.path}
                    fill={prov.fill}
                    stroke={prov.stroke}
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:brightness-125"
                  />
                </g>
              ))}

              {/* Province labels */}
              <text x="148" y="168" fill="rgba(208,223,240,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">SUMATERA</text>
              <text x="148" y="180" fill="rgba(168,255,62,0.8)" fontSize="8" fontFamily="monospace" textAnchor="middle">8,420T</text>
              <text x="365" y="195" fill="rgba(208,223,240,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">JAWA</text>
              <text x="365" y="206" fill="rgba(56,217,245,0.9)" fontSize="8" fontFamily="monospace" textAnchor="middle">21,130T ●●●</text>
              <text x="393" y="106" fill="rgba(208,223,240,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">KALIMANTAN</text>
              <text x="393" y="118" fill="rgba(255,184,48,0.8)" fontSize="8" fontFamily="monospace" textAnchor="middle">4,820T</text>
              <text x="542" y="152" fill="rgba(196,122,255,0.8)" fontSize="8" fontFamily="monospace" textAnchor="middle">SULAWESI 7.2K</text>
              <text x="636" y="163" fill="rgba(74,142,255,0.8)" fontSize="8" fontFamily="monospace" textAnchor="middle">PAPUA 2.2K</text>

              {/* Flow arrows */}
              <g filter="url(#glow2)" opacity="0.7">
                {flowLines.map((line, i) => (
                  <path
                    key={i}
                    d={line.d}
                    stroke={line.color}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />
                ))}
              </g>

              {/* Pulsing nodes */}
              <circle cx="365" cy="190" r="6" fill="rgba(56,217,245,0.3)" stroke="#38d9f5" strokeWidth="1">
                <animate attributeName="r" from="6" to="16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="148" cy="172" r="5" fill="rgba(168,255,62,0.3)" stroke="#a8ff3e" strokeWidth="1">
                <animate attributeName="r" from="5" to="14" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-[rgba(7,10,15,0.85)] border border-[rgba(100,160,255,0.1)] rounded-md p-2.5">
              <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[#5a7090] mb-2">
                Volume Stok
              </div>
              {[
                { color: "rgba(56,217,245,0.6)", label: "Sangat Tinggi (>10K T)" },
                { color: "rgba(168,255,62,0.5)", label: "Tinggi (5-10K T)" },
                { color: "rgba(255,184,48,0.5)", label: "Sedang (2-5K T)" },
                { color: "rgba(74,142,255,0.4)", label: "Rendah (<2K T)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px] text-[#5a7090]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Detail Panel */}
        <div className="space-y-4">
          <ChartCard title="Detail Provinsi" action={<Badge variant="outline" className={badgeStyles.lime}>Klik Peta</Badge>}>
            <div className="p-4 text-center py-10 text-[#5a7090]">
              <div className="text-[28px] mb-2">🗺️</div>
              <div className="text-[13px]">Klik provinsi pada peta untuk melihat detail data distribusi</div>
            </div>
          </ChartCard>

          <ChartCard title="Aliran Komoditas Terbesar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(100,160,255,0.1)] hover:bg-transparent">
                  <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Rute</TableHead>
                  <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Komoditas</TableHead>
                  <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Vol/Hari</TableHead>
                  <TableHead className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#5a7090] font-normal">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route, index) => (
                  <TableRow 
                    key={index}
                    className="border-b border-[rgba(100,160,255,0.1)] hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="text-xs text-[#d0dff0]">{route.from} → {route.to}</TableCell>
                    <TableCell className="text-xs text-[#d0dff0]">{route.commodity}</TableCell>
                    <TableCell className="text-xs text-[#d0dff0]">{route.vol}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeStyles[route.statusColor]}>
                        {route.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
