'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Database,
  Hash,
  Layers3,
  Loader2,
  MapPin,
  Pencil,
  Search,
  Sparkles,
  Tags,
  Target,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NativeSelect } from '@/components/ui/native-select';
import { adminTopicService, TopicGroupItem, TopicItem } from '@/services/admin/topic.service';

type SortKey = 'name' | 'destinations' | 'id';
type SortDir = 'asc' | 'desc';
type QuickFilter = 'all' | 'unnamed' | 'dominant' | 'longtail' | 'noKeywords';
type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

type TopicStatus = {
  label: 'Perlu nama AI' | 'Dominan' | 'Long-tail' | 'Normal';
  tone: Tone;
};

type DistributionBucket = {
  name: string;
  count: number;
};

type ActionItem = {
  label: string;
  helper: string;
  value: string;
  tone: Extract<Tone, 'orange' | 'blue' | 'emerald' | 'amber' | 'rose'>;
  icon: React.ElementType;
  onClick?: () => void;
};

const DEST_A_COLOR = 'var(--explore)';
const DEST_B_COLOR = 'var(--ai)';

function isUnnamed(topic: TopicItem) {
  return topic.topic_name.trim().toLowerCase().startsWith('topic ');
}

function getTopicStatus(topic: TopicItem, maxDestinations: number): TopicStatus {
  if (isUnnamed(topic)) return { label: 'Perlu nama AI', tone: 'amber' };
  if (maxDestinations > 0 && topic.total_destinations >= Math.max(10, maxDestinations * 0.6)) {
    return { label: 'Dominan', tone: 'orange' };
  }
  if (topic.total_destinations <= 1) return { label: 'Long-tail', tone: 'blue' };
  return { label: 'Normal', tone: 'emerald' };
}

function getCoverageBucket(topic: TopicItem) {
  if (topic.total_destinations <= 1) return '0-1';
  if (topic.total_destinations <= 5) return '2-5';
  if (topic.total_destinations <= 10) return '6-10';
  return '>10';
}

function topicMatchesFilter(topic: TopicItem, filter: QuickFilter, maxDestinations: number) {
  if (filter === 'all') return true;
  if (filter === 'unnamed') return isUnnamed(topic);
  if (filter === 'dominant') return getTopicStatus(topic, maxDestinations).label === 'Dominan';
  if (filter === 'longtail') return topic.total_destinations <= 1;
  return !topic.keywords || topic.keywords.length === 0;
}

function formatAverage(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function TopicsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('destinations');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [renameTarget, setRenameTarget] = useState<TopicItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TopicItem | null>(null);

  const {
    data: topics = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => adminTopicService.getTopics(),
  });

  const { data: topicGroups = [] } = useQuery({
    queryKey: ['admin-topic-groups'],
    queryFn: () => adminTopicService.getTopicGroups(),
  });

  const aiRenameMutation = useMutation({
    mutationFn: () => adminTopicService.triggerAiRename(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast.success(`AI Rename selesai: ${result.renamed} berhasil, ${result.failed} gagal dari ${result.total} topik`);
    },
    onError: () => toast.error('Gagal menjalankan AI Rename. Cek quota Gemini API.'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => adminTopicService.renameTopic(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setRenameTarget(null);
      toast.success('Topik berhasil di-rename');
    },
    onError: () => toast.error('Gagal me-rename topik'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTopicService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setDeleteTarget(null);
      toast.success('Topik berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus topik'),
  });

  const settingsMutation = useMutation({
    mutationFn: ({
      id,
      groupId,
      isSearchVisible,
      isDetailVisible,
    }: {
      id: number;
      groupId?: number | null;
      isSearchVisible?: boolean;
      isDetailVisible?: boolean;
    }) =>
      adminTopicService.updateTopicSettings(id, {
        groupId,
        isSearchVisible,
        isDetailVisible,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      toast.success('Pengaturan topik diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui pengaturan topik'),
  });

  const maxDestinations = useMemo(
    () => Math.max(...topics.map((topic) => topic.total_destinations), 0),
    [topics],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = topics.filter((topic) => {
      const matchesSearch =
        query.length === 0 ||
        topic.topic_name.toLowerCase().includes(query) ||
        topic.group_name?.toLowerCase().includes(query) ||
        topic.keywords?.some((keyword) => keyword.toLowerCase().includes(query));
      const matchesGroup =
        groupFilter === 'all' ||
        (groupFilter === 'none' ? !topic.group_id : String(topic.group_id) === groupFilter);
      return matchesSearch && matchesGroup && topicMatchesFilter(topic, quickFilter, maxDestinations);
    });

    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'name') comparison = a.topic_name.localeCompare(b.topic_name);
      else if (sortKey === 'destinations') comparison = a.total_destinations - b.total_destinations;
      else comparison = a.id - b.id;
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [groupFilter, maxDestinations, quickFilter, search, sortDir, sortKey, topics]);

  const metrics = useMemo(() => {
    const unnamed = topics.filter(isUnnamed);
    const totalDestLinks = topics.reduce((sum, topic) => sum + topic.total_destinations, 0);
    const withoutKeywords = topics.filter((topic) => !topic.keywords || topic.keywords.length === 0);
    const longTail = topics.filter((topic) => topic.total_destinations <= 1);
    const dominant = topics.filter((topic) => getTopicStatus(topic, maxDestinations).label === 'Dominan');
    const averageDestinations = topics.length > 0 ? totalDestLinks / topics.length : 0;
    const taxonomyHealth = topics.length === 0
      ? 0
      : Math.max(0, Math.round(((topics.length - unnamed.length - withoutKeywords.length * 0.5) / topics.length) * 100));

    return {
      unnamed,
      totalDestLinks,
      withoutKeywords,
      longTail,
      dominant,
      averageDestinations,
      taxonomyHealth,
    };
  }, [maxDestinations, topics]);

  const topCoverage = useMemo(
    () => [...topics].sort((a, b) => b.total_destinations - a.total_destinations).slice(0, 12),
    [topics],
  );

  const distribution = useMemo<DistributionBucket[]>(() => {
    const buckets: Record<string, number> = { '0-1': 0, '2-5': 0, '6-10': 0, '>10': 0 };
    topics.forEach((topic) => {
      buckets[getCoverageBucket(topic)] += 1;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [topics]);

  const bubbleTopics = useMemo(
    () => [...topics].sort((a, b) => b.total_destinations - a.total_destinations).slice(0, 18),
    [topics],
  );

  const actionItems = useMemo<ActionItem[]>(() => [
    {
      label: 'Selesaikan naming debt',
      helper: metrics.unnamed.length > 0 ? 'Topik generik masih perlu nama yang readable untuk admin.' : 'Semua topik utama sudah punya nama readable.',
      value: String(metrics.unnamed.length),
      tone: metrics.unnamed.length > 0 ? 'amber' : 'emerald',
      icon: Sparkles,
      onClick: metrics.unnamed.length > 0 ? () => setQuickFilter('unnamed') : undefined,
    },
    {
      label: 'Pantau topik dominan',
      helper: metrics.dominant.length > 0 ? 'Topik ini terlalu luas dan bisa menutupi taxonomy lain.' : 'Coverage topik terlihat cukup merata.',
      value: String(metrics.dominant.length),
      tone: metrics.dominant.length > 0 ? 'orange' : 'emerald',
      icon: Target,
      onClick: metrics.dominant.length > 0 ? () => setQuickFilter('dominant') : undefined,
    },
    {
      label: 'Rapikan long-tail',
      helper: metrics.longTail.length > 0 ? 'Topik kecil bisa dipertimbangkan untuk merge atau review ulang.' : 'Tidak ada topik kecil ekstrem.',
      value: String(metrics.longTail.length),
      tone: metrics.longTail.length > 0 ? 'blue' : 'emerald',
      icon: Layers3,
      onClick: metrics.longTail.length > 0 ? () => setQuickFilter('longtail') : undefined,
    },
    {
      label: 'Lengkapi keyword',
      helper: metrics.withoutKeywords.length > 0 ? 'Keyword kosong membuat pencarian dan audit topik kurang jelas.' : 'Semua topik punya keyword pendukung.',
      value: String(metrics.withoutKeywords.length),
      tone: metrics.withoutKeywords.length > 0 ? 'rose' : 'emerald',
      icon: Database,
      onClick: metrics.withoutKeywords.length > 0 ? () => setQuickFilter('noKeywords') : undefined,
    },
  ], [metrics.dominant.length, metrics.longTail.length, metrics.unnamed.length, metrics.withoutKeywords.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTopics = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filtered, pageSize],
  );

  const toggleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const clearControls = () => {
    setSearch('');
    setQuickFilter('all');
    setGroupFilter('all');
    setSortKey('destinations');
    setSortDir('desc');
  };

  if (isLoading) {
    return <TopicsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-[1.75rem] border border-red-100 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h1 className="text-xl font-black text-red-900">Gagal memuat topik</h1>
        <p className="mt-2 text-sm font-semibold text-red-600">Periksa koneksi API atau sesi admin, lalu coba ulang.</p>
        <Button onClick={() => refetch()} className="mt-5 rounded-full">
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopicHeroPanel
        taxonomyHealth={metrics.taxonomyHealth}
        namingDebt={metrics.unnamed.length}
        coverage={metrics.totalDestLinks}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Tags} label="Total Topik" value={String(topics.length)} helper="Cluster taxonomy aktif" tone="orange" />
        <MetricCard icon={MapPin} label="Relasi Destinasi" value={String(metrics.totalDestLinks)} helper="Total topic-destination links" tone="blue" />
        <MetricCard icon={AlertTriangle} label="Naming Debt" value={String(metrics.unnamed.length)} helper="Topik generik perlu nama AI" tone={metrics.unnamed.length > 0 ? 'amber' : 'emerald'} />
        <MetricCard icon={BarChart3} label="Rata-rata Coverage" value={formatAverage(metrics.averageDestinations)} helper="Destinasi per topik" tone="slate" />
      </section>

      {topics.length === 0 ? (
        <EmptyTopicsState />
      ) : (
        <>
          <TopicCommandPanel
            search={search}
            sortKey={sortKey}
            sortDir={sortDir}
            quickFilter={quickFilter}
            groupFilter={groupFilter}
            groups={topicGroups}
            unnamedCount={metrics.unnamed.length}
            aiRenamePending={aiRenameMutation.isPending}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onSortKeyChange={(value) => {
              setSortKey(value);
              setPage(1);
            }}
            onSortDirChange={(value) => {
              setSortDir(value);
              setPage(1);
            }}
            onQuickFilterChange={(value) => {
              setQuickFilter(value);
              setPage(1);
            }}
            onGroupFilterChange={(value) => {
              setGroupFilter(value);
              setPage(1);
            }}
            onAiRename={() => aiRenameMutation.mutate()}
            onReset={clearControls}
          />

          <TaxonomyTable
            topics={paginatedTopics}
            totalTopics={topics.length}
            filteredCount={filtered.length}
            maxDestinations={maxDestinations}
            sortKey={sortKey}
            page={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onSort={toggleSort}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            onRename={(topic) => {
              setRenameTarget(topic);
              setRenameValue(topic.topic_name);
            }}
            onDelete={setDeleteTarget}
            groups={topicGroups}
            onGroupChange={(topic, groupId) =>
              settingsMutation.mutate({ id: topic.id, groupId })
            }
            onVisibilityChange={(topic, key, value) =>
              settingsMutation.mutate({
                id: topic.id,
                [key]: value,
              })
            }
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
            <div className="space-y-6">
              <TopicCoverageParetoChart topics={topCoverage} maxDestinations={maxDestinations} />
              <div className="grid gap-6 lg:grid-cols-2">
                <CoverageDistributionChart data={distribution} />
                <TopicCloud topics={bubbleTopics} maxDestinations={maxDestinations} onSelectTopic={setSearch} />
              </div>
            </div>

            <aside className="space-y-6">
              <NamingDebtPanel topics={metrics.unnamed} onRename={(topic) => {
                setRenameTarget(topic);
                setRenameValue(topic.topic_name);
              }} />
              <TopicActionQueue items={actionItems} />
              <TopicQualityChecklist
                taxonomyHealth={metrics.taxonomyHealth}
                unnamedCount={metrics.unnamed.length}
                noKeywordCount={metrics.withoutKeywords.length}
                dominantCount={metrics.dominant.length}
              />
            </aside>
          </div>
        </>
      )}

      <RenameTopicDialog
        topic={renameTarget}
        value={renameValue}
        pending={renameMutation.isPending}
        onValueChange={setRenameValue}
        onClose={() => setRenameTarget(null)}
        onSubmit={() => {
          if (renameTarget && renameValue.trim()) {
            renameMutation.mutate({ id: renameTarget.id, name: renameValue.trim() });
          }
        }}
      />

      <DeleteTopicDialog
        topic={deleteTarget}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onSubmit={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

function TopicHeroPanel({ taxonomyHealth, namingDebt, coverage }: { taxonomyHealth: number; namingDebt: number; coverage: number }) {
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

function TopicCommandPanel({
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

function TopicCoverageParetoChart({ topics, maxDestinations }: { topics: TopicItem[]; maxDestinations: number }) {
  const data = topics.map((topic) => ({
    name: topic.topic_name.trim()
      ? topic.topic_name.length > 28 ? `${topic.topic_name.slice(0, 26)}...` : topic.topic_name
      : `Topik ${topic.id}`,
    destinations: topic.total_destinations,
  }));

  return (
    <ChartShell title="Topic Coverage Pareto" description="Topik dengan relasi destinasi terbesar. Gunakan untuk menemukan topik yang terlalu dominan." icon={BarChart3}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, Math.max(maxDestinations, 1)]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
            <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 800 }} />
            <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Bar dataKey="destinations" name="Destinasi" fill={DEST_A_COLOR} radius={[0, 10, 10, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function CoverageDistributionChart({ data }: { data: DistributionBucket[] }) {
  return (
    <ChartShell title="Coverage Distribution" description="Sebaran jumlah destinasi per topik untuk melihat topik kecil dan besar." icon={Layers3}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Bar dataKey="count" name="Jumlah topik" radius={[10, 10, 0, 0]} barSize={44}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name || 'bucket'}-${index}`} fill={index === 0 ? DEST_B_COLOR : index === 3 ? DEST_A_COLOR : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function TopicCloud({ topics, maxDestinations, onSelectTopic }: { topics: TopicItem[]; maxDestinations: number; onSelectTopic: (value: string) => void }) {
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

function NamingDebtPanel({ topics, onRename }: { topics: TopicItem[]; onRename: (topic: TopicItem) => void }) {
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

function TopicActionQueue({ items }: { items: ActionItem[] }) {
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

function ActionQueueItem({ item }: { item: ActionItem }) {
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

function TopicQualityChecklist({
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

function TaxonomyTable({
  topics,
  totalTopics,
  filteredCount,
  maxDestinations,
  sortKey,
  page,
  pageSize,
  totalPages,
  onSort,
  onPageChange,
  onPageSizeChange,
  onRename,
  onDelete,
  groups,
  onGroupChange,
  onVisibilityChange,
}: {
  topics: TopicItem[];
  totalTopics: number;
  filteredCount: number;
  maxDestinations: number;
  sortKey: SortKey;
  page: number;
  pageSize: number;
  totalPages: number;
  onSort: (key: SortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRename: (topic: TopicItem) => void;
  onDelete: (topic: TopicItem) => void;
  groups: TopicGroupItem[];
  onGroupChange: (topic: TopicItem, groupId: number | null) => void;
  onVisibilityChange: (
    topic: TopicItem,
    key: 'isSearchVisible' | 'isDetailVisible',
    value: boolean,
  ) => void;
}) {
  const startItem = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filteredCount);
  const visiblePages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages].filter((item) => item >= 1 && item <= totalPages)),
  );

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Taxonomy table</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Daftar Topik</h3>
        </div>
        <p className="text-sm font-bold text-slate-500">
          Menampilkan {startItem}-{endItem} dari {filteredCount} hasil, total {totalTopics} topik
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-20">
                <SortButton active={sortKey === 'id'} onClick={() => onSort('id')}>
                  <Hash className="h-3.5 w-3.5" /> ID
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton active={sortKey === 'name'} onClick={() => onSort('name')}>Nama Topik</SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Visibilitas</TableHead>
              <TableHead>Kata Kunci</TableHead>
              <TableHead className="w-36">
                <SortButton active={sortKey === 'destinations'} onClick={() => onSort('destinations')}>
                  <MapPin className="h-3.5 w-3.5" /> Destinasi
                </SortButton>
              </TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <p className="font-black text-slate-700">Tidak ada topik yang cocok</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ubah pencarian atau filter cepat untuk melihat topik lain.</p>
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => {
                const status = getTopicStatus(topic, maxDestinations);
                const ratio = maxDestinations > 0 ? (topic.total_destinations / maxDestinations) * 100 : 0;
                return (
                  <TableRow key={topic.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-mono text-xs font-bold text-slate-400">{topic.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[18rem]">
                        <p className={`truncate font-black ${status.label === 'Perlu nama AI' ? 'text-amber-700' : 'text-slate-900'}`}>
                          {topic.topic_name}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{topic.keywords?.length || 0} keyword pendukung</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      <NativeSelect
                        aria-label={`Pilih group untuk topik ${topic.topic_name}`}
                        value={topic.group_id ? String(topic.group_id) : 'none'}
                        onValueChange={(value) =>
                          onGroupChange(topic, value === 'none' ? null : Number(value))
                        }
                        options={[
                          { value: 'none', label: 'Belum dipetakan' },
                          ...groups.map((group) => ({
                            value: String(group.id),
                            label: group.group_name,
                          })),
                        ]}
                        wrapperClassName="min-w-48"
                        className="min-h-10 bg-white"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600">
                          <input
                            type="checkbox"
                            checked={topic.is_search_visible !== false}
                            onChange={(event) =>
                              onVisibilityChange(topic, 'isSearchVisible', event.target.checked)
                            }
                          />
                          Search
                        </label>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600">
                          <input
                            type="checkbox"
                            checked={topic.is_detail_visible !== false}
                            onChange={(event) =>
                              onVisibilityChange(topic, 'isDetailVisible', event.target.checked)
                            }
                          />
                          Detail
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {(topic.keywords || []).slice(0, 5).map((keyword, index) => (
                          <span key={`${topic.id}-keyword-${index}-${keyword || 'empty'}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {keyword}
                          </span>
                        ))}
                        {(topic.keywords || []).length > 5 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                            +{topic.keywords.length - 5}
                          </span>
                        )}
                        {(!topic.keywords || topic.keywords.length === 0) && (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">Tanpa keyword</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ratio)}%` }} />
                        </div>
                        <span className="text-sm font-black tabular-nums text-slate-800">{topic.total_destinations}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Rename topik ${topic.topic_name}`}
                          onClick={() => onRename(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-ai focus:outline-none focus:ring-4 focus:ring-primary/15"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus topik ${topic.topic_name}`}
                          onClick={() => onDelete(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-black text-slate-700">
            Baris per halaman
          </span>
          <NativeSelect
            aria-label="Pilih jumlah baris tabel topik"
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            options={[
              { value: '10', label: '10 baris' },
              { value: '20', label: '20 baris' },
              { value: '50', label: '50 baris' },
            ]}
            wrapperClassName="w-36"
            className="min-h-10 bg-white"
          />
          <span className="text-sm font-bold text-slate-500">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination tabel topik">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {visiblePages.map((item, index) => {
            const previous = visiblePages[index - 1];
            const hasGap = previous && item - previous > 1;
            return (
              <React.Fragment key={item}>
                {hasGap && <span className="px-1 text-sm font-black text-slate-400">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={page === item ? 'page' : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-black transition ${
                    page === item
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {item}
                </button>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </nav>
      </div>
    </section>
  );
}

function RenameTopicDialog({
  topic,
  value,
  pending,
  onValueChange,
  onClose,
  onSubmit,
}: {
  topic: TopicItem | null;
  value: string;
  pending: boolean;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Topik</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Nama Topik Saat Ini</label>
            <p className="text-sm font-semibold italic text-slate-500">{topic?.topic_name}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Kata Kunci</label>
            <div className="flex flex-wrap gap-1">
              {(topic?.keywords || []).map((keyword, index) => (
                <span key={`${topic?.id || 'topic'}-dialog-keyword-${index}-${keyword || 'empty'}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="rename-input" className="mb-1.5 block text-sm font-bold text-slate-700">Nama Baru</label>
            <Input
              id="rename-input"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="Masukkan nama topik baru..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit} disabled={!value.trim() || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTopicDialog({
  topic,
  pending,
  onClose,
  onSubmit,
}: {
  topic: TopicItem | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            Hapus Topik
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            Apakah Anda yakin ingin menghapus topik berikut? Relasi destinasi dan review terkait akan kehilangan taxonomy ini.
          </p>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="font-black text-slate-900">{topic?.topic_name}</p>
            <p className="mt-1 text-xs font-bold text-rose-700">{topic?.total_destinations || 0} destinasi terkait</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={onSubmit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Hapus Topik
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HeroInsightCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: Tone }) {
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

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: Tone }) {
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

function ChartShell({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
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

function StatusBadge({ status }: { status: TopicStatus }) {
  const toneClass = getToneClass(status.tone);
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
      {status.label}
    </span>
  );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function EmptyTopicsState() {
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

function TopicsSkeleton() {
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

function getToneClass(tone: Tone) {
  return {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];
}
