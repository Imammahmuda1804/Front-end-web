import { AlertTriangle, Loader2, Pencil, Trash2 } from 'lucide-react';
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
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
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


