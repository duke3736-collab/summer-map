import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026 전국 여름 물놀이 씨맵(Sea-Map) | 해수욕장 개장일, 수영장, 계곡",
  description: "전국 해수욕장 개장일, 수영장 운영시간 및 이용료, 취사 가능 계곡, 무료 바닥분수까지! 여름 휴가와 피서를 위한 완벽한 가성비 물놀이 지도를 확인하세요.",
  keywords: "해수욕장 개장일, 수영장 개장일, 수영장 운영기간, 수영장 운영시간, 수영장 이용료, 수영장 가격, 여름 휴가, 여름 피서, 취사가능 계곡, 무료 물놀이터, 바닥분수, 씨맵(Sea-Map)",
  openGraph: {
    title: "2026 전국 여름 물놀이 씨맵(Sea-Map)",
    description: "전국 해수욕장 개장일, 가성비 수영장, 취사 가능 계곡 총정리!",
    url: "https://map.weknews.com",
    siteName: "씨맵(Sea-Map)",
    locale: "ko_KR",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "씨맵(Sea-Map)",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9", // Summer vibe cyan
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6635245275061755" 
          crossOrigin="anonymous" 
          strategy="afterInteractive"
        />
        {/* Google Analytics 4 */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-34XVQWW0WJ`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-34XVQWW0WJ');
          `}
        </Script>
      </head>
      <body className="antialiased bg-sky-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-cyan-200 selection:text-cyan-900">
        
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:scale-110 transition-transform origin-bottom">🏄‍♂️</span>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-500 tracking-tight">
                PlayMap
              </span>
            </a>
            <nav className="flex gap-4 sm:gap-6">
              <a href="https://tools.weknews.com" className="relative group inline-flex items-center justify-center">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                <span className="relative text-sm font-bold bg-white text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1 group-hover:bg-emerald-50 transition-colors">
                  💰 금융 계산기 모음
                </span>
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full bg-slate-900 text-slate-400 py-12 mt-12 border-t-4 border-sky-500">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <p className="font-black text-white text-xl">🏝️ 전국 물놀이 씨맵(Sea-Map)</p>
            <p className="text-sm font-medium">대한민국 최고의 가성비 피서를 위한 지도 서비스</p>
            <div className="pt-4 text-xs opacity-60">
              <p>© 2026 Weknews PlayMap. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
