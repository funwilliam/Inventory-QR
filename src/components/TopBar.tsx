import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function TopBar({ title, subtitle, right }: Props) {
  return (
    <div className="safe-pt safe-px px-4 pt-3 pb-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold truncate">{title}</div>
          {subtitle ? <div className="text-xs text-slate-400 truncate">{subtitle}</div> : null}
        </div>
        {right}
      </div>
    </div>
  );
}
