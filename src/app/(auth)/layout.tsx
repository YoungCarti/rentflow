export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-muted/30 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
