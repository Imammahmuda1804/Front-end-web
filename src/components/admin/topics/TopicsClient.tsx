'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTopicService, TopicItem } from '@/services/admin/topic.service';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Sparkles,
  Pencil,
  Trash2,
  Tags,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ArrowUpDown,
  Hash,
  MapPin,
} from 'lucide-react';

/* ─── Color palette for topic bubbles ─── */
const BUBBLE_COLORS = [
  { bg: 'oklch(0.92 0.05 30)', border: 'oklch(0.78 0.12 30)', text: 'oklch(0.35 0.12 30)' },
  { bg: 'oklch(0.92 0.05 240)', border: 'oklch(0.72 0.1 240)', text: 'oklch(0.35 0.1 240)' },
  { bg: 'oklch(0.93 0.04 150)', border: 'oklch(0.75 0.1 150)', text: 'oklch(0.35 0.1 150)' },
  { bg: 'oklch(0.92 0.05 300)', border: 'oklch(0.75 0.1 300)', text: 'oklch(0.35 0.1 300)' },
  { bg: 'oklch(0.93 0.04 60)', border: 'oklch(0.78 0.12 60)', text: 'oklch(0.35 0.12 60)' },
  { bg: 'oklch(0.92 0.05 180)', border: 'oklch(0.72 0.1 180)', text: 'oklch(0.35 0.1 180)' },
  { bg: 'oklch(0.93 0.04 0)', border: 'oklch(0.78 0.12 0)', text: 'oklch(0.35 0.12 0)' },
  { bg: 'oklch(0.92 0.05 90)', border: 'oklch(0.75 0.1 90)', text: 'oklch(0.35 0.1 90)' },
];

const getColor = (i: number) => BUBBLE_COLORS[i % BUBBLE_COLORS.length];

type SortKey = 'name' | 'destinations' | 'id';
type SortDir = 'asc' | 'desc';

export function TopicsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('destinations');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [renameTarget, setRenameTarget] = useState<TopicItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TopicItem | null>(null);

  /* ─── Queries ─── */
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => adminTopicService.getTopics(),
  });

  /* ─── Mutations ─── */
  const aiRenameMutation = useMutation({
    mutationFn: () => adminTopicService.triggerAiRename(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast.success(
        `AI Rename selesai: ${result.renamed} berhasil, ${result.failed} gagal dari ${result.total} topik`,
      );
    },
    onError: () => toast.error('Gagal menjalankan AI Rename. Cek quota Gemini API.'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminTopicService.renameTopic(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setRenameTarget(null);
      toast.success('Topik berhasil di-rename');
    },
    onError: () => toast.error('Gagal me-rename topik'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTopicService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setDeleteTarget(null);
      toast.success('Topik berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus topik'),
  });

  /* ─── Derived state ─── */
  const filtered = useMemo(() => {
    let result = topics.filter(
      (t) =>
        t.topic_name.toLowerCase().includes(search.toLowerCase()) ||
        t.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase())),
    );

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.topic_name.localeCompare(b.topic_name);
      else if (sortKey === 'destinations') cmp = a.total_destinations - b.total_destinations;
      else cmp = a.id - b.id;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [topics, search, sortKey, sortDir]);

  const unnamedCount = topics.filter((t) => t.topic_name.startsWith('Topic ')).length;
  const totalDestLinks = topics.reduce((sum, t) => sum + t.total_destinations, 0);

  /* ─── Sort toggle ─── */
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  /* ─── Bubble visualization: top 20 topics by destination count ─── */
  const topBubbles = useMemo(() => {
    return [...topics]
      .sort((a, b) => b.total_destinations - a.total_destinations)
      .slice(0, 24);
  }, [topics]);

  const maxDest = Math.max(...topBubbles.map((t) => t.total_destinations), 1);

  return (
    <div className="space-y-8">
      {/* ─── Summary strip ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Tags className="h-5 w-5" />}
          label="Total Topik"
          value={topics.length}
          accent="oklch(0.68 0.17 42)"
        />
        <SummaryCard
          icon={<MapPin className="h-5 w-5" />}
          label="Total Relasi Destinasi"
          value={totalDestLinks}
          accent="oklch(0.55 0.1 240)"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Belum Diberi Nama AI"
          value={unnamedCount}
          accent={unnamedCount > 0 ? 'oklch(0.65 0.18 55)' : 'oklch(0.6 0.15 150)'}
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Rata-rata Destinasi/Topik"
          value={topics.length > 0 ? (totalDestLinks / topics.length).toFixed(1) : '0'}
          accent="oklch(0.55 0.12 300)"
        />
      </div>

      {/* ─── Bubble map visualization ─── */}
      {topBubbles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Distribusi Topik Utama
          </h3>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="flex flex-wrap gap-3 justify-center items-end" style={{ minHeight: 140 }}>
              {topBubbles.map((topic, i) => {
                const ratio = topic.total_destinations / maxDest;
                const size = Math.max(48, Math.round(ratio * 110));
                const color = getColor(i);
                const displayName =
                  topic.topic_name.length > 18
                    ? topic.topic_name.slice(0, 16) + '…'
                    : topic.topic_name;

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSearch(topic.topic_name);
                    }}
                    title={`${topic.topic_name} (${topic.total_destinations} destinasi)`}
                    className="relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer select-none"
                    style={{
                      width: size + 40,
                      height: size,
                      background: color.bg,
                      border: `1.5px solid ${color.border}`,
                    }}
                  >
                    <span
                      className="font-bold tabular-nums"
                      style={{ fontSize: Math.max(14, size * 0.25), color: color.text }}
                    >
                      {topic.total_destinations}
                    </span>
                    <span
                      className="leading-tight text-center px-1"
                      style={{
                        fontSize: Math.max(9, Math.min(11, size * 0.12)),
                        color: color.text,
                        opacity: 0.8,
                        maxWidth: size + 30,
                      }}
                    >
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Toolbar ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari topik atau kata kunci..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {unnamedCount > 0 && (
            <Button
              onClick={() => aiRenameMutation.mutate()}
              disabled={aiRenameMutation.isPending}
              className="gap-2"
              variant="default"
            >
              {aiRenameMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Rename ({unnamedCount} topik)
            </Button>
          )}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-16">
                <button onClick={() => toggleSort('id')} className="flex items-center gap-1 font-semibold hover:text-primary cursor-pointer">
                  <Hash className="h-3.5 w-3.5" /> ID
                  {sortKey === 'id' && <ArrowUpDown className="h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 font-semibold hover:text-primary cursor-pointer">
                  Nama Topik
                  {sortKey === 'name' && <ArrowUpDown className="h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead>Kata Kunci</TableHead>
              <TableHead className="w-28">
                <button onClick={() => toggleSort('destinations')} className="flex items-center gap-1 font-semibold hover:text-primary cursor-pointer">
                  <MapPin className="h-3.5 w-3.5" /> Destinasi
                  {sortKey === 'destinations' && <ArrowUpDown className="h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead className="w-28 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Memuat topik...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-slate-400">
                  Tidak ada topik ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((topic, idx) => {
                const isUnnamed = topic.topic_name.startsWith('Topic ');
                return (
                  <TableRow
                    key={topic.id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <TableCell className="font-mono text-xs text-slate-400">
                      {topic.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: getColor(idx).border }}
                        />
                        <span className={`font-medium ${isUnnamed ? 'text-amber-600 italic' : 'text-slate-800'}`}>
                          {topic.topic_name}
                        </span>
                        {isUnnamed && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">
                            perlu nama AI
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(topic.keywords || []).slice(0, 5).map((kw, j) => (
                          <span
                            key={j}
                            className="inline-block rounded-md px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {kw}
                          </span>
                        ))}
                        {(topic.keywords || []).length > 5 && (
                          <span className="text-[11px] text-slate-400">
                            +{topic.keywords.length - 5}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-20">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (topic.total_destinations / Math.max(maxDest, 1)) * 100)}%`,
                              background: getColor(idx).border,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 tabular-nums">
                          {topic.total_destinations}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                          title="Rename topik"
                          onClick={() => {
                            setRenameTarget(topic);
                            setRenameValue(topic.topic_name);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          title="Hapus topik"
                          onClick={() => setDeleteTarget(topic)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-sm text-slate-500">
            Menampilkan {filtered.length} dari {topics.length} topik
          </div>
        )}
      </div>

      {/* ─── Rename Dialog ─── */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Topik</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                Nama Topik Saat Ini
              </label>
              <p className="text-sm text-slate-400 italic">{renameTarget?.topic_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                Kata Kunci
              </label>
              <div className="flex flex-wrap gap-1">
                {(renameTarget?.keywords || []).map((kw, j) => (
                  <span
                    key={j}
                    className="inline-block rounded-md px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="rename-input" className="text-sm font-medium text-slate-600 mb-1.5 block">
                Nama Baru
              </label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Masukkan nama topik baru..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (renameTarget && renameValue.trim()) {
                  renameMutation.mutate({ id: renameTarget.id, name: renameValue.trim() });
                }
              }}
              disabled={!renameValue.trim() || renameMutation.isPending}
            >
              {renameMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Pencil className="h-4 w-4 mr-2" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus Topik
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus topik berikut? Semua relasi destinasi dan ulasan akan ikut terhapus.
            </p>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <p className="font-semibold text-slate-800">{deleteTarget?.topic_name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {deleteTarget?.total_destinations} destinasi terkait akan kehilangan topik ini
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus Topik
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Summary card component ─── */
function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ background: `${accent}15`, color: accent }}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}
