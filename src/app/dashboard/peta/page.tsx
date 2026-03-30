"use client";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
    fill: "rgba(17,24,39,0.15)",
    stroke: "#111827",
    volume: "8,420T Jagung + Padi",
    kop: "62 koperasi",
    petani: "3,840 petani",
  },
  { 
    id: "jawa",
    name: "Jawa",
    path: "M255 185 Q290 175 340 170 Q395 168 440 173 Q470 178 475 190 Q472 202 445 207 Q395 212 340 210 Q285 207 258 198 Q250 193 255 185Z",
    fill: "rgba(0,209,255,0.25)",
    stroke: "#00D1FF",
    volume: "21,130T Jagung + Padi + Sayur",
    kop: "148 koperasi",
    petani: "82,400 petani",
  },
  { 
    id: "kalimantan",
    name: "Kalimantan",
    path: "M290 80 Q330 58 380 52 Q430 48 465 62 Q492 76 496 98 Q498 118 480 134 Q458 148 425 150 Q390 148 360 134 Q326 118 310 98 Q298 88 290 80Z",
    fill: "rgba(255,107,0,0.12)",
    stroke: "#FF6B00",
    volume: "4,820T Padi + Kedelai",
    kop: "38 koperasi",
    petani: "18,200 petani",
  },
  { 
    id: "sulawesi",
    name: "Sulawesi",
    path: "M500 95 Q520 82 540 88 Q554 98 550 115 Q545 130 532 134 Q518 136 508 126 Q498 114 500 95Z M548 105 Q566 94 578 100 Q585 112 577 122 Q567 130 558 124 Q548 116 548 105Z",
    fill: "rgba(17,24,39,0.12)",
    stroke: "#6B7280",
    volume: "7,180T Jagung + Padi",
    kop: "52 koperasi",
    petani: "24,600 petani",
  },
  { 
    id: "papua",
    name: "Papua",
    path: "M588 148 Q620 132 655 135 Q678 140 682 158 Q680 176 660 184 Q638 190 615 182 Q596 170 588 148Z",
    fill: "rgba(17,24,39,0.10)",
    stroke: "#9CA3AF",
    volume: "2,240T Padi + Sagu",
    kop: "14 koperasi",
    petani: "6,800 petani",
  },
];

const flowLines = [
  { d: "M255 190 Q215 175 200 175", color: "#111827" },
  { d: "M360 170 Q355 140 360 135", color: "#00D1FF" },
  { d: "M470 180 Q495 155 500 130", color: "#6B7280" },
];

const routes = [
  { from: "jawa tengah", to: "jakarta", commodity: "cabai", vol: "42T", status: "optimal", statusColor: "teal" },
  { from: "DIY", to: "bekasi", commodity: "jagung", vol: "38T", status: "optimal", statusColor: "teal" },
  { from: "jawa timur", to: "kaltim", commodity: "padi", vol: "31T", status: "pending", statusColor: "orange" },
  { from: "sul. sel", to: "maluku", commodity: "beras", vol: "18T", status: "aktif", statusColor: "teal" },
  { from: "sulawesi", to: "papua", commodity: "kedelai", vol: "12T", status: "bermasalah", statusColor: "orange" },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#111827] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
};

export default function PetaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.15em] text-[#6B7280] mb-1">
          choropleth · real-time stock flow
        </div>
        <h1 className="font-heading text-[28px] text-[#111827] mb-1 tracking-tight">
          peta <span className="text-[#00D1FF]">distribusi nasional</span>
        </h1>
        <p className="text-[13px] text-[#6B7280]">
          visualisasi aliran pangan antar-provinsi · intensitas warna = volume stok · klik provinsi untuk detail
        </p>
      </div>

      {/* Map + Detail */}
      <div className="grid grid-cols-[3fr_2fr] gap-4">
        {/* Map */}
        <ChartCard title="peta stok & aliran pangan indonesia">
          <div className="relative bg-white border border-[#E5E7EB] overflow-hidden min-h-[280px]">
            <svg viewBox="0 0 700 340" width="100%" className="block">
              {/* Grid lines - subtle */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(17,24,39,0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="700" height="340" fill="url(#grid)" />
              
              {/* Provinces */}
              {provinces.map((prov) => (
                <g key={prov.id} className="cursor-pointer group">
                  <path
                    d={prov.path}
                    fill={prov.fill}
                    stroke={prov.stroke}
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:opacity-80"
                  />
                </g>
              ))}

              {/* Province labels */}
              <text x="148" y="168" fill="#6B7280" fontSize="9" fontFamily="monospace" textAnchor="middle">SUMATERA</text>
              <text x="148" y="180" fill="#111827" fontSize="8" fontFamily="monospace" textAnchor="middle">8,420T</text>
              <text x="365" y="195" fill="#6B7280" fontSize="9" fontFamily="monospace" textAnchor="middle">JAWA</text>
              <text x="365" y="206" fill="#00D1FF" fontSize="8" fontFamily="monospace" textAnchor="middle">21,130T</text>
              <text x="393" y="106" fill="#6B7280" fontSize="9" fontFamily="monospace" textAnchor="middle">KALIMANTAN</text>
              <text x="393" y="118" fill="#FF6B00" fontSize="8" fontFamily="monospace" textAnchor="middle">4,820T</text>
              <text x="542" y="152" fill="#6B7280" fontSize="8" fontFamily="monospace" textAnchor="middle">SULAWESI 7.2K</text>
              <text x="636" y="163" fill="#9CA3AF" fontSize="8" fontFamily="monospace" textAnchor="middle">PAPUA 2.2K</text>

              {/* Flow arrows */}
              <g opacity="0.6">
                {flowLines.map((line, i) => (
                  <path
                    key={i}
                    d={line.d}
                    stroke={line.color}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="4,3"
                  />
                ))}
              </g>

              {/* Pulsing nodes */}
              <circle cx="365" cy="190" r="4" fill="rgba(0,209,255,0.3)" stroke="#00D1FF" strokeWidth="1" />
              <circle cx="148" cy="172" r="3" fill="rgba(17,24,39,0.2)" stroke="#111827" strokeWidth="1" />
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-white border border-[#111827] p-3">
              <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#6B7280] mb-2">
                volume stok
              </div>
              {[
                { color: "rgba(0,209,255,0.5)", label: "sangat tinggi (>10K T)" },
                { color: "rgba(17,24,39,0.15)", label: "tinggi (5-10K T)" },
                { color: "rgba(255,107,0,0.4)", label: "sedang (2-5K T)" },
                { color: "rgba(107,114,128,0.3)", label: "rendah (<2K T)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                  <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px] text-[#6B7280]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Detail Panel */}
        <div className="space-y-4">
          <ChartCard title="detail provinsi" action={<Badge variant="outline" className={badgeStyles.teal}>klik peta</Badge>}>
            <div className="p-4 text-center py-10 text-[#6B7280]">
              <div className="text-[11px] text-[#9CA3AF] mb-1">⊞</div>
              <div className="text-[13px]">klik provinsi pada peta untuk melihat detail data distribusi</div>
            </div>
          </ChartCard>

          <ChartCard title="aliran komoditas terbesar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#111827] hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">rute</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">komoditas</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">vol/hari</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] font-normal">status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route, index) => (
                  <TableRow 
                    key={index}
                    className={cn(
                      "border-b border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors",
                      index % 2 === 1 ? "bg-[#F9FAFB]" : "bg-white"
                    )}
                  >
                    <TableCell className="text-xs text-[#111827]">{route.from} → {route.to}</TableCell>
                    <TableCell className="text-xs text-[#111827]">{route.commodity}</TableCell>
                    <TableCell className="text-xs text-[#111827]">{route.vol}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeStyles[route.statusColor as keyof typeof badgeStyles]}>
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
