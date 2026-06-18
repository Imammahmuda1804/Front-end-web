import { useState } from 'react';
import { Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TopicGroupItem, TopicGroupPayload, TopicItem } from '../../services/topic.service';

export function TopicGroupManager({
  groups,
  topics,
  pending,
  onCreate,
  onUpdate,
  onTopicGroupChange,
  onDelete,
}: {
  groups: TopicGroupItem[];
  topics: TopicItem[];
  pending: boolean;
  onCreate: (data: TopicGroupPayload) => void;
  onUpdate: (id: number, data: TopicGroupPayload) => void;
  onTopicGroupChange: (topic: TopicItem, groupId: number | null) => void;
  onDelete: (group: TopicGroupItem) => void;
}) {
  const emptyForm = {
    groupName: '',
    description: '',
    keywordsText: '',
    displayOrder: 0,
  };
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [topicSearch, setTopicSearch] = useState('');
  const isCreating = editingGroupId === 0;
  const groupTopics = editingGroupId
    ? topics.filter((topic) => topic.group_id === editingGroupId)
    : [];
  const candidateTopics = [...topics]
    .filter((topic) => {
      if (!editingGroupId || editingGroupId === 0) return false;
      return topic.topic_name.toLowerCase().includes(topicSearch.trim().toLowerCase());
    })
    .sort((first, second) => {
      const firstRank = first.group_id === editingGroupId ? 0 : first.group_id ? 2 : 1;
      const secondRank = second.group_id === editingGroupId ? 0 : second.group_id ? 2 : 1;
      if (firstRank !== secondRank) return firstRank - secondRank;
      return first.topic_name.localeCompare(second.topic_name);
    });

  const startCreate = () => {
    setEditingGroupId(0);
    setForm(emptyForm);
    setTopicSearch('');
  };

  const startEdit = (group: TopicGroupItem) => {
    setEditingGroupId(group.id);
    setForm({
      groupName: group.group_name,
      description: group.description || '',
      keywordsText: (group.keywords || []).join(', '),
      displayOrder: group.display_order ?? 0,
    });
    setTopicSearch('');
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setForm(emptyForm);
    setTopicSearch('');
  };

  const buildPayload = (): TopicGroupPayload => ({
    groupName: form.groupName.trim(),
    description: form.description.trim() || undefined,
    keywords: form.keywordsText
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    displayOrder: Number.isFinite(form.displayOrder) ? form.displayOrder : 0,
  });

  const submitForm = () => {
    const payload = buildPayload();
    if (!payload.groupName) return;
    if (isCreating) onCreate(payload);
    else if (editingGroupId) onUpdate(editingGroupId, payload);
    cancelEdit();
  };

  const editor = (
    <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_0.7fr_7rem]">
        <label>
          <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-ai">Nama kelompok</span>
          <Input
            value={form.groupName}
            onChange={(event) => setForm((current) => ({ ...current, groupName: event.target.value }))}
            placeholder="Contoh: Akses & Transportasi"
            className="min-h-11 rounded-lg bg-white font-bold"
            autoFocus
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-ai">Keyword</span>
          <Input
            value={form.keywordsText}
            onChange={(event) => setForm((current) => ({ ...current, keywordsText: event.target.value }))}
            placeholder="akses, parkir, jalan"
            className="min-h-11 rounded-lg bg-white font-bold"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-ai">Order</span>
          <Input
            type="number"
            value={form.displayOrder}
            onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))}
            className="min-h-11 rounded-lg bg-white font-bold"
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-ai">Deskripsi</span>
        <Input
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Penjelasan singkat fungsi kelompok ini"
          className="min-h-11 rounded-lg bg-white font-bold"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={submitForm} disabled={pending || !form.groupName.trim()} className="min-h-10 rounded-lg bg-ai text-white hover:bg-ai/90">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isCreating ? 'Tambah kelompok' : 'Simpan kelompok'}
        </Button>
        <Button type="button" variant="outline" onClick={cancelEdit} className="min-h-10 rounded-lg">
          <X className="h-4 w-4" />
          Batal
        </Button>
      </div>

      {!isCreating && editingGroupId ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Topik detail dalam kelompok</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {groupTopics.length} topik sudah berada dalam kelompok ini. Centang topik untuk memasukkan atau memindahkannya dari kelompok lain.
              </p>
            </div>
            <Input value={topicSearch} onChange={(event) => setTopicSearch(event.target.value)} placeholder="Cari topik detail..." className="min-h-11 rounded-lg bg-slate-50 font-semibold md:w-72" />
          </div>
          <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {candidateTopics.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500 md:col-span-2 xl:col-span-3">
                Tidak ada topik yang cocok dengan pencarian.
              </div>
            ) : (
              candidateTopics.map((topic) => {
                const checked = topic.group_id === editingGroupId;
                const membershipLabel = checked
                  ? 'Di kelompok ini'
                  : topic.group_id
                    ? `Dari ${topic.group_name || 'kelompok lain'}`
                    : 'Belum dipetakan';
                const membershipClass = checked
                  ? 'bg-emerald-50 text-emerald-700'
                  : topic.group_id
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600';
                return (
                  <label
                    key={topic.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 ${
                      checked ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onTopicGroupChange(topic, event.target.checked ? editingGroupId : null)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-black text-slate-950">{topic.topic_name}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[0.68rem] font-black ${membershipClass}`}>
                          {membershipLabel}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{topic.total_destinations} destinasi</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Kelompok topik</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Kelola kelompok pengalaman</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">Tambah, edit, atau hapus kelompok topik agar insight ulasan lebih mudah dibaca admin.</p>
        </div>
        <Button type="button" onClick={startCreate} variant="outline" className="min-h-11 rounded-lg font-black text-ai">
          <Plus className="h-4 w-4" />
          Tambah kelompok
        </Button>
      </div>

      {editingGroupId !== null ? <div className="mb-4">{editor}</div> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">{group.group_name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{group.topics?.length || 0} topik detail</p>
                {group.description ? <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{group.description}</p> : null}
                {(group.keywords || []).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(group.keywords || []).slice(0, 3).map((keyword) => (
                      <span key={`${group.id}-${keyword}`} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-black text-ai">
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(group)} aria-label={`Edit kelompok ${group.group_name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-ai-container hover:text-ai">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(group)} aria-label={`Hapus kelompok ${group.group_name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
