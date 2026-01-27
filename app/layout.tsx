import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Search, BarChart3 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "顧客開拓AIナビ",
  description: "手作業代行サービス向け顧客獲得支援アプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <nav className="border-b bg-card">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  顧客開拓AIナビ
                </Link>
                <Link
                  href="/search"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="h-4 w-4" />
                  企業検索
                </Link>
              </div>
            </div>
          </nav>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 px-6 py-8 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
