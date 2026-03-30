"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: {
    text: string;
    variant: "teal" | "orange" | "neutral";
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "monitoring",
    items: [
      {
        label: "overview kpi",
        href: "/dashboard/overview",
        icon: "◈",
        badge: { text: "live", variant: "teal" },
      },
      {
        label: "peta distribusi",
        href: "/dashboard/peta",
        icon: "⊞",
      },
      {
        label: "smart contract",
        href: "/dashboard/smart-contract",
        icon: "∞",
        badge: { text: "3 alert", variant: "orange" },
      },
    ],
  },
  {
    title: "manajemen",
    items: [
      {
        label: "verifikasi kyc",
        href: "/dashboard/kyc-verification",
        icon: "☰",
        badge: { text: "12", variant: "orange" },
      },
      {
        label: "pantau subsidi",
        href: "/dashboard/subsidi",
        icon: "◎",
      },
      {
        label: "laporan regulasi",
        href: "/dashboard/laporan",
        icon: "▤",
      },
    ],
  },
  {
    title: "sistem",
    items: [
      {
        label: "pengaturan",
        href: "#",
        icon: "⌘",
      },
      {
        label: "system log",
        href: "#",
        icon: "▦",
      },
    ],
  },
];

const badgeStyles = {
  teal: "bg-[rgba(0,209,255,0.1)] text-[#00D1FF] border-[#111827]",
  orange: "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
  neutral: "bg-[#F3F4F6] text-[#6B7280] border-[#111827]",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] bg-white border-r border-[#111827] flex flex-col h-screen flex-shrink-0 relative">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-[#111827] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#111827] flex items-center justify-center text-[#F9FAFB] font-heading text-sm">
          P
        </div>
        <div>
          <div className="text-base font-heading tracking-tight text-[#111827]">
            panora
          </div>
        </div>
      </div>

      {/* Role info */}
      <div className="px-5 py-3 border-b border-[#111827]">
        <div className="font-mono text-[10px] tracking-wider text-[#00D1FF] mb-1">
          admin · superuser
        </div>
        <div className="text-xs font-semibold text-[#111827]">
          kementan / panora hq
        </div>
        <div className="text-[10px] text-[#6B7280]">
          national food chain monitor
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 scrollbar-hide">
        {navSections.map((section) => (
          <div key={section.title} className="px-4 mb-1">
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#6B7280] px-2 py-2 pb-1">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 transition-all duration-150 relative",
                    isActive
                      ? "bg-[#F3F4F6] border border-[#111827]"
                      : "hover:bg-[#F3F4F6] border border-transparent"
                  )}
                >
                  <span className={cn(
                    "text-[14px] w-[18px] text-center flex-shrink-0 transition-colors",
                    isActive ? "text-[#00D1FF]" : "text-[#6B7280]"
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-[#111827]" : "text-[#6B7280] hover:text-[#111827]"
                  )}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto text-[9px] font-mono px-1.5 py-0 rounded-none",
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
      <div className="p-4 border-t border-[#111827] flex items-center gap-3">
        <div className="w-[32px] h-[32px] bg-[#111827] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-[#111827] truncate">
            admin panora
          </div>
          <div className="text-[9px] text-[#6B7280] font-mono truncate">
            superuser@panora.id
          </div>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-1 border border-[#111827]">
          <div className="w-[6px] h-[6px] bg-[#00D1FF]" />
          <span className="font-mono text-[8px] text-[#111827] tracking-wider">sol</span>
        </div>
      </div>
    </aside>
  );
}
