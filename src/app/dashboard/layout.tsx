"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Ticker } from "@/components/dashboard/Ticker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden grid-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Ticker />
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
