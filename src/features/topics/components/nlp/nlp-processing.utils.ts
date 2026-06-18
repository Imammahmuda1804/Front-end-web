import type { NlpUploadResponse } from "../../services/nlp.service";

export type Tone = "orange" | "blue" | "emerald" | "amber" | "rose" | "slate";

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function sentimentTotal(result: NlpUploadResponse | null) {
  if (!result) return 0;
  return result.nlp_summary.positive + result.nlp_summary.neutral + result.nlp_summary.negative;
}

export function sentimentPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getToneClass(tone: Tone) {
  return {
    orange: "border-orange-100 bg-orange-50 text-primary",
    blue: "border-sky-100 bg-sky-50 text-ai",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-white text-slate-700",
  }[tone];
}
