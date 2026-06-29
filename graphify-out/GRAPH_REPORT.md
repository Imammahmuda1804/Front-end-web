# Graph Report - web  (2026-06-22)

## Corpus Check
- 216 files · ~454,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1420 nodes · 2506 edges · 81 communities (68 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 83 edges
2. `dependencies` - 31 edges
3. `Button()` - 30 edges
4. `getImageUrl()` - 25 edges
5. `api` - 20 edges
6. `NativeSelect()` - 18 edges
7. `compilerOptions` - 16 edges
8. `RANAHINSIGHT Web Service` - 16 edges
9. `AdminTopicService` - 15 edges
10. `Card()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `ReviewCard()` --calls--> `dayjs`  [INFERRED]
  src/features/destination/components/detail.ui.tsx → package.json
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `LoginContent()` --calls--> `useAuthStore`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/features/auth/store/auth.store.ts
- `Navbar()` --calls--> `useAuthStore`  [INFERRED]
  src/components/layout/Navbar.tsx → src/features/auth/store/auth.store.ts

## Communities (81 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (54): CategoryOption, DestinationFormModal(), DestinationFormModalProps, GalleryUploadError, RawCategoryOption, STEPS, ExistingImage, GalleryUploader() (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (42): Props, Queue, DashboardSummary, DestinationQualityMatrix, GlobalSentimentDonut, MonthlySentimentChart, ReviewSourceMixChart, ScrapingJobHealthChart (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (50): SearchClient(), SearchCommandSurface(), SearchEmptyState(), SearchFilterPanel(), SearchHistoryPanel(), SearchLoadingGrid(), easeOutExpo, formatPercent() (+42 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (49): geist, metadata, RootLayout(), DestinationCatalogCard(), DestinationCatalogCardProps, formatPercent(), formatScore(), getDescription() (+41 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (37): formatOverviewNumber(), formatOverviewPercent(), ScraperOverviewPanel(), getToneClass(), JobMonitorTable(), JobStatusDrawer(), LazyReviewYieldChart, LazyStatusDistributionChart (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (20): BulkToolbar(), DestinationFilterBar(), DeleteConfirmationDialog(), DestinationPreviewDrawer(), DestinationsTableProps, getQuality(), InitialFilters, matchesQuality() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (10): formatRouteDuration(), RouteCard(), RouteStopList(), Map, MapMarker, MapRoute, MarkerContent, RouteDetailClient() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (30): dependencies, axios, @base-ui/react, class-variance-authority, clsx, date-fns, embla-carousel-react, framer-motion (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (38): ChartLoadingPanel(), ChartPanel(), ChartPanelProps, buildSentimentDecision(), CompareSkeleton(), DestinationResultCard(), distanceKm(), EmptyCompareState() (+30 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (22): ReviewBulkToolbar(), ReviewFilterBar(), DeleteReviewDialog(), ReviewDataTable(), ReviewHealthOverviewCards(), ReviewPriorityQueue(), DeleteTarget, formatDate() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (41): Admin Bandingkan dan Analitik Detail, Admin Dashboard, Admin Destinations, Admin NLP Processing, Admin Reviews, Admin Scraper, Admin Topics, Admin Users (+33 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (26): NlpCommandPanel(), NlpHistoryPanel(), PipelineHeroPanel(), PipelineStepIndicator(), NlpResultWorkspace(), SentimentStackedBar(), formatDateTime(), formatFileSize() (+18 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (28): DestinationDetailClient(), DestinationTopicSentimentChart, Props, DestinationAnchorNav(), DestinationTopActions(), DestinationGallerySectionProps, DestinationHeroSection(), DestinationNearbyList() (+20 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (28): MonthlySentimentLineChart, ActionItem, AdminActionChecklist(), MonthlySituationPanel(), OperationalSignalsPanel(), SentimentRiskPanel(), SignalHealthPanel(), SituationOverviewPanel() (+20 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (13): ComparisonHeroPanel(), CompareAnalysisView(), CustomTooltip(), DestinationOption, formatMetric(), MetricRow, Mode, SENTIMENT_COLORS (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (31): Auth dan Route Protection, Backend tidak terhubung, Catatan Tampilan, Chart width/height warning, code:powershell (cd "D:\Kuliah\Ta\New folder\web"), code:powershell (cd "D:\Kuliah\Ta\New folder\web"), code:powershell (npm install), code:env (NEXT_PUBLIC_API_URL=http://localhost:3000/api) (+23 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (23): FineTopicDetail, SentimentBreakdown, TopicData, TopicGroupData, TopicReview, TopicReviewAssignment, cleanTopicName(), getDominantSentiment() (+15 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (13): BentoGrid(), easeOutExpo, CinematicScene, easeOutExpo, HeroSection(), scenes, easeOutExpo, InfoSection() (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (19): buildTopicActionItems(), TopicMetrics, TopicCommandPanel(), TopicDestinationContextPanel(), TopicsErrorState(), TopicReviewTable(), ActionItem, DistributionBucket (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.05
Nodes (53): DestinationsDataTable(), DeleteTarget, mobileAdminLinks, Footer(), footerLinks, Navbar(), cn(), Avatar() (+45 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (13): AdminDestinationsPage(), AdminDestinationsPageProps, DestinationsPage(), getDestinations(), getParamValue(), getServerApiUrl(), metadata, metadata (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (14): AdminReviewsClient(), AdminReviewsClientProps, isReviewTab(), ReviewTab, ReviewWorkspaceFilters, COLORS, DestinationAnalytics(), DestinationAnalyticsProps (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (12): AdminAnalyticsService, AnalyticsSummary, ApiEnvelope, CompareResult, normalizeDestinationAnalytics(), normalizeSentiment(), numberOrNull(), numberOrZero() (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (16): TopicDestinationItem, TopicReviewItem, TopicReviewSentiment, buildAdminTopicReading(), buildTopicNameMap(), formatTopicList(), getDominantSentiment(), getPercent() (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (5): metadata, ComparePage(), getAllDestinations(), metadata, metadata

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (8): DestinationSelect(), AnalyticsSkeleton(), cleanTopicName(), formatMonth(), percent(), sentimentRate(), sentimentTotal(), TopicData

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (9): AiRenameResult, MergeTopicsResult, TopicDestinationsResponse, TopicGroupItem, TopicGroupPayload, TopicItem, TopicReviewAssignment, TopicReviewsResponse (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.04
Nodes (34): ControlButton(), DEFAULT_ARC_LAYOUT, DEFAULT_ARC_PAINT, DEFAULT_CLUSTER_COLORS, DEFAULT_CLUSTER_THRESHOLDS, defaultStyles, Map, MAP_STYLES (+26 more)

### Community 32 - "Community 32"
Cohesion: 0.2
Nodes (9): Batch Admin Detail, Batch Admin NLP Processing, Batch Admin Scraper, Batch Admin Topics, Batch Admin Users, Batch Destination Detail, Batch Public Search, Batch Topic Insight (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (7): Props, api, failedQueue, FailedRequest, ApiErrorResponse, LoginFormValues, loginSchema

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): Anti-Patterns Verdict, Design Critique: Halaman Rute Pariwisata (web/src/components/routes), Design Health Score, Overall Impression, Persona Red Flags, Priority Issues, What's Working

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): Anti-Patterns Verdict, Design Critique: Halaman Rute Pariwisata (web/src/components/routes), Design Health Score, Overall Impression, Persona Red Flags, Priority Issues, What's Working

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (6): Paginated, RawRoute, RouteDestination, RouteStop, SavedRouteProgressResponse, SavedRouteProgressStatus

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (15): CoverageDistributionChart, TopicAnalyticsWorkspace(), TopicCoverageParetoChart, EmptyTopicsState(), getToneClass(), HeroInsightCard(), MetricCard(), NamingDebtPanel() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): 1. Struktur Halaman & State Management, 2. Komponen Antarmuka Utama, 3. Estetika (Joy Vibes), Endpoint Terkait:, 🛑 Open Questions (Butuh Keputusan Anda), Rincian Pekerjaan & Proposed Implementation, Task 4: Search Result Page (User)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (9): DestinationOption, DraftStop, Map, MapMarker, MapRoute, RouteBuilderClient(), VISIBILITY_OPTIONS, RoutePayload (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (7): ProfileClient(), RoutesClient(), AdminSidebar(), sidebarGroups, AdminTopbar(), LoginContent(), useAuthStore

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (10): devDependencies, cross-env, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (4): adminRoutes, authRoutes, config, protectedRoutes

### Community 47 - "Community 47"
Cohesion: 0.4
Nodes (3): Design System & Rules, Product Context, Tech Stack

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (6): Map, MapMarker, MapRoute, ProgressMap, SavedRoutesClient(), SavedRouteProgressItem

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 10: Admin Destination Analytics & Compare (Admin)

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 11: Admin Review Analysis & Scraper (Admin)

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 12: Admin User Management (Admin)

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 1: Setup & Core Architecture

### Community 53 - "Community 53"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 3: Landing Page (User)

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 2: Authentication & Layouting

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 5: Detail Destination Page (User)

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 6: Compare Destination Page (User)

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 7: User Profile & Favorites Page (User)

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 8: Admin Dashboard (Admin)

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (3): Endpoint Terkait:, Rincian Pekerjaan:, Task 9: Admin Destination Management (Admin)

### Community 63 - "Community 63"
Cohesion: 0.25
Nodes (6): AdminDestination, DestinationData, DestinationImage, DestinationListResponse, DestinationQueryParams, FileTooLargeError

### Community 74 - "Community 74"
Cohesion: 0.25
Nodes (8): CompassButton(), MapArc(), MapClusterLayer(), MapControls(), MapMarker(), MapPopup(), MapRoute(), useMap()

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (3): ApiErrorResponse, RegisterFormValues, registerSchema

### Community 76 - "Community 76"
Cohesion: 0.4
Nodes (4): authCookieAttributes(), AuthState, User, writeAuthCookie()

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (6): scripts, build, dev, dev:turbo, lint, start

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (5): ConfidenceBadge(), ReviewPreviewDrawer(), confidenceLevel(), formatConfidence(), isProcessed()

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (3): name, private, version

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

## Knowledge Gaps
- **421 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+416 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 19` to `Community 0`, `Community 1`, `Community 3`, `Community 7`, `Community 42`, `Community 74`, `Community 80`, `Community 22`, `Community 31`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `api` connect `Community 33` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 36`, `Community 4`, `Community 9`, `Community 41`, `Community 75`, `Community 12`, `Community 11`, `Community 23`, `Community 30`, `Community 63`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 7` to `Community 12`, `Community 79`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _421 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._