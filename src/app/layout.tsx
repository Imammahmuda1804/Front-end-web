import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "RANAHINSIGHT — Jelajahi Wisata Sumatera Barat dengan AI",
  description: "Temukan destinasi wisata terbaik di Sumatera Barat menggunakan analisis sentimen AI dan rekomendasi cerdas. Powered by NLP & Topic Modelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Script
          id="strip-extension-hydration-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var attrs = ['bis_skin_checked'];
                function clean(node) {
                  if (!node || node.nodeType !== 1) return;
                  attrs.forEach(function (attr) {
                    if (node.hasAttribute(attr)) node.removeAttribute(attr);
                  });
                  node.querySelectorAll('[bis_skin_checked]').forEach(function (el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                }
                clean(document.documentElement);
                new MutationObserver(function (mutations) {
                  mutations.forEach(function (mutation) {
                    if (mutation.type === 'attributes') clean(mutation.target);
                    mutation.addedNodes.forEach(clean);
                  });
                }).observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: attrs
                });
              })();
            `,
          }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold">
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
