import Link from "next/link";
import { BarChart3, FileSpreadsheet, Layers3, MessageSquareText, RefreshCw, Tags } from "lucide-react";

import type { NlpUploadResponse } from "../../services/nlp.service";
import { getToneClass, type Tone } from "./nlp-processing.utils";

export function NlpResultWorkspace({
  result,
  isProcessing,
}: {
  result: NlpUploadResponse | null;
  isProcessing: boolean;
}) {
  if (isProcessing) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50 text-primary">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="text-xl font-black text-slate-950">Mengantrekan pipeline NLP</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
          File sedang diunggah dan akan diproses di latar belakang. Cek riwayat untuk melihat progres.
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileSpreadsheet className="mb-4 h-10 w-10 text-slate-300" />
        <h2 className="text-xl font-black text-slate-950">Belum ada hasil analisis</h2>
        <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
          Pilih destinasi, upload file hasil scraping, lalu jalankan analisis NLP.
        </p>
      </section>
    );
  }

  if (result.status === "queued" || result.status === "processing") {
    return (
      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-1 h-5 w-5 animate-spin text-blue-700" />
          <div>
            <p className="font-black text-blue-900">Pipeline sedang diproses</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-blue-700">
              {result.total_reviews} ulasan untuk {result.destination_name} sedang diproses di latar belakang.{" "}
              Status akan muncul di riwayat setelah selesai.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
