export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background text-on-surface">
      {children}
    </div>
  );
}
