# Task 11: Admin Review Analysis & Scraper (Admin)

Sistem pengontrol / orchestrator untuk proses *data scraping* dan pemrosesan pemodelan Natural Language Processing (NLP).

## Rincian Pekerjaan:
1. **Scraping Management Form**: Form pencarian (`/search`) untuk mencari destinasi di Maps dan Trigger awal proses Scraping Apify (`/start`).
2. **Job Status & Job Table**: Tabel monitoring untuk melihat progress scraping aktif dan antrian pekerjaan (*jobs*).
3. **Scraping History**: Log tabel riwayat scraping yang sukses/gagal di suatu destinasi.
4. **NLP Pipeline Orchestration**: Visualisasi tahapan / tombol trigger ke pemrosesan AI (NLP sentimen analisis).
5. **CSV Download**: Tombol download hasil mentah / terstruktur ke format CSV.

## Endpoint Terkait:
- `GET /api/admin/scraper/search`
- `POST /api/admin/scraper/start`
- `GET /api/admin/scraper/status/:jobId`
- `GET /api/admin/scraper/jobs`
- `GET /api/admin/scraper/history`
- `POST /api/admin/scraper/process/:jobId`
- `GET /api/admin/scraper/download/:jobId`
