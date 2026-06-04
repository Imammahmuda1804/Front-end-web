# Catatan Refactor Web Next.js

Dokumen ini mencatat perubahan struktur refactor bertahap agar halaman tetap mudah dirawat dan lebih sesuai pola App Router.

## Batch Public Search

- `src/components/search/SearchClient.tsx` sekarang fokus pada state, query param, history, dan orchestration search.
- UI besar dipisah menjadi:
  - `SearchCommandSurface.tsx`: header search, mode, input, prompt cepat, dan info mode.
  - `SearchFilterPanel.tsx`: filter kota/kategori dan reset filter.
  - `SearchHistoryPanel.tsx`: daftar history, hapus satu item, dan bersihkan history.
  - `SearchResultSummary.tsx`: summary hasil, sort semantic, dan chip filter aktif.
  - `SearchLoadingGrid.tsx`: skeleton hasil.
  - `SearchEmptyState.tsx`: state kosong.
- Helper/type/API kecil berada di `search.utils.ts`, `search.types.ts`, `search.api.ts`, dan `search.constants.ts`.

## Batch Destination Detail

- `DestinationDetailClient.tsx` sekarang fokus pada favorite, active section, gallery state, review refresh, dan fetch nearby.
- UI dan helper dipisah menjadi:
  - `DestinationHeroSection.tsx`: hero detail, image, metric, dan CTA maps/trailer.
  - `DestinationDetailNav.tsx`: tombol kembali/favorit dan anchor nav section.
  - `DestinationNearbyList.tsx`: daftar destinasi terdekat.
  - `detail.ui.tsx`: section header, metric card, info tile, insight pill, dan review card.
  - `detail.types.ts`: DTO lokal detail destinasi.
  - `detail.utils.ts`: parser YouTube, formatter, pembersih nama topik, dan Haversine.

## Batch Topic Insight

- `TopicInsightSection.tsx` tetap mengatur state expand dan lazy load review topik.
- Type dan helper dipisah ke:
  - `topic-insight.types.ts`
  - `topic-insight.utils.ts`

## Batch Admin Detail

- `admin-compare.single.tsx` tetap menjadi entry analisis tunggal.
- Panel presentational dipindah ke `admin-compare.single.panels.tsx`.
- Chart Recharts tetap lazy-loaded dari `admin-compare.single.charts.tsx`.

## Batch Admin Scraper

- `scraper-components.tsx` diperkecil dan tetap menjadi barrel/entry kompatibel untuk import existing.
- `ScraperCommandPanel` dipindah ke `scraper-command-panel.tsx`.
- `ScrapingHistoryPanel` dipindah ke `scraping-history-panel.tsx`.
- Chart scraper tetap lazy-loaded lewat `scraper-charts.tsx`.

## Batch Admin Users

- `UsersClient.tsx` diperkecil agar fokus pada query, filter, pagination, modal state, dan mutation status user.
- Komponen metric, badge, filter select, distribution card, dan queue item dipindah ke `users-client.components.tsx`.
- Hero dan health overview dipindah ke `users-overview.tsx`.
- Dialog konfirmasi suspend/activate dipindah ke `user-status-dialog.tsx`.

## Batch Admin NLP Processing

- `NlpProcessingClient.tsx` diperkecil agar fokus pada destinasi, file, preflight, mode proses, submit, history state, dan toast.
- Panel command, preflight, mode selector, stepper, history, dan hero dipindah ke `nlp-processing.panels.tsx`.
- Workspace hasil analisis dan action lanjutan dipindah ke `nlp-processing.result.tsx`.
- Formatter ukuran file, waktu, rasio sentimen, dan tone class dipindah ke `nlp-processing.utils.ts`.

## Batch Admin Topics

- `TopicsClient.tsx` diperkecil agar fokus pada query, mutation, filter, pagination, dan orchestration taxonomy.
- Type dan helper taxonomy dipindah ke `topics-client.types.ts` dan `topics-client.utils.ts`.
- Drawer destinasi/topik dan ulasan topik dipindah ke `topics-client.drawers.tsx`.
- CRUD topic group dan pengelolaan anggota topik dipindah ke `topics-client.group-manager.tsx`.
- Chart coverage dan topic cloud workspace dipindah ke `topics-client.analytics.tsx`.
- Builder action queue dipindah ke `topics-client.actions.ts`.
