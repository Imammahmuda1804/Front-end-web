'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  adminTopicService,
  TopicGroupPayload,
  TopicItem,
  TopicReviewSentiment,
} from '../../services/topic.service';
import { adminDestinationService } from '@/features/admin';
import { DeleteTopicDialog, MergeTopicsDialog, RenameTopicDialog } from './topics-client.dialogs';
import { TopicDestinationsDrawer, TopicReviewsDrawer } from './topics-client.drawers';
import { TopicAnalyticsWorkspace } from './topics-client.analytics';
import { buildTopicActionItems } from './topics-client.actions';
import {
  EmptyTopicsState,
  TopicCommandPanel,
  TopicDestinationContextPanel,
  TopicHeroPanel,
  TopicMetricsGrid,
  TopicsErrorState,
  TopicsSkeleton,
} from './topics-client.panels';
import { TopicGroupManager } from './topics-client.group-manager';
import { TopicReviewTable } from './topics-client.table';
import type { ActionItem, DistributionBucket, QuickFilter, SortDir, SortKey } from './topics-client.types';
import { formatAverage, getCoverageBucket, getTopicStatus, isUnnamed, topicMatchesFilter } from './topics-client.utils';

// Mengelola topik ulasan, kelompok, penamaan, visibility, dan bantuan AI.
export function TopicsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('destinations');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [topicDestinationFilter, setTopicDestinationFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [renameTarget, setRenameTarget] = useState<TopicItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState<number | null>(null);
  const [mergeSourceIds, setMergeSourceIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TopicItem | null>(null);
  const [destinationTopic, setDestinationTopic] = useState<TopicItem | null>(null);
  const [destinationPage, setDestinationPage] = useState(1);
  const [reviewTopic, setReviewTopic] = useState<TopicItem | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSentiment, setReviewSentiment] = useState<TopicReviewSentiment | 'all'>('all');
  const [reviewDestinationId, setReviewDestinationId] = useState<number | 'all'>('all');

  const {
    data: topics = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-topics', topicDestinationFilter],
    queryFn: () =>
      adminTopicService.getTopics({
        destinationId:
          topicDestinationFilter === 'all' ? undefined : topicDestinationFilter,
      }),
  });

  const { data: topicGroups = [] } = useQuery({
    queryKey: ['admin-topic-groups'],
    queryFn: () => adminTopicService.getTopicGroups(),
  });

  const { data: destinationsResponse, isFetching: destinationsLoading } = useQuery({
    queryKey: ['admin-topic-destination-filter-options'],
    queryFn: () => adminDestinationService.getDestinations({ page: 1, limit: 100 }),
  });

  const destinationOptions = destinationsResponse?.data || [];
  const selectedTopicDestination = topicDestinationFilter === 'all'
    ? null
    : destinationOptions.find((destination) => destination.id === topicDestinationFilter) || null;

  const {
    data: topicDestinations,
    isFetching: isFetchingTopicDestinations,
  } = useQuery({
    queryKey: ['admin-topic-destinations', destinationTopic?.id, destinationPage],
    queryFn: () => adminTopicService.getTopicDestinations(destinationTopic!.id, destinationPage, 10),
    enabled: Boolean(destinationTopic),
  });

  const {
    data: topicReviews,
    isFetching: isFetchingTopicReviews,
  } = useQuery({
    queryKey: ['admin-topic-reviews', reviewTopic?.id, reviewPage, reviewSentiment, reviewDestinationId],
    queryFn: () =>
      adminTopicService.getTopicReviews(reviewTopic!.id, {
        page: reviewPage,
        limit: 8,
        sentiment: reviewSentiment === 'all' ? undefined : reviewSentiment,
        destinationId: reviewDestinationId === 'all' ? undefined : reviewDestinationId,
      }),
    enabled: Boolean(reviewTopic),
  });

  const {
    data: reviewTopicDestinations,
    isFetching: isFetchingReviewTopicDestinations,
  } = useQuery({
    queryKey: ['admin-topic-review-destinations', reviewTopic?.id],
    queryFn: () => adminTopicService.getTopicDestinations(reviewTopic!.id, 1, 50),
    enabled: Boolean(reviewTopic),
  });

  const aiRenameMutation = useMutation({
    mutationFn: () => adminTopicService.triggerAiRename(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast.success(`Bantuan penamaan selesai: ${result.renamed} berhasil, ${result.failed} gagal dari ${result.total} topik`);
    },
    onError: () => toast.error('Gagal menjalankan bantuan penamaan. Cek kuota Gemini API.'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => adminTopicService.renameTopic(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setRenameTarget(null);
      toast.success('Nama topik berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui nama topik'),
  });

  const mergeMutation = useMutation({
    mutationFn: ({ targetTopicId, sourceTopicIds }: { targetTopicId: number; sourceTopicIds: number[] }) =>
      adminTopicService.mergeTopics(targetTopicId, sourceTopicIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      setMergeOpen(false);
      setMergeTargetId(null);
      setMergeSourceIds([]);
      toast.success(`Topik berhasil digabung ke "${result.target_topic_name}"`);
    },
    onError: () => toast.error('Gagal menggabungkan topik'),
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

  const createGroupMutation = useMutation({
    mutationFn: (data: TopicGroupPayload) => adminTopicService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      toast.success('Kelompok topik berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan kelompok topik'),
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TopicGroupPayload }) =>
      adminTopicService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast.success('Kelompok topik berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui kelompok topik'),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => adminTopicService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast.success('Kelompok topik berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus kelompok topik'),
  });

  const maxDestinations = useMemo(
    () => Math.max(...topics.map((topic) => topic.total_destinations), 0),
    [topics],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = topics.filter((topic) => {
      const matchesSearch =
        query.length === 0 || topic.topic_name.toLowerCase().includes(query);
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
    const topicHealth = topics.length === 0
      ? 0
      : Math.max(0, Math.round(((topics.length - unnamed.length - withoutKeywords.length * 0.5) / topics.length) * 100));

    return {
      unnamed,
      totalDestLinks,
      withoutKeywords,
      longTail,
      dominant,
      averageDestinations,
      topicHealth,
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

  const actionItems = useMemo<ActionItem[]>(
    () => buildTopicActionItems(metrics, setQuickFilter),
    [metrics],
  );

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
    setTopicDestinationFilter('all');
    setSortKey('destinations');
    setSortDir('desc');
  };

  const openRenameDialog = (topic: TopicItem) => { setRenameTarget(topic); setRenameValue(topic.topic_name); };

  if (isLoading) {
    return <TopicsSkeleton />;
  }

  if (isError) {
    return <TopicsErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <TopicHeroPanel
        topicHealth={metrics.topicHealth}
        namingDebt={metrics.unnamed.length}
        coverage={metrics.totalDestLinks}
      />

      <TopicMetricsGrid totalTopics={topics.length} totalDestLinks={metrics.totalDestLinks} unnamedCount={metrics.unnamed.length} averageCoverage={formatAverage(metrics.averageDestinations)} />

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
            destinationFilter={topicDestinationFilter}
            destinations={destinationOptions}
            destinationsLoading={destinationsLoading}
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
            onDestinationFilterChange={(value) => {
              setTopicDestinationFilter(value);
              setPage(1);
            }}
            onAiRename={() => aiRenameMutation.mutate()}
            onOpenMerge={() => {
              setMergeOpen(true);
              setMergeTargetId(null);
              setMergeSourceIds([]);
            }}
            onReset={clearControls}
          />

          <TopicDestinationContextPanel
            destination={selectedTopicDestination}
            topicsCount={filtered.length}
            totalReviewSignals={topics.reduce((sum, topic) => sum + (topic.selected_destination_reviews || 0), 0)}
            onClear={() => {
              setTopicDestinationFilter('all');
              setPage(1);
            }}
          />

          <TopicReviewTable
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
            onRename={openRenameDialog}
            onMerge={(topic) => {
              setMergeTargetId(topic.id);
              setMergeSourceIds([]);
              setMergeOpen(true);
            }}
            onDelete={setDeleteTarget}
            onViewDestinations={(topic) => {
              setDestinationTopic(topic);
              setDestinationPage(1);
            }}
            onViewReviews={(topic) => {
              setReviewTopic(topic);
              setReviewPage(1);
              setReviewSentiment('all');
              setReviewDestinationId('all');
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
            topics={topics}
            pending={createGroupMutation.isPending || updateGroupMutation.isPending || deleteGroupMutation.isPending}
            onCreate={(data) => createGroupMutation.mutate(data)}
            onUpdate={(id, data) => updateGroupMutation.mutate({ id, data })}
            onTopicGroupChange={(topic, groupId) =>
              settingsMutation.mutate({ id: topic.id, groupId })
            }
            onDelete={(group) => {
              if (window.confirm(`Hapus kelompok topik "${group.group_name}"? Topik di dalamnya akan menjadi belum dipetakan.`)) {
                deleteGroupMutation.mutate(group.id);
              }
            }}
          />

          <TopicAnalyticsWorkspace
            topCoverage={topCoverage}
            distribution={distribution}
            bubbleTopics={bubbleTopics}
            unnamedTopics={metrics.unnamed}
            actionItems={actionItems}
            maxDestinations={maxDestinations}
            onRename={openRenameDialog}
            onSelectTopic={setSearch}
          />
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

      <MergeTopicsDialog
        open={mergeOpen}
        topics={topics}
        targetId={mergeTargetId}
        sourceIds={mergeSourceIds}
        pending={mergeMutation.isPending}
        onTargetChange={(id) => {
          setMergeTargetId(id);
          setMergeSourceIds((current) => current.filter((sourceId) => sourceId !== id));
        }}
        onSourceToggle={(id) => {
          setMergeSourceIds((current) =>
            current.includes(id)
              ? current.filter((sourceId) => sourceId !== id)
              : [...current, id],
          );
        }}
        onClose={() => {
          setMergeOpen(false);
          setMergeTargetId(null);
          setMergeSourceIds([]);
        }}
        onSubmit={() => {
          if (mergeTargetId && mergeSourceIds.length > 0) {
            mergeMutation.mutate({
              targetTopicId: mergeTargetId,
              sourceTopicIds: mergeSourceIds,
            });
          }
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

      <TopicReviewsDrawer
        topic={reviewTopic}
        data={topicReviews?.data || []}
        meta={topicReviews?.meta}
        summary={topicReviews?.sentiment_summary}
        loading={isFetchingTopicReviews}
        page={reviewPage}
        sentiment={reviewSentiment}
        destinationId={reviewDestinationId}
        destinations={reviewTopicDestinations?.data || []}
        destinationsLoading={isFetchingReviewTopicDestinations}
        topics={topics}
        onSentimentChange={(value) => {
          setReviewSentiment(value);
          setReviewPage(1);
        }}
        onDestinationChange={(value) => {
          setReviewDestinationId(value);
          setReviewPage(1);
        }}
        onPageChange={setReviewPage}
        onClose={() => setReviewTopic(null)}
      />
    </div>
  );
}

