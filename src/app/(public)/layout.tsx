import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell-background flex min-h-screen flex-col">
      <Navbar />
      <main className="public-content-plane flex-1">{children}</main>
      <Footer />
    </div>
  );
}
