"use client";

import dynamic from "next/dynamic";

const SummerMapClient = dynamic(() => import("@/components/SummerMapClient"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-sky-50 text-sky-800 font-bold z-50">
      <span className="text-6xl animate-bounce mb-4">🏖️</span>
      <p>여름 피서지 지도 로딩 중...</p>
    </div>
  )
});

export default function SummerMapWrapper() {
  return <SummerMapClient />;
}
