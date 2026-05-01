import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AccessibilityPreferencesProvider } from "@/components/AccessibilityPreferences";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentFlow – Property Management",
  description: "Modern SaaS dashboard for landlords",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AccessibilityPreferencesProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </AccessibilityPreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
