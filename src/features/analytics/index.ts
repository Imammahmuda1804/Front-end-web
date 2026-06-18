export { AdminDashboardClient } from './components/dashboard/AdminDashboardClient';
export { CompareClient } from './components/compare/CompareClient';
export { AdminSingleAnalysisClient } from './components/compare/AdminSingleAnalysisClient';
export { AnalyticsSkeleton } from './components/compare/admin-compare.skeleton';

// Service & tipe analitik dipakai lintas-fitur (admin reviews, dashboard, compare)
export {
  adminAnalyticsService,
  type AnalyticsSummary,
  type TrendData,
  type TopicData,
  type DestinationAnalytics,
  type CompareResult,
} from './services/analytics.service';
