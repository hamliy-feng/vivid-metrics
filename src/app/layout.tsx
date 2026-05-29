import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/utils/utils";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav, Sidebar } from "@/components/nav/AppNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_TITLE = "VividMetrics · 内容运营数据大屏";
const SITE_DESCRIPTION = "微信视频号 & 小红书跨账号运营数据可视化";
const SITE_URL = "https://hamliy-feng.github.io/vivid-metrics/";

export const metadata: Metadata = {
  metadataBase: new URL("https://hamliy-feng.github.io"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "VividMetrics",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-svh bg-[var(--app-bg)]">
        <div className="flex min-h-svh">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
