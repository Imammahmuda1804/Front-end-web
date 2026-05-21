import type { ElementType } from 'react';
import { GitCompare, Tags, Target, TrendingUp } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import type { DestinationAnalytics } from '@/services/admin/analytics.service';
import type { DestinationOption, Mode, MetricRow } from './CompareClient';
import { sentimentRate } from './CompareClient';
export function ComparisonHeroPanel({
  activeTab,
  dA,
  dB,
  biggestDelta,
  singleData,
}: {
  activeTab: Mode;
  dA?: DestinationAnalytics;
  dB?: DestinationAnalytics;
  biggestDelta: MetricRow | null;
  singleData: DestinationAnalytics | null;
}) {
  const comparisonGap = biggestDelta ? `${Math.abs(biggestDelta.a - biggestDelta.b).toFixed(biggestDelta.format === 'rating' ? 1 : 0)}${biggestDelta.format === 'percent' ? '%' : ''}` : '-';
  const trendSignal = activeTab === 'compare' && dA && dB
    ? `${sentimentRate(dA)}% vs ${sentimentRate(dB)}%`
    : singleData
      ? `${sentimentRate(singleData)}% positif`
      : '-';

  return (
    <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <GitCompare className="h-3.5 w-3.5" />
            Compare Intelligence
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Compare Analytics</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
            Ruang analisis admin untuk membaca selisih performa, kualitas sinyal, tren sentimen, dan topik pembeda antar destinasi.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
          <HeroInsightCard label="Selisih skor" value={comparisonGap} helper={biggestDelta?.label || 'Belum ada pembanding'} icon={Target} tone="orange" />
          <HeroInsightCard label="Tren positif" value={trendSignal} helper="Rasio sentimen positif" icon={TrendingUp} tone="emerald" />
          <HeroInsightCard label="Topik pembeda" value={activeTab === 'compare' ? String((dA?.topics?.length || 0) + (dB?.topics?.length || 0)) : String(singleData?.topics?.length || 0)} helper="Topik tersedia" icon={Tags} tone="blue" />
        </div>
      </div>
    </section>
  );
}

export function HeroInsightCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: 'orange' | 'blue' | 'emerald' }) {
  const toneClass = {
    orange: 'border-orange-100 bg-white text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  }[tone];

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClass}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </div>
  );
}

export function ModeButton({ mode, activeTab, onClick, icon: Icon, label }: { mode: Mode; activeTab: Mode; onClick: (mode: Mode) => void; icon: ElementType; label: string }) {
  const active = activeTab === mode;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active ? 'true' : 'false'}
      onClick={() => onClick(mode)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition-all ${
        active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function DestinationSelect({ label, value, destinations, tone, onChange }: { label: string; value: number | ''; destinations: DestinationOption[]; tone: 'orange' | 'blue'; onChange: (value: number | '') => void }) {
  const accent = tone === 'orange' ? 'text-primary' : 'text-ai';
  const options = destinations.map((destination) => ({
    value: String(destination.id),
    label: destination.name,
  }));

  return (
    <label className="min-w-0 flex-1">
      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.16em] ${accent}`}>{label}</span>
      <NativeSelect
        aria-label={`Pilih ${label.toLowerCase()}`}
        value={value ? String(value) : ''}
        onValueChange={(nextValue) => onChange(nextValue ? Number(nextValue) : '')}
        options={options}
        placeholder="Pilih destinasi"
        searchable
        searchPlaceholder="Cari nama destinasi..."
      />
    </label>
  );
}


