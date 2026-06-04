import dynamic from 'next/dynamic';

import type { TopicItem } from '@/services/admin/topic.service';
import { NamingDebtPanel, TopicActionQueue, TopicCloud } from './topics-client.panels';
import type { ActionItem, DistributionBucket } from './topics-client.types';

const TopicChartSkeleton = ({ height = 'h-72' }: { height?: string }) => (
  <div className={`${height} animate-pulse rounded-xl bg-white ring-1 ring-slate-200`} />
);

const TopicCoverageParetoChart = dynamic(
  () => import('./TopicAnalyticsCharts').then((mod) => mod.TopicCoverageParetoChart),
  { ssr: false, loading: () => <TopicChartSkeleton height="h-[24rem]" /> },
);

const CoverageDistributionChart = dynamic(
  () => import('./TopicAnalyticsCharts').then((mod) => mod.CoverageDistributionChart),
  { ssr: false, loading: () => <TopicChartSkeleton /> },
);

export function TopicAnalyticsWorkspace({
  topCoverage,
  distribution,
  bubbleTopics,
  unnamedTopics,
  actionItems,
  maxDestinations,
  onRename,
  onSelectTopic,
}: {
  topCoverage: TopicItem[];
  distribution: DistributionBucket[];
  bubbleTopics: TopicItem[];
  unnamedTopics: TopicItem[];
  actionItems: ActionItem[];
  maxDestinations: number;
  onRename: (topic: TopicItem) => void;
  onSelectTopic: (value: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
      <div className="space-y-6">
        <TopicCoverageParetoChart topics={topCoverage} maxDestinations={maxDestinations} />
        <div className="grid gap-6 lg:grid-cols-2">
          <CoverageDistributionChart data={distribution} />
          <TopicCloud topics={bubbleTopics} maxDestinations={maxDestinations} onSelectTopic={onSelectTopic} />
        </div>
      </div>

      <aside className="space-y-6">
        <NamingDebtPanel topics={unnamedTopics} onRename={onRename} />
        <TopicActionQueue items={actionItems} />
      </aside>
    </div>
  );
}
