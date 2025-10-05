import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "건설 ERP - Construction Management System",
  description: "중견건설사를 위한 AI 기반 통합 경영정보시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-void min-h-screen">
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
