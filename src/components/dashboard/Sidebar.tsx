"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: {
    text: string;
    variant: "lime" | "red" | "amber";
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Monitoring",
    items: [
      {
        label: "Overview KPI",
        href: "/dashboard/overview",
        icon: "⬡",
        badge: { text: "Live", variant: "lime" },
      },
      {
        label: "Peta Distribusi",
        href: "/dashboard/peta",
        icon: "🗺",
      },
      {
        label: "Smart Contract",
        href: "/dashboard/smart-contract",
        icon: "⛓",
        badge: { text: "3 Alert", variant: "amber" },
      },
    ],
  },
  {
    title: "Manajemen",
    items: [
      {
        label: "Verifikasi KYC",
        href: "/dashboard/kyc-verification",
        icon: "👥",
        badge: { text: "12", variant: "red" },
      },
      {
        label: "Pantau Subsidi",
        href: "/dashboard/subsidi",
        icon: "🎟",
      },
      {
        label: "Laporan Regulasi",
        href: "/dashboard/laporan",
        icon: "📊",
      },
    ],
  },
  {
    title: "Sistem",
    items: [
      {
        label: "Pengaturan",
        href: "#",
        icon: "⚙",
      },
      {
        label: "System Log",
        href: "#",
        icon: "📋",
      },
    ],
  },
];

const badgeStyles = {
  lime: "bg-[rgba(168,255,62,0.1)] text-[#a8ff3e] border-[rgba(168,255,62,0.2)]",
  red: "bg-[rgba(255,69,96,0.1)] text-[#ff4560] border-[rgba(255,69,96,0.2)]",
  amber: "bg-[rgba(255,184,48,0.1)] text-[#ffb830] border-[rgba(255,184,48,0.2)]",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[220px] bg-[#0c1018] border-r border-[rgba(100,160,255,0.1)] flex flex-col h-screen flex-shrink-0 relative overflow-hidden"
    >
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-[rgba(168,255,62,0.04)] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="p-5 pb-4 border-b border-[rgba(100,160,255,0.1)] flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#a8ff3e] flex items-center justify-center text-[#070a0f] font-serif font-bold text-sm" 
          style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
          P
        </div>
        <div>
          <div className="text-base font-black tracking-wider text-[#d0dff0]">
            PAN<span className="text-[#a8ff3e]">ORA</span>
          </div>
        </div>
      </div>

      {/* Role info */}
      <div className="px-5 py-2.5 border-b border-[rgba(100,160,255,0.1)]">
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#a8ff3e] mb-0.5">
          // Admin · Superuser
        </div>
        <div className="text-xs font-semibold text-[#d0dff0]">
          Kementan / PANORA HQ
        </div>
        <div className="text-[10px] text-[#5a7090]">
          National Food Chain Monitor
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 scrollbar-hide">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className="px-3 mb-1">
            <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-[#5a7090] px-2 py-2 pb-1">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 relative",
                    isActive
                      ? "bg-[rgba(168,255,62,0.1)] border border-[rgba(168,255,62,0.2)]"
                      : "hover:bg-[#182030] border border-transparent"
                  )}
                >
                  <span className={cn(
                    "text-[15px] w-[18px] text-center flex-shrink-0 transition-colors",
                    isActive ? "text-[#a8ff3e]" : "text-[#5a7090]"
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold transition-colors",
                    isActive ? "text-[#a8ff3e]" : "text-[#5a7090] hover:text-[#d0dff0]"
                  )}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full",
                        badgeStyles[item.badge.variant]
                      )}
                    >
                      {item.badge.text}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </ScrollArea>

      {/* User info */}
      <div className="p-3.5 border-t border-[rgba(100,160,255,0.1)] flex items-center gap-2">
        <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#4a8eff] to-[#2a5a9a] flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-[#d0dff0] truncate">
            Admin PANORA
          </div>
          <div className="text-[9px] text-[#5a7090] font-mono truncate">
            superuser@panora.id
          </div>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-[rgba(153,69,255,0.12)] border border-[rgba(153,69,255,0.2)]">
          <div className="w-[5px] h-[5px] bg-[#9945ff] rounded-full shadow-[0_0_5px_rgba(153,69,255,0.7)]" />
          <span className="font-mono text-[8px] text-[#9945ff] tracking-wider">SOL</span>
        </div>
      </div>
    </motion.aside>
  );
}
