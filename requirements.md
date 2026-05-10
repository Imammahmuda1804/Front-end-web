# REQUIREMENTS.md — Frontend Web (Next.js)

# 1. Overview

Frontend web merupakan antarmuka utama sistem rekomendasi wisata berbasis AI.

Frontend bertanggung jawab untuk:

* menampilkan recommendation destination
* semantic search experience
* analytics visualization
* destination comparison
* sentiment analytics visualization
* topic exploration
* dashboard admin
* scraping management
* user interaction

Frontend harus:

* modern
* responsive
* analytics-oriented
* SEO friendly
* scalable
* modular
* frontend/backend decoupled

Frontend wajib sepenuhnya sinkron dengan:

* UML proyek
* backend endpoint contract
* NLP analytics flow
* recommendation architecture

---

# 2. Frontend Architecture

## 2.1 Technology Stack

| Component        | Technology            |
| ---------------- | --------------------- |
| Framework        | Next.js 15 App Router |
| Language         | TypeScript            |
| Styling          | Tailwind CSS          |
| UI Components    | shadcn/ui             |
| State Management | Zustand               |
| Data Fetching    | TanStack Query        |
| Form Handling    | React Hook Form       |
| Validation       | Zod                   |
| Chart Library    | Recharts              |
| Table            | TanStack Table        |
| Icons            | Lucide React          |
| Animation        | Framer Motion         |
| HTTP Client      | Axios                 |
| Authentication   | JWT Auth              |
| Theme            | next-themes           |
| Carousel         | Embla Carousel        |
| File Upload      | React Dropzone        |
| Notification     | Sonner                |
| Date Utility     | date-fns              |

---

# 3. Frontend Architectural Pattern

Menggunakan:

* feature-based architecture
* component-driven architecture
* modular folder structure
* reusable UI system

---

# 4. Folder Structure

```text id="v9ftul"
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── admin/
│   ├── api/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── charts/
│   ├── cards/
│   ├── forms/
│   ├── layout/
│   ├── tables/
│   ├── analytics/
│   └── search/
│
├── features/
│   ├── auth/
│   ├── destination/
│   ├── analytics/
│   ├── search/
│   ├── comparison/
│   ├── favorites/
│   ├── scraper/
│   ├── topics/
│   └── admin/
│
├── hooks/
├── lib/
├── services/
├── store/
├── types/
├── constants/
├── utils/
└── styles/
```

---

# 5. Routing Structure

## Public Routes

```text id="x59tzy"
/                      → Landing page
/destination/[id]     → Detail destination
/search               → Semantic search result
/compare              → Compare destination
/profile              → User profile
/favorites            → Favorite destination
/login
/register
```

---

## Admin Routes

```text id="1x9cza"
/admin
/admin/analytics/[id]
/admin/compare
/admin/reviews
/admin/destinations
/admin/users
```

---

# 6. Design System Requirement

UI harus:

* modern
* professional
* clean
* tourism analytics feel
* responsive
* dashboard oriented

---

## Visual Style

Gunakan:

* glassmorphism ringan
* soft shadow
* rounded card
* analytics dashboard layout
* modern typography
* spacious layout

---

# 7. Layout System

## User Layout

Komponen:

* navbar
* footer
* floating search
* mobile navigation

---

## Admin Layout

Komponen:

* sidebar
* top navbar
* dashboard container
* responsive table layout

---

# 8. Authentication Flow

Frontend menggunakan:

* JWT Access Token
* Refresh Token

---

## Auth Storage

Gunakan:

* httpOnly cookie untuk refresh token
* Zustand auth store
* protected route middleware

---

# 9. API Layer Architecture

Semua request API dipisahkan dalam service layer.

---

## Structure

```text id="qq5p1m"
services/
├── auth.service.ts
├── destination.service.ts
├── analytics.service.ts
├── scraper.service.ts
├── search.service.ts
├── user.service.ts
└── topic.service.ts
```

---

# 10. Axios Configuration

Wajib memiliki:

* baseURL
* token interceptor
* refresh token interceptor
* global error handling

---

# 11. State Management

Gunakan Zustand untuk:

* auth state
* search state
* filter state
* theme state
* compare state

---

# 12. Data Fetching Strategy

Gunakan TanStack Query untuk:

* caching
* pagination
* infinite scroll
* optimistic update
* background refetch

---

# 13. Chart Requirement

Semua analytics wajib divisualisasikan.

---

## Chart Types

| Analytics              | Chart                |
| ---------------------- | -------------------- |
| Sentiment distribution | Donut chart          |
| Trend sentiment        | Line chart           |
| Topic distribution     | Bar chart            |
| Compare analytics      | Radar chart          |
| Recommendation ranking | Horizontal bar chart |

---

# 14. USER PAGES

# 14.1 Landing Page

## Features

* hero recommendation
* semantic search
* recommendation grid
* trending carousel
* topic filter
* mini analytics

---

## Components

```text id="p0wb7v"
HeroRecommendation
GlobalSearchBar
TopicFilterChips
RecommendationCard
TrendingCarousel
MiniAnalyticsSection
```

---

## API Used

```text id="utb7x6"
GET /api/destinations/recommendations
GET /api/destinations/ranking
GET /api/topics
GET /api/analytics/dashboard
POST /api/search
```

---

# 14.2 Detail Destination Page

## Features

* gallery
* youtube trailer
* sentiment analytics
* topic insight
* review section
* favorite button
* recommendation insight

---

## Components

```text id="b1exqq"
DestinationGallery
DestinationHeader
SentimentChart
TopicInsight
ReviewList
RecommendationCard
FavoriteButton
```

---

## API Used

```text id="r6h2j9"
GET /api/destinations/:id
GET /api/analytics/destinations/:id
GET /api/analytics/destinations/:id/topics
GET /api/analytics/trends/:id
POST /api/user-reviews
POST /api/favorites/:destinationId
```

---

# 14.3 Search Result Page

## Features

* semantic search
* AI recommendation
* filter sidebar
* topic filter
* search suggestion

---

## Components

```text id="g5e3hf"
SearchBar
SearchFilterSidebar
SearchResultGrid
RecommendationCard
SearchSuggestion
```

---

## API Used

```text id="6rgl0h"
POST /api/search
GET /api/topics/:id/destinations
GET /api/search/history
```

---

# 14.4 Compare Destination Page

## Features

* compare analytics
* sentiment comparison
* topic comparison
* trend comparison

---

## Components

```text id="7cyrvn"
CompareSelector
RadarComparisonChart
SentimentComparisonChart
TrendComparisonChart
TopicComparisonCard
```

---

## API Used

```text id="b9xj4w"
GET /api/analytics/compare
```

---

# 14.5 User Profile & Favorite

## Features

* profile management
* favorite destination
* review history
* search history

---

## Components

```text id="wsv5yq"
ProfileHeader
FavoriteGrid
ReviewHistory
SearchHistory
ProfileEditForm
```

---

## API Used

```text id="trt2by"
GET /api/users/profile
PUT /api/users/profile
GET /api/favorites
DELETE /api/favorites/:destinationId
GET /api/search/history
```

---

# 15. ADMIN PAGES

# 15.1 Admin Dashboard

## Features

* analytics summary
* sentiment trend
* top recommendation
* recent activity
* destination analytics table

---

## Components

```text id="w01u8g"
SummaryCards
GlobalSentimentChart
TopicDistributionChart
RecentActivity
DestinationAnalyticsTable
```

---

## API Used

```text id="iv3wmm"
GET /api/admin/dashboard/summary
GET /api/admin/dashboard/activity
GET /api/admin/dashboard/trends
GET /api/admin/destinations
```

---

# 15.2 Destination Analytics Page

## Features

* destination performance
* sentiment analytics
* topic analytics
* review analytics
* scraping history

---

## Components

```text id="m37xzt"
DestinationAnalyticsHeader
SentimentTrendChart
TopicDistributionChart
ReviewAnalyticsTable
WordCloud
ScrapingHistoryTable
```

---

## API Used

```text id="c6h5ee"
GET /api/admin/destinations/:id
GET /api/analytics/destinations/:id
GET /api/analytics/destinations/:id/topics
GET /api/analytics/trends/:id
POST /api/admin/analytics/recalculate/:destinationId
```

---

# 15.3 Compare Performance Page

## Features

* compare destination analytics
* trend comparison
* topic comparison

---

## Components

```text id="lbrr5p"
CompareAnalyticsSelector
RadarChart
ComparisonTable
TrendComparisonChart
TopicComparisonChart
```

---

## API Used

```text id="fd3sd9"
GET /api/analytics/compare
```

---

# 15.4 Review Analysis Page

## Features

* Google Maps scraping
* upload CSV
* scraping monitoring
* NLP pipeline visualization
* download CSV

---

## Components

```text id="a3nqns"
ScrapingForm
CSVUpload
ScrapingProgress
ScrapingJobTable
PipelineVisualization
CSVDownloadButton
```

---

## API Used

```text id="j6h2dz"
GET /api/admin/scraper/search
POST /api/admin/scraper/start
GET /api/admin/scraper/status/:jobId
GET /api/admin/scraper/jobs
GET /api/admin/scraper/history
GET /api/admin/scraper/download/:jobId
POST /api/admin/scraper/process/:jobId
```

---

# 15.5 Destination Management Page

## Features

* CRUD destination
* upload gallery
* maps management
* youtube management

---

## Components

```text id="6ay6bm"
DestinationTable
DestinationForm
GalleryUploader
DeleteModal
```

---

## API Used

```text id="z61q1q"
POST /api/admin/destinations
PUT /api/admin/destinations/:id
DELETE /api/admin/destinations/:id
POST /api/admin/destinations/:id/images
DELETE /api/admin/destination-images/:id
```

---

# 15.6 User Management Page

## Features

* user management
* review moderation
* user analytics

---

## Components

```text id="r1lh2r"
UserTable
UserDetailModal
UserAnalyticsCards
UserActivityTimeline
```

---

## API Used

```text id="jlwm06"
GET /api/admin/users
GET /api/admin/users/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

---

# 16. Table Requirement

Semua table wajib:

* pagination
* sorting
* filtering
* responsive
* sticky header

---

# 17. Form Requirement

Semua form wajib:

* Zod validation
* loading state
* error handling
* success feedback
* optimistic UI

---

# 18. Loading & Error State

Semua page wajib memiliki:

* skeleton loading
* empty state
* error fallback
* retry button

---

# 19. Responsive Requirement

Frontend wajib:

* mobile responsive
* tablet responsive
* desktop optimized

---

# 20. SEO Requirement

Landing page wajib:

* SEO optimized
* metadata dynamic
* OpenGraph support
* structured data

---

# 21. Performance Requirement

Frontend wajib:

* lazy loading
* image optimization
* route splitting
* dynamic import
* caching

---

# 22. Accessibility Requirement

Frontend wajib:

* keyboard accessible
* semantic HTML
* aria label
* accessible chart

---

# 23. Security Requirement

Frontend wajib:

* protected route
* token refresh handling
* secure cookie handling
* role-based route protection

---

# 24. Expected Frontend Capability

Frontend harus mampu:

* semantic tourism search
* analytics visualization
* AI recommendation visualization
* destination comparison
* topic exploration
* Google Maps scraping management
* NLP analytics visualization
* admin orchestration dashboard
