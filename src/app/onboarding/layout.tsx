export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8">
      {children}
    </main>
  );
}
