"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import KakaoShareButton from "@/components/KakaoShareButton";

type MapCategory = 'all' | 'free' | 'cheap' | 'beach' | 'valley';

interface WaterPlace {
    id: number;
    name: string;
    lat: number;
    lng: number;
    type: MapCategory; // free(무료물놀이터), cheap(가성비수영장), beach(해수욕장), valley(계곡)
    openDate: string; // YYYY-MM-DD
    price: string;
    tags: string[];
    description: string;
}

const DUMMY_DATA: WaterPlace[] = [
    {
        id: 1, name: "여의도 한강공원 수영장", lat: 37.52843, lng: 126.93307, type: 'cheap',
        openDate: "2026-06-20", price: "5,000원", tags: ["#가성비", "#야간개장", "#샤워가능"],
        description: "저렴한 가격에 한강뷰 야외 수영을 즐길 수 있는 최고의 가성비 명소입니다."
    },
    {
        id: 2, name: "광교 호수공원 바닥분수", lat: 37.28312, lng: 127.06456, type: 'free',
        openDate: "2026-05-01", price: "무료", tags: ["#공짜", "#아이와함께", "#텐트가능(지정구역)"],
        description: "아이들이 안전하게 뛰어놀 수 있는 무료 물놀이터입니다. 주차비만 내면 하루종일 놀 수 있어요!"
    },
    {
        id: 3, name: "해운대 해수욕장", lat: 35.15869, lng: 129.16038, type: 'beach',
        openDate: "2026-06-01", price: "무료 (파라솔 별도)", tags: ["#해수욕장", "#야간개장", "#취사불가"],
        description: "대한민국 대표 해수욕장! 부분 개장을 6월 1일부터 시작합니다."
    },
    {
        id: 4, name: "가평 명지계곡", lat: 37.91572, lng: 127.43936, type: 'valley',
        openDate: "상시 개방", price: "무료 (평상 대여 별도)", tags: ["#취사가능", "#계곡", "#텐트설치가능"],
        description: "맑은 물과 얕은 수심으로 가족 단위 피서객에게 인기가 많은 취사 가능 계곡입니다."
    },
    {
        id: 5, name: "서울숲 물놀이터", lat: 37.54438, lng: 127.03744, type: 'free',
        openDate: "2026-07-01", price: "무료", tags: ["#공짜", "#도심속피서", "#대중교통편리"],
        description: "도심 한복판에서 무료로 즐기는 여름 물놀이! 돗자리 펴고 쉬기 좋아요."
    }
];

declare global {
    interface Window {
        kakao: any;
    }
}

export default function Home() {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MapCategory>('all');
    const [places, setPlaces] = useState<WaterPlace[]>(DUMMY_DATA);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const KAKAO_APP_KEY = "11032eefd7d0111cb94d93c0ab41eb01";

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780), 
                level: 11,
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);
            mapRef.current = map;
            setMapLoaded(true);
            renderMarkers(DUMMY_DATA, map);
        });
    };

    const getMarkerIcon = (type: MapCategory) => {
        switch(type) {
            case 'free': return '⛲'; 
            case 'cheap': return '🏊‍♂️'; 
            case 'beach': return '🏖️'; 
            case 'valley': return '⛺'; 
            default: return '📍';
        }
    };

    const renderMarkers = (data: WaterPlace[], mapInstance: any) => {
        if (!window.kakao) return;
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        data.forEach(place => {
            const content = `
                <div class="bg-white rounded-full border-[3px] border-amber-400 shadow-xl px-2 py-1 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform origin-bottom" style="font-size: 24px;">
                    ${getMarkerIcon(place.type)}
                </div>
            `;
            const position = new window.kakao.maps.LatLng(place.lat, place.lng);
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: content,
                yAnchor: 1
            });
            customOverlay.setMap(mapInstance);
            markersRef.current.push(customOverlay);
        });
    };

    useEffect(() => {
        if (mapLoaded && mapRef.current) {
            const filtered = selectedCategory === 'all' 
                ? places 
                : places.filter(p => p.type === selectedCategory);
            renderMarkers(filtered, mapRef.current);
        }
    }, [selectedCategory, mapLoaded, places]);

    const calculateDday = (dateString: string) => {
        if (dateString === "상시 개방") return "상시 개방 🟢";
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) return `개장까지 D-${diffDays} ⏳`;
        if (diffDays === 0) return `오늘 개장! 🎉`;
        return `현재 개장 중 🟢`;
    };

    return (
        <div className="space-y-8">
            <Script 
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
                strategy="lazyOnload"
                onLoad={initMap}
            />

            {/* VIBRANT HERO SECTION */}
            <section className="bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 rounded-[2.5rem] p-8 md:p-14 text-center shadow-2xl relative overflow-hidden">
                {/* Sun Element */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-300 rounded-full blur-3xl opacity-60 mix-blend-screen animate-pulse"></div>
                {/* Water Waves */}
                <div className="absolute -bottom-32 -left-10 w-[120%] h-64 bg-white/10 rounded-[100%] blur-xl transform -rotate-6"></div>
                
                <div className="relative z-10 space-y-6">
                    <span className="inline-block px-4 py-1.5 bg-amber-300 text-amber-900 font-black rounded-full text-sm md:text-base tracking-wider shadow-lg transform -rotate-2">
                        가성비 피서 프로젝트 ☀️
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-md">
                        전국 여름 물놀이 <br/>
                        <span className="text-amber-300 drop-shadow-lg">갓성비맵</span> 🏝️
                    </h1>
                    <p className="text-sky-100 text-lg md:text-xl font-semibold max-w-2xl mx-auto">
                        공짜 동네 바닥분수부터 5천원 야외 수영장까지! <br/> 가장 알뜰하고 시원하게 여름을 즐기는 방법
                    </p>
                </div>
            </section>

            {/* MAP & FILTER SECTION */}
            <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Filters */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: '전체보기 ✨' },
                            { id: 'free', label: '공짜 물놀이터 ⛲' },
                            { id: 'cheap', label: '가성비 수영장 🏊‍♂️' },
                            { id: 'valley', label: '취사가능 계곡 ⛺' },
                            { id: 'beach', label: '전국 해수욕장 🏖️' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as MapCategory)}
                                className={`shrink-0 px-5 py-3 rounded-2xl font-extrabold text-sm md:text-base transition-all duration-300 ${
                                    selectedCategory === cat.id 
                                    ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-500/40 transform -translate-y-1' 
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map */}
                <div className="relative w-full h-[450px] md:h-[600px] bg-sky-50">
                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-sky-50/80 backdrop-blur-sm z-10 flex-col gap-4">
                            <div className="text-6xl animate-bounce">🏖️</div>
                            <span className="font-bold text-sky-800 text-lg">전국 물놀이 명소 불러오는 중...</span>
                        </div>
                    )}
                    <div ref={mapContainerRef} className="w-full h-full"></div>
                </div>
            </section>

            {/* LIST SECTION */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <span className="text-3xl">🔥</span> 실시간 추천 핫플레이스
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedCategory === 'all' ? places : places.filter(p => p.type === selectedCategory)).map(place => (
                        <div key={place.id} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-sky-600 transition-colors flex items-center gap-2">
                                    {getMarkerIcon(place.type)} {place.name}
                                </h3>
                                <span className={`text-sm font-bold px-3 py-1.5 rounded-xl whitespace-nowrap ${
                                    calculateDday(place.openDate).includes('개장 중') || calculateDday(place.openDate).includes('상시')
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {calculateDday(place.openDate)}
                                </span>
                            </div>
                            
                            <p className="text-slate-600 mb-4 font-medium h-12 line-clamp-2">
                                {place.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {place.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs font-bold px-3 py-1 bg-sky-50 text-sky-600 rounded-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="text-sm font-bold">
                                    <span className="text-slate-400 mr-2">요금</span>
                                    <span className="text-indigo-600 text-lg">{place.price}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (mapRef.current) {
                                            mapRef.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
                                            mapRef.current.setLevel(5);
                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                        }
                                    }}
                                    className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors shadow-md"
                                >
                                    지도 📍
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="pt-8">
                <KakaoShareButton 
                    title="2026 전국 여름 물놀이 갓성비맵 🏝️" 
                    description="공짜 동네 물놀이터부터 가성비 수영장, 취사 가능한 계곡까지! 우리 동네 꿀정보 확인하기" 
                    kakaoAppKey={KAKAO_APP_KEY}
                />
            </div>
            
        </div>
    );
}
