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
    <div className="flex h-screen bg-[#070a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Ticker />
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 px-6 scrollbar-thin scrollbar-thumb-[#1e2838] scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
