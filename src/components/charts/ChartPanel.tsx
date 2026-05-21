import type { ElementType, ReactNode } from 'react';

type ChartPanelProps = {
  icon: ElementType;
  title: string;
  children: ReactNode;
  minHeight?: string;
};

export function ChartPanel({ icon: Icon, title, children, minHeight = 'h-80' }: ChartPanelProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-ai" />
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      <div className={`${minHeight} w-full min-w-0`}>{children}</div>
    </div>
  );
}

export function ChartLoadingPanel({ icon: Icon, title, minHeight = 'h-80' }: Omit<ChartPanelProps, 'children'>) {
  return (
    <ChartPanel icon={Icon} title={title} minHeight={minHeight}>
      <div className="h-full w-full animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
    </ChartPanel>
  );
}
