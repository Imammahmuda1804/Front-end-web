import type { Tone } from './admin-compare.types';
import { formatSigned } from './admin-compare.utils';

export type SituationTone = Extract<Tone, 'blue' | 'emerald' | 'amber' | 'rose' | 'slate'>;

export type SituationCardItem = {
  label: string;
  value: string;
  helper: string;
  tone: SituationTone;
};

export type OperationalSignal = {
  label: string;
  status: string;
  helper: string;
  tone: SituationTone;
};

export function buildSituationCards({
  positiveRatio,
  negativeRatio,
  negativeDelta,
  trendDelta,
  totalReviews,
  topicCount,
  trendCount,
  completeness,
}: {
  positiveRatio: number;
  negativeRatio: number;
  negativeDelta: number;
  trendDelta: number;
  totalReviews: number;
  topicCount: number;
  trendCount: number;
  completeness: number;
}): SituationCardItem[] {
  const visitorTone = negativeRatio >= 25 ? 'rose' : positiveRatio >= 70 ? 'emerald' : 'amber';
  const visitorValue = negativeRatio >= 25 ? 'Keluhan kuat' : positiveRatio >= 70 ? 'Mayoritas puas' : 'Campuran';
  const trendTone = trendCount <= 1 ? 'slate' : trendDelta >= 8 ? 'emerald' : trendDelta <= -8 ? 'rose' : 'blue';
  const trendValue = trendCount <= 1 ? 'Belum terbaca' : trendDelta >= 8 ? 'Membaik' : trendDelta <= -8 ? 'Menurun' : 'Stabil';
  const riskTone = negativeRatio >= 25 || negativeDelta > 5 ? 'rose' : negativeRatio >= 12 ? 'amber' : 'emerald';
  const riskValue = negativeRatio >= 25 || negativeDelta > 5 ? 'Butuh cek' : negativeRatio >= 12 ? 'Pantau' : 'Terkendali';
  const dataTone = completeness >= 80 && totalReviews >= 30 ? 'emerald' : completeness >= 60 ? 'blue' : 'amber';
  const dataValue = completeness >= 80 && totalReviews >= 30 ? 'Cukup solid' : completeness >= 60 ? 'Bisa dipakai' : 'Perlu data';

  return [
    {
      label: 'Kesan pengunjung',
      value: visitorValue,
      helper: `${positiveRatio}% positif, ${negativeRatio}% negatif dari ${totalReviews} ulasan.`,
      tone: visitorTone,
    },
    {
      label: 'Arah tren',
      value: trendValue,
      helper: trendCount > 1 ? `Perubahan rasio positif ${formatSigned(trendDelta, '%')} dari periode sebelumnya.` : 'Butuh minimal dua periode tren.',
      tone: trendTone,
    },
    {
      label: 'Tekanan risiko',
      value: riskValue,
      helper: negativeDelta > 0 ? `Rasio negatif naik ${formatSigned(negativeDelta, '%')}.` : `${negativeRatio}% ulasan masuk sentimen negatif.`,
      tone: riskTone,
    },
    {
      label: 'Kedalaman data',
      value: dataValue,
      helper: `${topicCount} topik, ${trendCount} periode tren, ${completeness}% kelengkapan sinyal.`,
      tone: dataTone,
    },
  ];
}

export function buildOperationalSignals({
  positiveRatio,
  negativeRatio,
  trendDelta,
  negativeDelta,
  totalReviews,
  topicCount,
  completeness,
}: {
  positiveRatio: number;
  negativeRatio: number;
  trendDelta: number;
  negativeDelta: number;
  totalReviews: number;
  topicCount: number;
  completeness: number;
}): OperationalSignal[] {
  return [
    {
      label: 'Promosi destinasi',
      status: positiveRatio >= 70 ? 'Layak didorong' : 'Pilih momentum',
      helper: positiveRatio >= 70 ? 'Sentimen positif cukup kuat untuk bahan kampanye atau rekomendasi.' : 'Promosi sebaiknya menunggu isu utama lebih stabil.',
      tone: positiveRatio >= 70 ? 'emerald' : 'blue',
    },
    {
      label: 'Monitoring keluhan',
      status: negativeRatio >= 20 || negativeDelta > 5 ? 'Prioritas tinggi' : 'Rutin',
      helper: negativeRatio >= 20 || negativeDelta > 5 ? 'Perlu baca ulasan negatif dan cek penyebab keluhan berulang.' : 'Belum ada lonjakan risiko besar dari ulasan.',
      tone: negativeRatio >= 20 || negativeDelta > 5 ? 'rose' : 'emerald',
    },
    {
      label: 'Validasi lapangan',
      status: trendDelta < -8 ? 'Segera cek' : 'Cek berkala',
      helper: trendDelta < -8 ? 'Tren positif menurun, perlu konfirmasi kondisi aktual di lokasi.' : 'Gunakan kunjungan berkala untuk menjaga kualitas data.',
      tone: trendDelta < -8 ? 'amber' : 'blue',
    },
    {
      label: 'Kualitas data',
      status: completeness >= 80 && totalReviews >= 30 && topicCount >= 3 ? 'Representatif' : 'Perlu dilengkapi',
      helper: completeness >= 80 && totalReviews >= 30 && topicCount >= 3 ? 'Data cukup untuk ringkasan situasi awal.' : 'Tambah review atau proses NLP ulang agar gambaran lebih kuat.',
      tone: completeness >= 80 && totalReviews >= 30 && topicCount >= 3 ? 'emerald' : 'amber',
    },
  ];
}

export function getTrendYearRange(trends: Array<{ name: string; year?: string }>) {
  const years = trends
    .map((trend) => trend.year || trend.name.match(/\b\d{4}\b/)?.[0])
    .filter((year): year is string => Boolean(year));

  if (years.length === 0) return 'Rentang tahun belum tersedia';

  const uniqueYears = Array.from(new Set(years)).sort();
  const firstYear = uniqueYears[0];
  const lastYear = uniqueYears.at(-1) || firstYear;

  return firstYear === lastYear ? `Tahun ${firstYear}` : `Rentang ${firstYear}-${lastYear}`;
}
