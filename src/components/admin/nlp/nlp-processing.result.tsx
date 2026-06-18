import Link from "next/link";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Layers3,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Tags,
} from "lucide-react";

import type { NlpUploadResponse } from "@/services/admin/nlp.service";
import { getToneClass, sentimentPercent, sentimentTotal, type Tone } from "./nlp-processing.utils";

export function NlpResultWorkspace({ result, isProcessing, selectedDestinationId, positiveRatio, negativeRatio }: { result: NlpUploadResponse | null; isProcessing: boolean; selectedDestinationId: string; positiveRatio: number; negativeRatio: number }) {
  if (isProcessing) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50 text-primary">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="text-xl font-black text-slate-950">Pipeline NLP sedang berjalan</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">Sistem membaca file, menyimpan review, menghitung rating, lalu menjalankan sentimen, topik, dan embedding.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileSpreadsheet className="mb-4 h-10 w-10 text-slate-300" />
        <h2 className="text-xl font-black text-slate-950">Belum ada hasil analisis</h2>
        <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">Pilih destinasi, upload file hasil scraping, lalu jalankan analisis NLP.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-700" />
          <div>
            <p className="font-black text-emerald-900">Analisis selesai</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">{result.total_reviews_processed} ulasan berhasil diproses untuk {result.destination_name}.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ResultMetricCard label="Total Ulasan" value={String(result.nlp_summary.total)} helper="Diproses" icon={MessageSquareText} tone="blue" />
        <ResultMetricCard label="Rating Rata-rata" value={result.scraped_average_rating ? `${result.scraped_average_rating} / 5` : "-"} helper="File scraping" icon={Sparkles} tone="amber" />
        <ResultMetricCard label="Positif" value={String(result.nlp_summary.positive)} helper={`${positiveRatio}% dari total`} icon={BarChart3} tone="emerald" />
        <ResultMetricCard label="Negatif" value={String(result.nlp_summary.negative)} helper={`${negativeRatio}% dari total`} icon={ShieldAlert} tone={negativeRatio >= 20 ? "rose" : "slate"} />
      </section>

      <SentimentStackedBar result={result} positiveRatio={positiveRatio} negativeRatio={negativeRatio} />
      <PipelineActionPanel selectedDestinationId={selectedDestinationId} negativeRatio={negativeRatio} />
    </div>
  );
}

function SentimentStackedBar({ result, positiveRatio, negativeRatio }: { result: NlpUploadResponse; positiveRatio: number; negativeRatio: number }) {
  const total = sentimentTotal(result);
  const neutralRatio = sentimentPercent(result.nlp_summary.neutral, total);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Sentiment 100% stacked</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">Distribusi Sentimen</h3>
      <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-emerald-500" style={{ width: `${positiveRatio}%` }} />
        <div className="bg-slate-300" style={{ width: `${neutralRatio}%` }} />
        <div className="bg-rose-500" style={{ width: `${negativeRatio}%` }} />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black sm:grid-cols-3">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Positif {positiveRatio}%</span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Netral {neutralRatio}%</span>
        <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700">Negatif {negativeRatio}%</span>
      </div>
    </section>
  );
}

function PipelineActionPanel({ selectedDestinationId, negativeRatio }: { selectedDestinationId: string; negativeRatio: number }) {
  const needsAudit = negativeRatio >= 20;
  const links = [
    { label: "Buka Review", href: selectedDestinationId ? `/admin/reviews?destinationId=${selectedDestinationId}&tab=reviews` : "/admin/reviews", icon: MessageSquareText, tone: (needsAudit ? "rose" : "blue") as Tone },
    { label: "Kelola Topik", href: "/admin/topics", icon: Tags, tone: "orange" as Tone },
    { label: "Compare Analytics", href: "/admin/compare", icon: Layers3, tone: "emerald" as Tone },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`mb-5 rounded-lg border p-4 ${needsAudit ? "border-rose-100 bg-rose-50 text-rose-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
        <div className="flex items-start gap-3">
          {needsAudit ? <AlertTriangle className="mt-0.5 h-5 w-5" /> : <CheckCircle2 className="mt-0.5 h-5 w-5" />}
          <div>
            <p className="font-black text-slate-950">{needsAudit ? "Perlu audit review negatif" : "Risiko sentimen terkendali"}</p>
            <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{needsAudit ? `${negativeRatio}% hasil bernada negatif. Prioritaskan review management.` : "Distribusi negatif masih rendah dari hasil pemrosesan terakhir."}</p>
          </div>
        </div>
      </div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-ai">Next action</p>
      <div className="grid gap-3 md:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className={`rounded-lg border p-4 transition hover:-translate-y-0.5 ${getToneClass(item.tone)}`}>
              <Icon className="mb-3 h-5 w-5" />
              <p className="font-black text-slate-950">{item.label}</p>
              <p className="mt-1 text-xs font-bold opacity-80">Lanjutkan tindak lanjut admin</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ResultMetricCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: Tone }) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${getToneClass(tone)}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </article>
  );
}
