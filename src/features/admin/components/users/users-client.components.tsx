import React from 'react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminUser } from '../../services/user.service';

export function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: 'orange' | 'emerald' | 'blue';
}) {
  const toneClass = {
    orange: 'bg-orange-100 text-explore',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-sky-100 text-blue-500',
  }[tone];

  return (
    <div className="rounded-lg border border-white/80 bg-white/80 p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

export function HealthCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ElementType;
  tone: 'orange' | 'emerald' | 'rose' | 'blue';
}) {
  const toneClass = {
    orange: 'bg-orange-50 text-explore',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-sky-50 text-blue-500',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{caption}</p>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-explore">
        {label}
      </span>
      <NativeSelect
        aria-label={`Filter ${label.toLowerCase()} pengguna`}
        value={value}
        onValueChange={onChange}
        options={options}
        className="bg-white"
      />
    </div>
  );
}

export function RoleBadge({ role }: { role: AdminUser['role'] }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        isAdmin
          ? 'bg-orange-50 text-explore ring-1 ring-orange-200'
          : 'bg-sky-50 text-blue-500 ring-1 ring-sky-200'
      }`}
    >
      {isAdmin ? 'Admin' : 'User'}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      {isActive ? 'Aktif' : 'Ditangguhkan'}
    </span>
  );
}

export function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      className="h-10 w-10 rounded-full border-slate-200 bg-white"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function DistributionCard({
  title,
  description,
  firstLabel,
  firstValue,
  firstColor,
  secondLabel,
  secondValue,
  secondColor,
}: {
  title: string;
  description: string;
  firstLabel: string;
  firstValue: number;
  firstColor: string;
  secondLabel: string;
  secondValue: number;
  secondColor: string;
}) {
  const total = Math.max(firstValue + secondValue, 1);
  const firstPercent = Math.round((firstValue / total) * 100);
  const secondPercent = 100 - firstPercent;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className={firstColor} style={{ width: `${firstPercent}%` }} />
        <div className={secondColor} style={{ width: `${secondPercent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <DistributionLegend label={firstLabel} value={firstValue} color={firstColor} />
        <DistributionLegend label={secondLabel} value={secondValue} color={secondColor} />
      </div>
    </div>
  );
}

function DistributionLegend({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs font-bold text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

export function QueueItem({
  icon: Icon,
  title,
  caption,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  caption: string;
  tone: 'orange' | 'rose' | 'blue';
}) {
  const toneClass = {
    orange: 'bg-orange-50 text-explore',
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-sky-50 text-blue-500',
  }[tone];

  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{caption}</p>
      </div>
    </div>
  );
}
