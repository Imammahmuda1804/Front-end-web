import Link from 'next/link';
import { Map } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Map className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-medium text-foreground">Wisata AI Team</span>. The
            source code is available for internal use.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:underline">
            Tentang Kami
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privasi
          </Link>
          <Link href="/terms" className="hover:underline">
            Ketentuan Layanan
          </Link>
        </div>
      </div>
    </footer>
  );
}
