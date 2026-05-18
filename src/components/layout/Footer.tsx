import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/search', label: 'Eksplorasi' },
  { href: '/compare', label: 'Bandingkan' },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="container mx-auto px-6 py-10 md:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={36} height={36} className="object-contain" />
              <span className="text-lg font-black tracking-tight text-slate-900">RANAHINSIGHT</span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Platform AI Tourism Intelligence untuk membaca pola ulasan, membandingkan vibe,
              dan menemukan destinasi Sumatera Barat yang lebih cocok untuk perjalanan Anda.
            </p>
          </div>

          <nav aria-label="Tautan footer" className="flex flex-wrap gap-3 md:justify-end">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-primary/30 hover:bg-orange-50 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>RanahInsight</p>
          <p>Light mode, local insight, travel decision support.</p>
        </div>
      </div>
    </footer>
  );
}
