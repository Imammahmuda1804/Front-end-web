import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminUser } from '@/services/admin/user.service';

export function UserStatusDialog({
  user,
  submitting,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user?.status === 'suspended' ? 'Aktifkan akun?' : 'Tangguhkan akun?'}
          </DialogTitle>
          <DialogDescription>
            {user?.status === 'suspended'
              ? `Akun ${user?.name} akan bisa login dan menggunakan platform kembali.`
              : `Akun ${user?.name} akan dinonaktifkan dan tidak bisa login sementara.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            className="rounded-full bg-explore text-white hover:bg-explore/90"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'Konfirmasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
