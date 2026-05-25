import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: '2026 전국 여름 물놀이 거지맵 🏝️ | 가성비 계곡, 수영장, 바닥분수',
  description: '공짜로 즐기는 동네 무료 물놀이터부터 5천원 이하 공공 수영장, 취사가능 계곡까지! 여름 피서를 가장 알뜰하게 보낼 수 있는 가성비 물놀이 지도를 확인하세요.',
  keywords: ['물놀이 거지맵', '가성비 물놀이', '무료 물놀이터', '취사가능 계곡', '여름 수영장', '해수욕장 개장일', '짠테크 피서'],
  openGraph: {
    title: '🏝️ 2026 전국 여름 물놀이 거지맵',
    description: '내 주변 공짜 바닥분수부터 가성비 야외 수영장까지 지도로 한눈에!',
    type: 'website',
  }
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
              <a href="https://tools.weknews.com" className="text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors">
                금융 도구 모음 👉
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
            <p className="font-black text-white text-xl">🏝️ 전국 물놀이 거지맵</p>
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
