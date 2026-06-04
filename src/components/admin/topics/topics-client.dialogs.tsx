import React from 'react';
import { AlertTriangle, GitMerge, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { TopicItem } from '@/services/admin/topic.service';

export function RenameTopicDialog({
  topic,
  value,
  pending,
  onValueChange,
  onClose,
  onSubmit,
}: {
  topic: TopicItem | null;
  value: string;
  pending: boolean;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Topik</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Nama Topik Saat Ini</label>
            <p className="text-sm font-semibold italic text-slate-500">{topic?.topic_name}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Kata Kunci</label>
            <div className="flex flex-wrap gap-1">
              {(topic?.keywords || []).map((keyword, index) => (
                <span key={`${topic?.id || 'topic'}-dialog-keyword-${index}-${keyword || 'empty'}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="rename-input" className="mb-1.5 block text-sm font-bold text-slate-700">Nama Baru</label>
            <Input
              id="rename-input"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="Masukkan nama topik baru..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit} disabled={!value.trim() || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTopicDialog({
  topic,
  pending,
  onClose,
  onSubmit,
}: {
  topic: TopicItem | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            Hapus Topik
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            Apakah Anda yakin ingin menghapus topik berikut? Relasi destinasi dan review terkait akan kehilangan taxonomy ini.
          </p>
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="font-black text-slate-900">{topic?.topic_name}</p>
            <p className="mt-1 text-xs font-bold text-rose-700">{topic?.total_destinations || 0} destinasi terkait</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={onSubmit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Hapus Topik
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MergeTopicsDialog({
  open,
  topics,
  targetId,
  sourceIds,
  pending,
  onTargetChange,
  onSourceToggle,
  onClose,
  onSubmit,
}: {
  open: boolean;
  topics: TopicItem[];
  targetId: number | null;
  sourceIds: number[];
  pending: boolean;
  onTargetChange: (id: number) => void;
  onSourceToggle: (id: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [targetSearch, setTargetSearch] = React.useState('');
  const [sourceSearch, setSourceSearch] = React.useState('');
  const target = topics.find((topic) => topic.id === targetId);
  const canSubmit = Boolean(targetId) && sourceIds.length > 0 && !pending;
  const visibleTargets = topics.filter((topic) =>
    topic.topic_name.toLowerCase().includes(targetSearch.trim().toLowerCase()),
  );
  const visibleSources = topics
    .filter((topic) => topic.id !== targetId)
    .filter((topic) =>
      topic.topic_name.toLowerCase().includes(sourceSearch.trim().toLowerCase()),
    );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <GitMerge className="h-5 w-5 text-ai" />
            Gabungkan Topik
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-ai">Target dipertahankan</p>
            <Input
              value={targetSearch}
              onChange={(event) => setTargetSearch(event.target.value)}
              placeholder="Cari target topic..."
              className="mt-3 min-h-11 rounded-xl bg-white font-semibold"
            />
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {visibleTargets.map((topic) => (
                <label
                  key={topic.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white p-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <input
                    type="radio"
                    name="merge-target-topic"
                    checked={targetId === topic.id}
                    onChange={() => onTargetChange(topic.id)}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-black text-slate-950">{topic.topic_name}</span>
                    <span className="text-xs text-slate-500">{topic.total_destinations} destinasi</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Source digabung</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Review dan relasi destinasi dari source akan dipindahkan ke target{target ? ` "${target.topic_name}"` : ''}.
            </p>
            <Input
              value={sourceSearch}
              onChange={(event) => setSourceSearch(event.target.value)}
              placeholder="Cari source topic..."
              className="mt-3 min-h-11 rounded-xl bg-slate-50 font-semibold"
            />
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {visibleSources.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <input
                      type="checkbox"
                      checked={sourceIds.includes(topic.id)}
                      onChange={() => onSourceToggle(topic.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-black text-slate-950">{topic.topic_name}</span>
                      <span className="text-xs text-slate-500">{topic.total_destinations} destinasi</span>
                    </span>
                  </label>
                ))}
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit} disabled={!canSubmit} className="bg-ai text-white hover:bg-ai/90">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
            Gabungkan {sourceIds.length || ''} Topik
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



