"use client";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <div className="bg-white border border-[#111827] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#111827] flex items-center justify-between bg-[#F9FAFB]">
        <div className="text-[13px] font-semibold text-[#111827]">
          {title}
        </div>
        {action && (
          <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#6B7280] cursor-pointer transition-colors hover:text-[#00D1FF]">
            {action}
          </div>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
