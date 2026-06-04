export async function getPlaces() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
        
        const res = await fetch("https://script.google.com/macros/s/AKfycbzcgqdSvU52oNz9Q7etD3fqy6AzquqS5IqwavCqLT9JA4t9rUCxlRazFg2Cn-WX5Py76g/exec", { 
            next: { revalidate: 3600 },
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Failed to load map data", err);
        return [];
    }
}
