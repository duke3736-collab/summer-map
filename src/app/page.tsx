import SummerMapWrapper from "@/components/SummerMapWrapper";
import { getPlaces } from "@/lib/places";
import Script from "next/script";

export default async function Page() {
  const places = await getPlaces();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "전국 여름 물놀이 씨맵 (Sea-Map)",
    "url": "https://map.weknews.com",
    "description": "전국 무료 바닥분수, 가성비 수영장, 취사 가능 계곡, 워터파크, 해수욕장 피서지 지도",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://map.weknews.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <SummerMapWrapper />

      <noscript>
        <div className="sr-only">
          <h2>전국 물놀이 피서지 명소 목록</h2>
          <ul>
            {places.map((place: any) => (
              <li key={place.id}>
                <h3>{place.name}</h3>
                <p>{place.description}</p>
                <p>유형: {place.type}</p>
                <p>키워드: {place.tags?.join(", ")}</p>
                <p>개장일: {place.openDate}</p>
                <p>요금: {place.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
