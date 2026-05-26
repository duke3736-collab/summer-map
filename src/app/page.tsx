"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import ShareButtons from "@/components/ShareButtons";
import AdSense from "@/components/AdSense";
import { isDiscountRegion } from "@/utils/regions";

type MapCategory = 'all' | 'favorites' | 'free' | 'cheap' | 'beach' | 'valley' | 'waterpark';

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

declare global {
    interface Window {
        kakao: any;
    }
}

export default function Home() {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MapCategory>('all');
    const [places, setPlaces] = useState<WaterPlace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<number[]>([]);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('sea-map-favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const toggleFavorite = (id: number) => {
        setFavorites(prev => {
            const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('sea-map-favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    };

    const KAKAO_APP_KEY = "11032eefd7d0111cb94d93c0ab41eb01";

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return;
        
        // Prevent multiple initializations
        if (mapLoaded) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780), 
                level: 11,
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);
            mapRef.current = map;
            
            // Marker scale based on zoom level
            const updateMarkerScale = () => {
                const level = map.getLevel();
                let scale = 1;
                if (level <= 4) scale = 1.4;
                else if (level <= 7) scale = 1.2;
                else if (level <= 10) scale = 1.0;
                else scale = 0.8;
                document.documentElement.style.setProperty('--marker-scale', scale.toString());
            };
            
            updateMarkerScale(); // Initial call
            window.kakao.maps.event.addListener(map, 'zoom_changed', updateMarkerScale);

            setMapLoaded(true);
        });
    };

    // Polling fallback in case Script onLoad doesn't fire
    useEffect(() => {
        if (mapLoaded) return;
        const interval = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
                clearInterval(interval);
                initMap();
            }
        }, 500);
        return () => clearInterval(interval);
    }, [mapLoaded]);

    const getMarkerIcon = (type: MapCategory) => {
        switch(type) {
            case 'free': return '⛲'; 
            case 'cheap': return '🏊‍♂️'; 
            case 'beach': return '🏖️'; 
            case 'valley': return '⛺'; 
            case 'waterpark': return '🎢';
            default: return '📍';
        }
    };

    const renderMarkers = (data: WaterPlace[], mapInstance: any) => {
        if (!window.kakao) return;
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        data.forEach(place => {
            const isDiscount = isDiscountRegion(place.name + " " + place.description);
            const contentNode = document.createElement('div');
            contentNode.innerHTML = `
                <div class="relative bg-white rounded-full border-[3px] border-amber-400 px-2 py-1 flex items-center justify-center cursor-pointer shadow-md hover:z-50 transition-all duration-300" style="font-size: 20px; transform: scale(var(--marker-scale, 1)); transform-origin: bottom center;">
                    ${isDiscount ? '<div class="absolute -top-3 -right-6 bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm" style="font-size: 10px;">할인 7만</div>' : ''}
                    ${getMarkerIcon(place.type)}
                </div>
            `;
            contentNode.onclick = () => {
                const card = document.getElementById(`place-${place.id}`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('ring-4', 'ring-sky-400', 'scale-[1.02]');
                    setTimeout(() => card.classList.remove('ring-4', 'ring-sky-400', 'scale-[1.02]'), 2000);
                }
            };

            const position = new window.kakao.maps.LatLng(place.lat, place.lng);
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: contentNode,
                yAnchor: 1
            });
            customOverlay.setMap(mapInstance);
            markersRef.current.push(customOverlay);
        });
    };

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await fetch("https://script.google.com/macros/s/AKfycbzcgqdSvU52oNz9Q7etD3fqy6AzquqS5IqwavCqLT9JA4t9rUCxlRazFg2Cn-WX5Py76g/exec");
                const data = await res.json();
                setPlaces(data);
            } catch (err) {
                console.error("Failed to load map data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaces();
    }, []);

    useEffect(() => {
        if (mapLoaded && mapRef.current) {
            const filtered = places.filter(p => {
                const matchCategory = selectedCategory === 'all' || (selectedCategory === 'favorites' ? favorites.includes(p.id) : p.type === selectedCategory);
                const matchSearch = p.name.includes(searchQuery) || p.tags.join(" ").includes(searchQuery) || p.description.includes(searchQuery);
                return matchCategory && matchSearch;
            });
            renderMarkers(filtered, mapRef.current);
        }
    }, [selectedCategory, searchQuery, mapLoaded, places, favorites]);

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

    const findMyLocation = () => {
        if (!navigator.geolocation) {
            alert("현재 브라우저에서는 위치 정보를 지원하지 않습니다.");
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (mapRef.current) {
                const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
                mapRef.current.panTo(moveLatLon);
                mapRef.current.setLevel(5); // Zoom in closer for user location
                
                // Add a small marker for user location
                const content = `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`;
                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position: moveLatLon,
                    content: content,
                });
                customOverlay.setMap(mapRef.current);
            }
        }, () => {
            alert("스마트폰/브라우저의 위치 접근 권한을 허용해주세요!");
        });
    };

    return (
        <div className="space-y-8">
            <Script 
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
                strategy="afterInteractive"
                onLoad={initMap}
            />

            {/* VIBRANT HERO SECTION */}
            <section className="bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 rounded-[2.5rem] p-8 md:p-14 text-center shadow-2xl relative overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 scale-110" 
                    style={{ backgroundImage: "url('/images/hero-bg.png')" }}
                ></div>
                {/* Dark Overlay to make text readable */}
                <div className="absolute inset-0 bg-sky-900/30"></div>

                {/* Sun Element (Removed mix-blend and pulse for iOS Safari stability) */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-300 rounded-full blur-3xl opacity-60"></div>
                {/* Water Waves */}
                <div className="absolute -bottom-32 -left-10 w-[120%] h-64 bg-white/10 rounded-[100%] blur-xl transform -rotate-6"></div>
                
                <div className="relative z-10 space-y-6">
                    <span className="inline-block px-4 py-1.5 bg-amber-300 text-amber-900 font-black rounded-full text-sm md:text-base tracking-wider shadow-lg transform -rotate-2">
                        가성비 피서 프로젝트 ☀️
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                        전국 여름 물놀이 <br/>
                        <span className="text-amber-300 drop-shadow-lg">씨맵(Sea-Map)</span> 🏝️
                    </h1>
                    <p className="text-sky-100 text-lg md:text-xl font-semibold max-w-2xl mx-auto">
                        공짜 동네 바닥분수부터 5천원 야외 수영장까지! <br/> 가장 알뜰하고 시원하게 여름을 즐기는 방법
                    </p>
                    <div className="pt-4 pb-2">
                        <ShareButtons 
                            title="2026 전국 여름 물놀이 씨맵(Sea-Map) 🏝️" 
                            description="전국 꿀장소(무료 바닥분수, 가성비 수영장)를 지도로 한눈에! 나만 아는 피서지도 제보해주세요!"
                            imageUrl="https://map.weknews.com/images/hero-bg.png"
                            linkUrl="https://map.weknews.com/"
                            kakaoAppKey={KAKAO_APP_KEY}
                        />
                    </div>
                    
                    <a href="https://weknews.com/how-to-apply-for-the-2026-accommodation-sale-festa/" target="_blank" rel="noopener noreferrer" className="mt-2 mx-auto max-w-lg block w-full bg-rose-600/90 hover:bg-rose-600 border border-rose-400 rounded-xl p-3 shadow-lg transition-transform hover:scale-105 animate-pulse cursor-pointer">
                        <p className="text-white font-bold text-sm md:text-base flex items-center justify-center gap-2">
                            <span>🔥</span>
                            [선착순] 올여름 숙박지원금 7만 원 100% 받는 법 (6/11 오픈)
                            <span>👉</span>
                        </p>
                    </a>
                </div>
            </section>

            {/* MAP & FILTER SECTION */}
            <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Filters */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: '전체보기 ✨' },
                            { id: 'favorites', label: '내 저장소 ❤️' },
                            { id: 'free', label: '공짜 물놀이터 ⛲' },
                            { id: 'cheap', label: '가성비 수영장 🏊‍♂️' },
                            { id: 'waterpark', label: '대형 워터파크 🎢' },
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

                {/* Search Bar */}
                <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-xl">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="해운대, 바닥분수, 취사, 무료 등 명소나 특징을 검색하세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl pl-12 pr-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Map */}
                <div className="relative w-full h-[450px] md:h-[600px] bg-sky-50">
                    {(!mapLoaded || isLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-sky-50/80 backdrop-blur-sm z-10 flex-col gap-4">
                            <div className="text-6xl animate-bounce">🏖️</div>
                            <span className="font-bold text-sky-800 text-lg">
                                {isLoading ? "구글 시트에서 명소 불러오는 중..." : "지도 불러오는 중... (잠시만 기다려주세요)"}
                            </span>
                            {!isLoading && !mapLoaded && (
                                <p className="text-sm text-sky-600 mt-2">
                                    <p>지도가 계속 안 뜬다면 카카오 디벨로퍼스에</p>
                                    <strong>https://map.weknews.com</strong> 도메인을 추가해주세요!
                                </p>
                            )}
                        </div>
                    )}
                    <div ref={mapContainerRef} className="w-full h-full"></div>
                    

                    {/* GPS Button */}
                    <button 
                        onClick={findMyLocation}
                        className="absolute bottom-6 right-6 z-20 bg-white p-3 md:p-4 rounded-full shadow-xl border-2 border-sky-400 text-2xl hover:scale-110 transition-transform flex items-center justify-center text-slate-800"
                        title="내 위치 찾기"
                    >
                        🎯
                    </button>
                </div>
            </section>

            {/* AdSense Unit (Top) */}
            <div className="py-4">
                <AdSense className="my-4 min-h-[100px]" />
            </div>

            {/* SPONSOR / AFFILIATE BANNER */}
            <div className="pb-8 space-y-4">
                {/* 쿠팡 트래블 (숙소) 배너 */}
                <a href="https://link.coupang.com/a/d3Ebxt3Cpw" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl group-hover:animate-bounce">🏨</span>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black mb-1">여름 피서지 주변 숙소 실시간 최저가</h3>
                                <p className="text-pink-100 font-medium text-sm md:text-base">쿠팡 트래블 단독! 정부 숙박할인 7만원권 꿀조합 숙소 초특가</p>
                            </div>
                        </div>
                        <span className="shrink-0 w-full md:w-auto text-center bg-white text-rose-600 font-black px-8 py-4 rounded-2xl shadow-md group-hover:bg-rose-50 transition-colors text-lg">
                            특가 숙소 보기 👉
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-4 text-[10px] text-white/40">파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음</div>
                </a>

                {/* 쿠팡 파트너스 배너 */}
                <a href="https://link.coupang.com/a/d4dFbPJ8ZE" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl group-hover:scale-110 transition-transform">🛟</span>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black mb-1">물놀이 필수템 초특가 기획전</h3>
                                <p className="text-blue-100 font-medium text-sm md:text-base">튜브, 구명조끼, 아쿠아슈즈, 바베큐 용품 쿠팡 최저가 득템!</p>
                            </div>
                        </div>
                        <span className="shrink-0 w-full md:w-auto text-center bg-white text-indigo-700 font-black px-8 py-4 rounded-2xl shadow-md group-hover:bg-indigo-50 transition-colors text-lg">
                            쿠팡 특가 보기 🚀
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-4 text-[10px] text-white/40">파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음</div>
                </a>

                {/* 쿠팡 파트너스 배너 (워터파크 이용권) */}
                <a href="https://link.coupang.com/a/d3ZvCK8Yo0" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-teal-400 to-cyan-600 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl group-hover:scale-110 transition-transform">🎢</span>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black mb-1">전국 워터파크/수상레저 이용권 초특가</h3>
                                <p className="text-cyan-100 font-medium text-sm md:text-base">오션월드, 캐리비안베이, 가평 빠지 등 쿠팡 단독 최저가!</p>
                            </div>
                        </div>
                        <span className="shrink-0 w-full md:w-auto text-center bg-white text-cyan-600 font-black px-8 py-4 rounded-2xl shadow-md group-hover:bg-cyan-50 transition-colors text-lg">
                            이용권 보기 🎫
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-4 text-[10px] text-white/40">파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음</div>
                </a>
            </div>

            {/* LIST SECTION */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <span className="text-3xl">🔥</span> 실시간 추천 핫플레이스
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {places.filter(p => {
                        const matchCategory = selectedCategory === 'all' || (selectedCategory === 'favorites' ? favorites.includes(p.id) : p.type === selectedCategory);
                        const matchSearch = p.name.includes(searchQuery) || p.tags.join(" ").includes(searchQuery) || p.description.includes(searchQuery);
                        return matchCategory && matchSearch;
                    }).map(place => (
                        <div key={place.id} id={`place-${place.id}`} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-sky-600 transition-colors flex items-center flex-wrap gap-2">
                                    <button onClick={() => toggleFavorite(place.id)} className="text-2xl hover:scale-125 transition-transform" title="찜하기">
                                        {favorites.includes(place.id) ? '❤️' : '🤍'}
                                    </button>
                                    {getMarkerIcon(place.type)} {place.name}
                                    {isDiscountRegion(place.name + " " + place.description) && (
                                        <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200 shadow-sm shrink-0">
                                            💰 정부 숙박할인 7만원 대상 지역
                                        </span>
                                    )}
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
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            if (mapRef.current) {
                                                mapRef.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
                                                mapRef.current.setLevel(5);
                                                window.scrollTo({ top: 300, behavior: 'smooth' });
                                            }
                                        }}
                                        className="text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
                                    >
                                        지도 📍
                                    </button>
                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                                        <a 
                                            href={`https://map.kakao.com/link/to/${place.name},${place.lat},${place.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-slate-800 bg-[#FEE500] hover:bg-[#F4DC00] px-3 py-2 rounded-lg transition-colors shadow-sm"
                                        >
                                            카카오 🚗
                                        </a>
                                        <a 
                                            href={`https://map.naver.com/v5/search/${place.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-white bg-[#03C75A] hover:bg-[#02b351] px-3 py-2 rounded-lg transition-colors shadow-sm"
                                        >
                                            네이버 🚙
                                        </a>
                                    </div>
                                    <a 
                                        href={`https://www.yanolja.com/search/${place.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl transition-colors shadow-md flex items-center gap-1 shrink-0"
                                        title={place.type === 'cheap' || place.type === 'waterpark' ? "야놀자 티켓/숙소 검색" : "야놀자 주변 숙소 검색"}
                                    >
                                        {place.type === 'cheap' || place.type === 'waterpark' ? '티켓/숙소 🎫' : '숙소 🏨'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTRIBUTION BANNER */}
            <section className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-sky-100 text-center shadow-inner relative overflow-hidden">
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white rounded-full blur-2xl opacity-50"></div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-200 rounded-full blur-2xl opacity-50"></div>
                <div className="relative z-10 space-y-4">
                    <div className="text-5xl mb-4 animate-bounce">💡</div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">나만 아는 우리 동네 물놀이 명소가 있다면?</h2>
                    <p className="text-slate-600 font-medium pb-4 max-w-lg mx-auto">
                        씨맵(Sea-Map)은 여러분의 제보로 완성됩니다! 동네 무료 분수, 저렴한 수영장, 취사 가능한 숨은 계곡을 알려주세요.
                    </p>
                    <a 
                        href="https://forms.gle/여기에구글폼주소를넣어주세요" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg md:text-xl hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1 transition-all"
                    >
                        ✍️ 꿀장소 제보하기
                    </a>
                </div>
            </section>

            <div className="py-4">
                <AdSense className="my-4 min-h-[100px]" />
            </div>
            
        </div>
    );
}
