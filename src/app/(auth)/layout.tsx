import RentFlowLogo from "@/components/brand/RentFlowLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(320px,40vw)_1fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#101010] lg:flex lg:flex-col">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative z-10 flex flex-1 flex-col justify-between p-8">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <RentFlowLogo className="h-9 w-9" />
                <span className="text-xl font-bold tracking-tight">RentFlow</span>
              </div>
              <p className="max-w-44 text-right font-mono text-xs uppercase leading-5 tracking-[0.16em] text-white/60">
                Property operations without the noise
              </p>
            </div>

            <div className="max-w-md">
              <p className="text-2xl font-semibold leading-9 tracking-tight text-white">
                Track rent, tenants, payments, and maintenance from one focused workspace.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
                Build your portfolio once, then let RentFlow organize the monthly work around it.
              </p>
            </div>

            <div className="flex items-end justify-between gap-6 font-mono text-xs uppercase leading-5 tracking-[0.16em] text-white/45">
              <p>Copyright © 2026<br />RentFlow</p>
              <p className="text-right">Designed for<br />property managers</p>
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="relative z-10 w-full max-w-[480px]">{children}</div>
        </section>
      </div>
    </div>
  );
}
