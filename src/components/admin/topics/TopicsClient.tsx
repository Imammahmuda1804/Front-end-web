'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Database,
  Layers3,
  MapPin,
  Sparkles,
  Tags,
  Target,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { adminTopicService, TopicDestinationItem, TopicItem } from '@/services/admin/topic.service';
import { DeleteTopicDialog, RenameTopicDialog } from './topics-client.dialogs';
import {
  EmptyTopicsState,
  MetricCard,
  NamingDebtPanel,
  TopicActionQueue,
  TopicCloud,
  TopicCommandPanel,
  TopicGroupManager,
  TopicHeroPanel,
  TopicQualityChecklist,
  TopicsSkeleton,
} from './topics-client.panels';
import { TaxonomyTable } from './topics-client.table';

export type SortKey = 'name' | 'destinations' | 'id';
export type SortDir = 'asc' | 'desc';
export type QuickFilter = 'all' | 'unnamed' | 'dominant' | 'longtail' | 'noKeywords';
export type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

export type TopicStatus = {
  label: 'Perlu nama AI' | 'Dominan' | 'Long-tail' | 'Normal';
  tone: Tone;
};

type DistributionBucket = {
  name: string;
  count: number;
};

export type ActionItem = {
  label: string;
  helper: string;
  value: string;
  tone: Extract<Tone, 'orange' | 'blue' | 'emerald' | 'amber' | 'rose'>;
  icon: React.ElementType;
  onClick?: () => void;
};

const TopicChartSkeleton = ({ height = 'h-72' }: { height?: string }) => (
  <div className={`${height} animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200`} />
);

const TopicCoverageParetoChart = dynamic(
  () => import('./TopicAnalyticsCharts').then((mod) => mod.TopicCoverageParetoChart),
  { ssr: false, loading: () => <TopicChartSkeleton height="h-[24rem]" /> },
);

const CoverageDistributionChart = dynamic(
  () => import('./TopicAnalyticsCharts').then((mod) => mod.CoverageDistributionChart),
  { ssr: false, loading: () => <TopicChartSkeleton /> },
);

// Mengecek topik yang masih memakai nama fallback.
export function isUnnamed(topic: TopicItem) {
  return topic.topic_name.trim().toLowerCase().startsWith('topic ');
}

export function getTopicStatus(topic: TopicItem, maxDestinations: number): TopicStatus {
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

// Mengelola taxonomy topik, group, rename, visibility, dan AI naming.
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
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [destinationTopic, setDestinationTopic] = useState<TopicItem | null>(null);
  const [destinationPage, setDestinationPage] = useState(1);

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

  const {
    data: topicDestinations,
    isFetching: isFetchingTopicDestinations,
  } = useQuery({
    queryKey: ['admin-topic-destinations', destinationTopic?.id, destinationPage],
    queryFn: () => adminTopicService.getTopicDestinations(destinationTopic!.id, destinationPage, 10),
    enabled: Boolean(destinationTopic),
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

  const renameGroupMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminTopicService.renameGroup(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setEditingGroupId(null);
      setEditingGroupName('');
      toast.success('Nama group berhasil diperbarui');
    },
    onError: () => toast.error('Gagal me-rename group'),
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
            onViewDestinations={(topic) => {
              setDestinationTopic(topic);
              setDestinationPage(1);
            }}
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

          <TopicGroupManager
            groups={topicGroups}
            editingGroupId={editingGroupId}
            editingValue={editingGroupName}
            pending={renameGroupMutation.isPending}
            onEdit={(group) => {
              setEditingGroupId(group.id);
              setEditingGroupName(group.group_name);
            }}
            onValueChange={setEditingGroupName}
            onCancel={() => {
              setEditingGroupId(null);
              setEditingGroupName('');
            }}
            onSubmit={() => {
              if (editingGroupId && editingGroupName.trim()) {
                renameGroupMutation.mutate({
                  id: editingGroupId,
                  name: editingGroupName.trim(),
                });
              }
            }}
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

      <TopicDestinationsDrawer
        topic={destinationTopic}
        data={topicDestinations?.data || []}
        meta={topicDestinations?.meta}
        loading={isFetchingTopicDestinations}
        page={destinationPage}
        onPageChange={setDestinationPage}
        onClose={() => setDestinationTopic(null)}
      />
    </div>
  );
}

function TopicDestinationsDrawer({
  topic,
  data,
  meta,
  loading,
  page,
  onPageChange,
  onClose,
}: {
  topic: TopicItem | null;
  data: TopicDestinationItem[];
  meta?: { page: number; limit: number; total: number; total_pages: number };
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}) {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30">
      <aside className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Destinasi topic</p>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-950">{topic.topic_name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{meta?.total ?? topic.total_destinations} destinasi terkait</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar destinasi topic"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              Belum ada destinasi untuk topik ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((destination) => (
                <article key={destination.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{destination.name}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">{destination.city || '-'}{destination.province ? `, ${destination.province}` : ''}</p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-primary">
                      {destination.total_reviews_in_topic || 0} review
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <p className="text-sm font-bold text-slate-500">
            Halaman {page} dari {meta?.total_pages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={page >= (meta?.total_pages || 1) || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}


