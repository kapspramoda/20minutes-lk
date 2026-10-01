// lib/cache.ts

type CacheItem = {
  data: any;
  expiry: number;
};

// සර්වර් එකේ RAM එකේ දත්ත රඳවා ගන්නා තැන
const cache = new Map<string, CacheItem>();

export async function getCachedData(
  key: string,
  fetchFunction: () => Promise<any>,
  ttlSeconds: number = 60 // තත්පර කීයක් RAM එකේ තියාගන්නවාද (පෙරනිමිය තත්පර 60යි)
): Promise<any> {
  const now = Date.now();
  const cached = cache.get(key);

  // 1. Cache එකේ දත්ත තියෙනවා නම් සහ කල් ඉකුත් වී නැත්නම්, ඩේටාබේස් එකට නොගොස් කෙලින්ම දත්ත දෙන්න
  if (cached && cached.expiry > now) {
    console.log(`⚡ RAM එකෙන් දත්ත ලබා ගත්තා: ${key}`);
    return cached.data;
  }

  // 2. Cache එකේ නැත්නම්, ඩේටාබේස් එකෙන් අරන් එන්න
  console.log(`🛢️️ Database එකෙන් දත්ත ලබා ගත්තා: ${key}`);
  const freshData = await fetchFunction();
  
  // 3. අරන් ආපු දත්ත ටික ඊළඟ අය වෙනුවෙන් RAM එකේ සේව් කරන්න
  cache.set(key, {
    data: freshData,
    expiry: now + ttlSeconds * 1000,
  });

  return freshData;
}

// අලුත් දත්තයක් ඇතුළත් කළ විට පරණ Cache එක මකා දැමීමට
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}