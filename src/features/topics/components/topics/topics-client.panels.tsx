import React from 'react';
import { AlertTriangle, ArrowUpDown, BarChart3, CheckCircle2, GitMerge, Layers3, Loader2, MapPin, Pencil, Search, Sparkles, Tags, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminDestination } from '@/features/admin';
import type { TopicGroupItem, TopicItem } from '../../services/topic.service';
import type { ActionItem, QuickFilter, SortDir, SortKey, TopicStatus, Tone } from './topics-client.types';
export function TopicHeroPanel({ topicHealth, namingDebt, coverage }: { topicHealth: number; namingDebt: number; coverage: number }) {
  const insights = [
    { label: 'Kerapian topik', value: `${topicHealth}%`, helper: 'Nama dan kata kunci tersedia', icon: CheckCircle2, tone: 'emerald' as Tone },
    { label: 'Perlu penamaan', value: String(namingDebt), helper: 'Topik generik perlu dirapikan', icon: Sparkles, tone: namingDebt > 0 ? 'amber' as Tone : 'emerald' as Tone },
    { label: 'Cakupan destinasi', value: String(coverage), helper: 'Relasi topik ke destinasi', icon: Layers3, tone: 'blue' as Tone },
  ];

  return (
    <section className="rounded-lg border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <Tags className="h-3.5 w-3.5" />
            Peta Pengalaman
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Manajemen Topik</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
            Rapikan pembahasan dari ulasan, cek topik yang perlu digabung, dan baca konteks tiap destinasi agar keputusan promosi atau perbaikan lebih jelas.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
          {insights.map((insight) => <HeroInsightCard key={insight.label} {...insight} />)}
        </div>
      </div>
    </section>
  );
}

export function TopicsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
      <h1 className="text-xl font-black text-red-900">Gagal memuat topik</h1>
      <p className="mt-2 text-sm font-semibold text-red-600">Periksa koneksi API atau sesi admin, lalu coba ulang.</p>
      <Button onClick={onRetry} className="mt-5 rounded-lg">
        Coba lagi
      </Button>
    </div>
  );
}

export function TopicMetricsGrid({
  totalTopics,
  totalDestLinks,
  unnamedCount,
  averageCoverage,
}: {
  totalTopics: number;
  totalDestLinks: number;
  unnamedCount: number;
  averageCoverage: string;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Tags} label="Total topik" value={String(totalTopics)} helper="Aktif" tone="orange" />
      <MetricCard icon={MapPin} label="Relasi Destinasi" value={String(totalDestLinks)} helper="Terhubung" tone="blue" />
      <MetricCard icon={AlertTriangle} label="Perlu penamaan" value={String(unnamedCount)} helper="Nama perlu dirapikan" tone={unnamedCount > 0 ? 'amber' : 'emerald'} />
      <MetricCard icon={BarChart3} label="Rata-rata cakupan" value={averageCoverage} helper="Per topik" tone="slate" />
    </section>
  );
}

export function TopicCommandPanel({
  search,
  sortKey,
  sortDir,
  quickFilter,
  groupFilter,
  destinationFilter,
  destinations,
  destinationsLoading,
  groups,
  unnamedCount,
  aiRenamePending,
  onSearchChange,
  onSortKeyChange,
  onSortDirChange,
  onQuickFilterChange,
  onGroupFilterChange,
  onDestinationFilterChange,
  onAiRename,
  onOpenMerge,
  onReset,
}: {
  search: string;
  sortKey: SortKey;
  sortDir: SortDir;
  quickFilter: QuickFilter;
  groupFilter: string;
  destinationFilter: number | 'all';
  destinations: AdminDestination[];
  destinationsLoading: boolean;
  groups: TopicGroupItem[];
  unnamedCount: number;
  aiRenamePending: boolean;
  onSearchChange: (value: string) => void;
  onSortKeyChange: (value: SortKey) => void;
  onSortDirChange: (value: SortDir) => void;
  onQuickFilterChange: (value: QuickFilter) => void;
  onGroupFilterChange: (value: string) => void;
  onDestinationFilterChange: (value: number | 'all') => void;
  onAiRename: () => void;
  onOpenMerge: () => void;
  onReset: () => void;
}) {
  const quickFilters: Array<{ value: QuickFilter; label: string }> = [
    { value: 'all', label: 'Semua' },
    { value: 'unnamed', label: 'Perlu nama' },
    { value: 'dominant', label: 'Dominan' },
    { value: 'longtail', label: 'Topik kecil' },
    { value: 'noKeywords', label: 'Tanpa kata kunci' },
  ];

  return (
    <section className="sticky top-4 z-20 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(15rem,1fr)_minmax(14rem,1fr)_10rem_10rem_12rem]">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-primary">Cari topik</span>
            <span className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama topik..."
                className="min-h-12 rounded-lg border-slate-200 bg-slate-50 pl-11 font-semibold"
              />
            </span>
          </label>

          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">Destinasi</span>
            <NativeSelect
              aria-label="Filter topik berdasarkan destinasi"
              value={destinationFilter === 'all' ? 'all' : String(destinationFilter)}
              onValueChange={(value) => onDestinationFilterChange(value === 'all' ? 'all' : Number(value))}
              disabled={destinationsLoading}
              searchable
              searchPlaceholder="Cari destinasi..."
              options={[
                { value: 'all', label: destinationsLoading ? 'Memuat destinasi...' : 'Semua destinasi' },
                ...destinations.map((destination) => ({
                  value: String(destination.id),
                  label: destination.city ? `${destination.name}, ${destination.city}` : destination.name,
                })),
              ]}
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">Urutkan</span>
            <NativeSelect
              aria-label="Urutkan topik"
              value={sortKey}
              onValueChange={(value) => onSortKeyChange(value as SortKey)}
              options={[
                { value: 'destinations', label: 'Destinasi', description: 'Jumlah relasi terbanyak' },
                { value: 'name', label: 'Nama', description: 'Urut berdasarkan nama topik' },
                { value: 'id', label: 'ID', description: 'Urut berdasarkan ID data' },
              ]}
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">Arah</span>
            <NativeSelect
              aria-label="Pilih arah urutan topik"
              value={sortDir}
              onValueChange={(value) => onSortDirChange(value as SortDir)}
              options={[
                { value: 'desc', label: 'Terbesar', description: 'Nilai tinggi lebih dulu' },
                { value: 'asc', label: 'Terkecil', description: 'Nilai rendah lebih dulu' },
              ]}
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">Group</span>
            <NativeSelect
              aria-label="Filter group topik"
              value={groupFilter}
              onValueChange={onGroupFilterChange}
              options={[
                { value: 'all', label: 'Semua group' },
                { value: 'none', label: 'Belum dipetakan' },
                ...groups.map((group) => ({
                  value: String(group.id),
                  label: group.group_name,
                })),
              ]}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 2xl:flex 2xl:items-center">
          <Button
            type="button"
            onClick={onOpenMerge}
            variant="outline"
            className="min-h-12 whitespace-nowrap rounded-lg px-4 font-black text-amber-700 hover:border-sky-200 hover:bg-sky-50"
          >
            <GitMerge className="h-4 w-4" />
            Gabungkan
          </Button>
          
          <Button type="button" onClick={onReset} variant="outline" className="min-h-12 whitespace-nowrap rounded-lg px-4 font-black">
            Reset
          </Button>
          
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter cepat topik">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onQuickFilterChange(filter.value)}
            className={`min-h-10 rounded-lg border px-4 text-sm font-black transition ${
              quickFilter === filter.value
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {filter.label}
          </button>
        ))}
        <Button
            type="button"
            onClick={onAiRename}
            disabled={aiRenamePending || unnamedCount === 0}
            className="min-h-12 rounded-lg bg-white px-4 font-black text-amber-400 shadow-sm shadow-amber-300 hover:bg-primary/90"
          >
            {aiRenamePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Bantu beri nama ({unnamedCount})
          </Button>
      </div>
    </section>
  );
}

export function TopicDestinationContextPanel({
  destination,
  topicsCount,
  totalReviewSignals,
  onClear,
}: {
  destination: AdminDestination | null;
  topicsCount: number;
  totalReviewSignals: number;
  onClear: () => void;
}) {
  if (!destination) return null;

  return (
    <section className="rounded-lg border border-sky-100 bg-sky-50/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-ai">
            <MapPin className="h-3.5 w-3.5" />
            Filter destinasi aktif
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{destination.name}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            Menampilkan topik yang muncul pada destinasi ini. Gunakan daftar ini untuk mengecek pembahasan yang paling memengaruhi persepsi pengunjung.
          </p>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:min-w-lg">
          <div className="rounded-lg border border-white bg-white p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Topik terbaca</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{topicsCount}</p>
          </div>
          <div className="rounded-lg border border-white bg-white p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Sinyal ulasan</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{totalReviewSignals}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-16 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-sky-200 hover:text-ai focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            <X className="h-4 w-4" />
            Hapus filter
          </button>
        </div>
      </div>
    </section>
  );
}

export function TopicCloud({ topics, maxDestinations, onSelectTopic }: { topics: TopicItem[]; maxDestinations: number; onSelectTopic: (value: string) => void }) {
  return (
    <ChartShell title="Topik paling terlihat" description="Visual cepat untuk melihat pembahasan yang paling sering muncul di destinasi." icon={Tags}>
      <div className="flex min-h-72 flex-wrap items-end justify-center gap-3">
        {topics.map((topic, index) => {
          const ratio = maxDestinations > 0 ? topic.total_destinations / maxDestinations : 0;
          const size = Math.max(46, Math.round(ratio * 108));
          const isOrange = index % 2 === 0;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic.topic_name)}
              title={`${topic.topic_name} (${topic.total_destinations} destinasi)`}
              className={`flex flex-col items-center justify-center rounded-lg border text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                isOrange ? 'border-orange-200 bg-orange-50 text-primary' : 'border-sky-200 bg-sky-50 text-primary'
              }`}
              style={{ width: size + 34, height: size }}
            >
              <span className="text-lg font-black tabular-nums">{topic.total_destinations}</span>
              <span className="mt-1 line-clamp-2 px-2 text-[11px] font-bold leading-tight">{topic.topic_name}</span>
            </button>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function NamingDebtPanel({ topics, onRename }: { topics: TopicItem[]; onRename: (topic: TopicItem) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Perlu penamaan</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Topik perlu dirapikan</h3>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Tidak ada topik generik yang perlu dirapikan.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.slice(0, 5).map((topic) => (
            <div key={topic.id} className="rounded-lg border border-amber-100 bg-amber-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{topic.topic_name}</p>
                  <p className="mt-1 text-xs font-bold text-amber-700">{topic.total_destinations} destinasi terkait</p>
                </div>
                <button
                  type="button"
                  aria-label={`Rapikan nama ${topic.topic_name}`}
                  onClick={() => onRename(topic)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TopicActionQueue({ items }: { items: ActionItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400">Antrian tindakan</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Prioritas admin</h3>
        </div>
        <Target className="h-5 w-5 text-ai" />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <ActionQueueItem key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

export function ActionQueueItem({ item }: { item: ActionItem }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-blue-500',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }[item.tone];
  const Icon = item.icon;

  const content = (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-start justify-between gap-3">
            <p className="font-black text-slate-950">{item.label}</p>
            <span className="text-lg font-black text-slate-950">{item.value}</span>
          </div>
          <p className="mt-1 text-xs font-bold leading-5 opacity-80">{item.helper}</p>
        </div>
      </div>
    </>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={`w-full rounded-lg border p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/15 ${toneClass}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`rounded-lg border p-4 ${toneClass}`}>{content}</div>;
}

export function TopicQualityChecklist({
  topicHealth,
  unnamedCount,
  noKeywordCount,
  dominantCount,
}: {
  topicHealth: number;
  unnamedCount: number;
  noKeywordCount: number;
  dominantCount: number;
}) {
  const checks = [
    { label: 'Nama topik rapi', done: unnamedCount === 0 },
    { label: 'Keyword tersedia', done: noKeywordCount === 0 },
    { label: 'Cakupan merata', done: dominantCount === 0 },
    { label: 'Kerapian di atas 80%', done: topicHealth >= 80 },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Checklist kualitas</p>
      <div className="mt-4 space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <span className="text-sm font-black text-slate-800">{check.label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${check.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {check.done ? 'OK' : 'Perlu cek'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}


export function HeroInsightCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: Tone }) {
  const toneClass = getToneClass(tone);
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: Tone }) {
  const toneClass = getToneClass(tone);
  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneClass}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 opacity-80">{helper}</p>
    </article>
  );
}

export function ChartShell({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-slate-950">{title}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <p className="sr-only">{title} adalah visualisasi untuk membantu admin membaca kualitas pengelompokan topik.</p>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: TopicStatus }) {
  const toneClass = getToneClass(status.tone);
  return (
    <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-black ${toneClass}`}>
      {status.label}
    </span>
  );
}

export function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-black uppercase tracking-[0.08em] transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 ${
        active ? 'text-primary' : 'text-slate-500'
      }`}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

export function EmptyTopicsState() {
  return (
    <section className="flex min-h-[26rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50 text-primary">
        <Tags className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-black text-slate-950">Belum ada topik tersedia</h2>
      <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
        Jalankan proses NLP terlebih dahulu agar pembahasan dari ulasan muncul dan bisa dikelola admin.
      </p>
    </section>
  );
}

export function TopicsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat manajemen topik">
      <div className="h-44 animate-pulse rounded-lg bg-orange-100/70" />
      <div className="h-28 animate-pulse rounded-lg bg-white ring-1 ring-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-lg bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
        <div className="h-[32rem] animate-pulse rounded-lg bg-white ring-1 ring-slate-200" />
        <div className="h-[32rem] animate-pulse rounded-lg bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}

export function getToneClass(tone: Tone) {
  return {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];
}


