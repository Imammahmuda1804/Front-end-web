import React from 'react';
import { ArrowUpDown, CheckCircle2, Layers3, Loader2, Pencil, Save, Search, Sparkles, Tags, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { TopicGroupItem, TopicItem } from '@/services/admin/topic.service';
import type { ActionItem, QuickFilter, SortDir, SortKey, TopicStatus, Tone } from './TopicsClient';
export function TopicHeroPanel({ taxonomyHealth, namingDebt, coverage }: { taxonomyHealth: number; namingDebt: number; coverage: number }) {
  const insights = [
    { label: 'Taxonomy health', value: `${taxonomyHealth}%`, helper: 'Nama dan keyword tersedia', icon: CheckCircle2, tone: 'emerald' as Tone },
    { label: 'Naming debt', value: String(namingDebt), helper: 'Topik generik perlu rename', icon: Sparkles, tone: namingDebt > 0 ? 'amber' as Tone : 'emerald' as Tone },
    { label: 'Coverage', value: String(coverage), helper: 'Total relasi destinasi', icon: Layers3, tone: 'blue' as Tone },
  ];

  return (
    <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <Tags className="h-3.5 w-3.5" />
            Topic Intelligence
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Manajemen Topik</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
            Kelola taxonomy hasil topic modelling, rapikan naming debt, pantau coverage, dan pastikan topik mudah dipakai untuk audit review.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
          {insights.map((insight) => <HeroInsightCard key={insight.label} {...insight} />)}
        </div>
      </div>
    </section>
  );
}

export function TopicCommandPanel({
  search,
  sortKey,
  sortDir,
  quickFilter,
  groupFilter,
  groups,
  unnamedCount,
  aiRenamePending,
  onSearchChange,
  onSortKeyChange,
  onSortDirChange,
  onQuickFilterChange,
  onGroupFilterChange,
  onAiRename,
  onReset,
}: {
  search: string;
  sortKey: SortKey;
  sortDir: SortDir;
  quickFilter: QuickFilter;
  groupFilter: string;
  groups: TopicGroupItem[];
  unnamedCount: number;
  aiRenamePending: boolean;
  onSearchChange: (value: string) => void;
  onSortKeyChange: (value: SortKey) => void;
  onSortDirChange: (value: SortDir) => void;
  onQuickFilterChange: (value: QuickFilter) => void;
  onGroupFilterChange: (value: string) => void;
  onAiRename: () => void;
  onReset: () => void;
}) {
  const quickFilters: Array<{ value: QuickFilter; label: string }> = [
    { value: 'all', label: 'Semua' },
    { value: 'unnamed', label: 'Perlu nama' },
    { value: 'dominant', label: 'Dominan' },
    { value: 'longtail', label: 'Long-tail' },
    { value: 'noKeywords', label: 'Tanpa keyword' },
  ];

  return (
    <section className="sticky top-4 z-20 rounded-[1.75rem] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(18rem,1fr)_11rem_10rem_13rem]">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-primary">Cari topik</span>
            <span className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama topik atau keyword..."
                className="min-h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 font-semibold"
              />
            </span>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={onAiRename}
            disabled={aiRenamePending || unnamedCount === 0}
            className="min-h-12 rounded-full bg-primary px-5 font-black text-white shadow-sm shadow-orange-200 hover:bg-primary/90"
          >
            {aiRenamePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Rename ({unnamedCount})
          </Button>
          <Button type="button" onClick={onReset} variant="outline" className="min-h-12 rounded-full px-5 font-black">
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
            className={`min-h-10 rounded-full border px-4 text-sm font-black transition ${
              quickFilter === filter.value
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function TopicGroupManager({
  groups,
  editingGroupId,
  editingValue,
  pending,
  onEdit,
  onValueChange,
  onCancel,
  onSubmit,
}: {
  groups: TopicGroupItem[];
  editingGroupId: number | null;
  editingValue: string;
  pending: boolean;
  onEdit: (group: TopicGroupItem) => void;
  onValueChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Topic group</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Kelola nama group</h3>
        </div>
        <Layers3 className="h-5 w-5 text-ai" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const isEditing = editingGroupId === group.id;
          return (
            <div key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editingValue}
                    onChange={(event) => onValueChange(event.target.value)}
                    className="min-h-11 rounded-xl bg-white font-bold"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={pending || !editingValue.trim()}
                      className="min-h-10 flex-1 rounded-full bg-ai text-white hover:bg-ai/90"
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} className="min-h-10 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{group.group_name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{group.topics?.length || 0} topik detail</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(group)}
                    aria-label={`Rename group ${group.group_name}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-ai-container hover:text-ai"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TopicCloud({ topics, maxDestinations, onSelectTopic }: { topics: TopicItem[]; maxDestinations: number; onSelectTopic: (value: string) => void }) {
  return (
    <ChartShell title="Topic Cloud" description="Visual sekunder untuk eksplorasi cepat topik teratas." icon={Tags}>
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
              className={`flex flex-col items-center justify-center rounded-2xl border text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                isOrange ? 'border-orange-200 bg-orange-50 text-primary' : 'border-sky-200 bg-sky-50 text-ai'
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
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Naming debt</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Topik perlu rename</h3>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Tidak ada topik generik yang perlu rename.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.slice(0, 5).map((topic) => (
            <div key={topic.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{topic.topic_name}</p>
                  <p className="mt-1 text-xs font-bold text-amber-700">{topic.total_destinations} destinasi terkait</p>
                </div>
                <button
                  type="button"
                  aria-label={`Rename ${topic.topic_name}`}
                  onClick={() => onRename(topic)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
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
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Action queue</p>
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
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }[item.tone];
  const Icon = item.icon;

  const content = (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white">
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
        className={`w-full rounded-2xl border p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/15 ${toneClass}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`rounded-2xl border p-4 ${toneClass}`}>{content}</div>;
}

export function TopicQualityChecklist({
  taxonomyHealth,
  unnamedCount,
  noKeywordCount,
  dominantCount,
}: {
  taxonomyHealth: number;
  unnamedCount: number;
  noKeywordCount: number;
  dominantCount: number;
}) {
  const checks = [
    { label: 'AI naming selesai', done: unnamedCount === 0 },
    { label: 'Keyword tersedia', done: noKeywordCount === 0 },
    { label: 'Coverage merata', done: dominantCount === 0 },
    { label: 'Health di atas 80%', done: taxonomyHealth >= 80 },
  ];

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Quality checklist</p>
      <div className="mt-4 space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
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
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClass}`}>
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
    <article className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 opacity-80">{helper}</p>
    </article>
  );
}

export function ChartShell({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-slate-950">{title}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <p className="sr-only">{title} adalah visualisasi untuk membantu admin membaca kualitas taxonomy topik.</p>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: TopicStatus }) {
  const toneClass = getToneClass(status.tone);
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
      {status.label}
    </span>
  );
}

export function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs font-black uppercase tracking-[0.08em] transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 ${
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
    <section className="flex min-h-[26rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <Tags className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-black text-slate-950">Belum ada topik tersedia</h2>
      <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
        Jalankan proses NLP/topic modelling terlebih dahulu agar taxonomy topik muncul dan bisa dikelola admin.
      </p>
    </section>
  );
}

export function TopicsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat manajemen topik">
      <div className="h-44 animate-pulse rounded-[2rem] bg-orange-100/70" />
      <div className="h-28 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
        <div className="h-[32rem] animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
        <div className="h-[32rem] animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
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

