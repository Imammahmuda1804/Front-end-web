import React from 'react';
import { Eye, GitMerge, Hash, MapPin, MessageSquareText, Pencil, Trash2 } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TopicGroupItem, TopicItem } from '@/services/admin/topic.service';
import type { SortKey } from './topics-client.types';
import { getTopicStatus } from './topics-client.utils';
import { SortButton, StatusBadge } from './topics-client.panels';
export function TaxonomyTable({
  topics,
  totalTopics,
  filteredCount,
  maxDestinations,
  sortKey,
  page,
  pageSize,
  totalPages,
  onSort,
  onPageChange,
  onPageSizeChange,
  onRename,
  onMerge,
  onDelete,
  onViewDestinations,
  onViewReviews,
  groups,
  onGroupChange,
  onVisibilityChange,
}: {
  topics: TopicItem[];
  totalTopics: number;
  filteredCount: number;
  maxDestinations: number;
  sortKey: SortKey;
  page: number;
  pageSize: number;
  totalPages: number;
  onSort: (key: SortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRename: (topic: TopicItem) => void;
  onMerge: (topic: TopicItem) => void;
  onDelete: (topic: TopicItem) => void;
  onViewDestinations: (topic: TopicItem) => void;
  onViewReviews: (topic: TopicItem) => void;
  groups: TopicGroupItem[];
  onGroupChange: (topic: TopicItem, groupId: number | null) => void;
  onVisibilityChange: (
    topic: TopicItem,
    key: 'isSearchVisible' | 'isDetailVisible',
    value: boolean,
  ) => void;
}) {
  const startItem = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filteredCount);
  const visiblePages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages].filter((item) => item >= 1 && item <= totalPages)),
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Taxonomy table</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Daftar Topik</h3>
        </div>
        <p className="text-sm font-bold text-slate-500">
          Menampilkan {startItem}-{endItem} dari {filteredCount} hasil, total {totalTopics} topik
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-20">
                <SortButton active={sortKey === 'id'} onClick={() => onSort('id')}>
                  <Hash className="h-3.5 w-3.5" /> ID
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton active={sortKey === 'name'} onClick={() => onSort('name')}>Nama Topik</SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Visibilitas</TableHead>
              <TableHead>Kata Kunci</TableHead>
              <TableHead className="w-36">
                <SortButton active={sortKey === 'destinations'} onClick={() => onSort('destinations')}>
                  <MapPin className="h-3.5 w-3.5" /> Destinasi
                </SortButton>
              </TableHead>
              <TableHead className="w-52 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <p className="font-black text-slate-700">Tidak ada topik yang cocok</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ubah pencarian atau filter cepat untuk melihat topik lain.</p>
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => {
                const status = getTopicStatus(topic, maxDestinations);
                const ratio = maxDestinations > 0 ? (topic.total_destinations / maxDestinations) * 100 : 0;
                return (
                  <TableRow key={topic.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-mono text-xs font-bold text-slate-400">{topic.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[18rem]">
                        <p className={`truncate font-black ${status.label === 'Perlu nama AI' ? 'text-amber-700' : 'text-slate-900'}`}>
                          {topic.topic_name}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{topic.keywords?.length || 0} keyword pendukung</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      <NativeSelect
                        aria-label={`Pilih group untuk topik ${topic.topic_name}`}
                        value={topic.group_id ? String(topic.group_id) : 'none'}
                        onValueChange={(value) =>
                          onGroupChange(topic, value === 'none' ? null : Number(value))
                        }
                        options={[
                          { value: 'none', label: 'Belum dipetakan' },
                          ...groups.map((group) => ({
                            value: String(group.id),
                            label: group.group_name,
                          })),
                        ]}
                        wrapperClassName="min-w-48"
                        className="min-h-10 bg-white"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600">
                          <input
                            type="checkbox"
                            checked={topic.is_search_visible !== false}
                            onChange={(event) =>
                              onVisibilityChange(topic, 'isSearchVisible', event.target.checked)
                            }
                          />
                          Search
                        </label>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-600">
                          <input
                            type="checkbox"
                            checked={topic.is_detail_visible !== false}
                            onChange={(event) =>
                              onVisibilityChange(topic, 'isDetailVisible', event.target.checked)
                            }
                          />
                          Detail
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {(topic.keywords || []).slice(0, 5).map((keyword, index) => (
                          <span key={`${topic.id}-keyword-${index}-${keyword || 'empty'}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {keyword}
                          </span>
                        ))}
                        {(topic.keywords || []).length > 5 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                            +{topic.keywords.length - 5}
                          </span>
                        )}
                        {(!topic.keywords || topic.keywords.length === 0) && (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">Tanpa keyword</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ratio)}%` }} />
                        </div>
                        <span className="text-sm font-black tabular-nums text-slate-800">{topic.total_destinations}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Lihat destinasi topik ${topic.topic_name}`}
                          onClick={() => onViewDestinations(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Lihat ulasan topik ${topic.topic_name}`}
                          onClick={() => onViewReviews(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                        >
                          <MessageSquareText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Rename topik ${topic.topic_name}`}
                          onClick={() => onRename(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-ai focus:outline-none focus:ring-4 focus:ring-primary/15"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Gabungkan topik ${topic.topic_name}`}
                          onClick={() => onMerge(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-ai focus:outline-none focus:ring-4 focus:ring-sky-100"
                        >
                          <GitMerge className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus topik ${topic.topic_name}`}
                          onClick={() => onDelete(topic)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-black text-slate-700">
            Baris per halaman
          </span>
          <NativeSelect
            aria-label="Pilih jumlah baris tabel topik"
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            options={[
              { value: '10', label: '10 baris' },
              { value: '20', label: '20 baris' },
              { value: '50', label: '50 baris' },
            ]}
            wrapperClassName="w-36"
            className="min-h-10 bg-white"
          />
          <span className="text-sm font-bold text-slate-500">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination tabel topik">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {visiblePages.map((item, index) => {
            const previous = visiblePages[index - 1];
            const hasGap = previous && item - previous > 1;
            return (
              <React.Fragment key={item}>
                {hasGap && <span className="px-1 text-sm font-black text-slate-400">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={page === item ? 'page' : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-black transition ${
                    page === item
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {item}
                </button>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </nav>
      </div>
    </section>
  );
}



