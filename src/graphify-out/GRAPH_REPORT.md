# Graph Report - web\src  (2026-06-22)

## Corpus Check
- 190 files · ~99,146 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1161 nodes · 2276 edges · 58 communities (50 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 84 edges
2. `Button()` - 30 edges
3. `getImageUrl()` - 25 edges
4. `api` - 20 edges
5. `NativeSelect()` - 18 edges
6. `AdminTopicService` - 15 edges
7. `Card()` - 13 edges
8. `CardHeader()` - 13 edges
9. `CardTitle()` - 13 edges
10. `CardContent()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `LoginContent()` --calls--> `useAuthStore`  [INFERRED]
  app/(auth)/login/page.tsx → features/auth/store/auth.store.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `Navbar()` --calls--> `useAuthStore`  [INFERRED]
  components/layout/Navbar.tsx → features/auth/store/auth.store.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts

## Communities (58 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (53): Props, SearchClient(), SearchCommandSurface(), SearchEmptyState(), SearchHistoryPanel(), SearchLoadingGrid(), easeOutExpo, formatPercent() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (44): Props, Queue, DashboardSummary, DestinationQualityMatrix, GlobalSentimentDonut, MonthlySentimentChart, ReviewSourceMixChart, ScrapingJobHealthChart (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (37): formatOverviewNumber(), formatOverviewPercent(), ScraperOverviewPanel(), getToneClass(), JobMonitorTable(), JobStatusDrawer(), LazyReviewYieldChart, LazyStatusDistributionChart (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (39): SearchFilterPanel(), BulkToolbar(), DestinationFilterBar(), DeleteConfirmationDialog(), DestinationPreviewDrawer(), DestinationsDataTable(), DeleteTarget, DestinationsTableProps (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (38): ChartLoadingPanel(), ChartPanel(), ChartPanelProps, buildSentimentDecision(), CompareSkeleton(), DestinationResultCard(), distanceKm(), EmptyCompareState() (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (26): NlpCommandPanel(), NlpHistoryPanel(), PipelineHeroPanel(), PipelineStepIndicator(), NlpResultWorkspace(), SentimentStackedBar(), formatDateTime(), formatFileSize() (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (32): ControlButton(), DEFAULT_ARC_LAYOUT, DEFAULT_ARC_PAINT, DEFAULT_CLUSTER_COLORS, DEFAULT_CLUSTER_THRESHOLDS, defaultStyles, Map, MapArcDatum (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (27): ReviewBulkToolbar(), ReviewFilterBar(), ConfidenceBadge(), DeleteReviewDialog(), ReviewDataTable(), ReviewPreviewDrawer(), ReviewHealthOverviewCards(), ReviewPriorityQueue() (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (27): DestinationDetailClient(), DestinationTopicSentimentChart, Props, DestinationAnchorNav(), DestinationTopActions(), DestinationGallerySectionProps, DestinationHeroSection(), DestinationNearbyList() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (27): MonthlySentimentLineChart, ActionItem, AdminActionChecklist(), MonthlySituationPanel(), OperationalSignalsPanel(), SentimentRiskPanel(), SignalHealthPanel(), SituationOverviewPanel() (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (14): ComparisonHeroPanel(), DestinationSelect(), CompareAnalysisView(), CustomTooltip(), DestinationOption, formatMetric(), MetricRow, Mode (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (20): DestinationCatalogCard(), DestinationCatalogCardProps, formatPercent(), formatScore(), getDescription(), getImage(), getTopicLabel(), AdminDestinationsPage() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (23): FineTopicDetail, SentimentBreakdown, TopicData, TopicGroupData, TopicReview, TopicReviewAssignment, cleanTopicName(), getDominantSentiment() (+15 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (23): AccountSafetyCard(), CompareTray(), FavoriteCard(), FavoritesEmptyState(), FavoritesHeader(), FavoritesSkeleton(), FavoriteToolbar(), NoResultsState() (+15 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (21): BentoGrid(), easeOutExpo, CinematicScene, easeOutExpo, HeroSection(), scenes, easeOutExpo, InfoSection() (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (16): AdminUpdateUserData, AdminUser, AdminUserDetail, adminUserService, DistributionCard(), FilterSelect(), HealthCard(), HeroMetric() (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (9): metadata, ComparePage(), getAllDestinations(), metadata, metadata, COLORS, DestinationAnalytics(), DestinationAnalyticsProps (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (14): mobileAdminLinks, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (19): buildTopicActionItems(), TopicMetrics, DeleteTopicDialog(), TopicGroupManager(), TopicsErrorState(), TopicsSkeleton(), ActionItem, DistributionBucket (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (18): cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), SelectContent() (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (15): CoverageDistributionChart, TopicAnalyticsWorkspace(), TopicCoverageParetoChart, EmptyTopicsState(), getToneClass(), HeroInsightCard(), MetricCard(), NamingDebtPanel() (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (11): AdminAnalyticsService, AnalyticsSummary, ApiEnvelope, CompareResult, normalizeDestinationAnalytics(), normalizeSentiment(), numberOrNull(), numberOrZero() (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (12): DestinationOption, DraftStop, RoutePlannerMap, VISIBILITY_OPTIONS, Paginated, RawRoute, RouteDestination, RoutePayload (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.19
Nodes (14): TopicReviewItem, buildAdminTopicReading(), buildTopicNameMap(), formatTopicList(), getDominantSentiment(), getPercent(), getSentimentLabel(), getSummaryTotal() (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.2
Nodes (12): TopicItem, MergeTopicsDialog(), RenameTopicDialog(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter() (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (9): AnalyticsSkeleton(), MetricRow, cleanTopicName(), formatMonth(), percent(), sentimentRate(), sentimentTotal(), TopicData (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (12): CategoryOption, DestinationFormModal(), DestinationFormModalProps, GalleryUploadError, RawCategoryOption, STEPS, ExistingImage, GalleryUploader() (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (6): Sheet(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 30 - "Community 30"
Cohesion: 0.26
Nodes (5): ThumbnailUploader(), ThumbnailUploaderProps, Button(), buttonVariants, Input()

### Community 31 - "Community 31"
Cohesion: 0.26
Nodes (10): SortButton(), TopicReviewTable(), Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.2
Nodes (8): ProfileClient(), RouteDetailClient(), RoutesClient(), SavedRoutesClient(), AdminSidebar(), sidebarGroups, AdminTopbar(), useAuthStore

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (7): RouteBuilderClient(), formatRouteDuration(), RouteCard(), RouteStopList(), RoutePlannerMap, routesService, TravelRoute

### Community 34 - "Community 34"
Cohesion: 0.2
Nodes (6): formatDate(), getInitial(), TabKey, tabs, UserDetailModal(), UserDetailModalProps

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (8): Map, MapMarker, MapRoute, MarkerContent, MarkerLabel, OSRMRouteData, RoutePlannerMap(), RoutePlannerMapProps

### Community 36 - "Community 36"
Cohesion: 0.2
Nodes (6): Label(), steps, UserFormModal(), UserFormModalProps, userFormSchema, UserFormValues

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (9): AiRenameResult, MergeTopicsResult, TopicDestinationItem, TopicDestinationsResponse, TopicGroupItem, TopicGroupPayload, TopicReviewAssignment, TopicReviewSentiment (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.28
Nodes (6): geist, metadata, RootLayout(), Providers(), queryClient, Toaster()

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (8): CompassButton(), MapArc(), MapClusterLayer(), MapControls(), MapMarker(), MapPopup(), MapRoute(), useMap()

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (5): Destination, DestinationSelect(), DestinationSelectProps, resolveImageUrl(), getImageUrl()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (4): ApiErrorResponse, LoginContent(), LoginFormValues, loginSchema

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (3): Footer(), footerLinks, Navbar()

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (4): RouteWaypoint, ProgressMap, RoutePlannerMap, SavedRouteProgressItem

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (4): authCookieAttributes(), AuthState, User, writeAuthCookie()

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (4): adminRoutes, authRoutes, config, protectedRoutes

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

## Knowledge Gaps
- **225 isolated node(s):** `protectedRoutes`, `adminRoutes`, `authRoutes`, `config`, `geist` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 37`, `Community 7`, `Community 8`, `Community 41`, `Community 13`, `Community 15`, `Community 21`, `Community 22`, `Community 27`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 19` to `Community 32`, `Community 1`, `Community 3`, `Community 36`, `Community 35`, `Community 38`, `Community 6`, `Community 40`, `Community 39`, `Community 17`, `Community 50`, `Community 24`, `Community 28`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 30` to `Community 34`, `Community 3`, `Community 36`, `Community 2`, `Community 5`, `Community 7`, `Community 15`, `Community 16`, `Community 19`, `Community 20`, `Community 23`, `Community 24`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `protectedRoutes`, `adminRoutes`, `authRoutes` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._