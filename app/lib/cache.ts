// ============================================================
//  SciaSource — LocalStorage レスポンスキャッシュ
//  同一の「質問 × 設定」の組み合わせでは API を再呼び出しせず
//  24 時間有効なキャッシュをローカルに保持してトークン消費をゼロにする
// ============================================================

import type { PredictResponse } from "@/app/types";
import type { ThreadSettings } from "@/app/types/chat";
import type { Lang } from "@/app/types";

const CACHE_PREFIX = "scia_v1_";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 時間

// ── FNV-1a 32bit ハッシュ（外部ライブラリ不要・超高速） ──
function fnv1a(str: string): string {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36);
}

/** キャッシュキーを生成する。ageGroup は除外（同質問内でのバリエーションが少ない）*/
export function buildCacheKey(
  question: string,
  settings: Pick<ThreadSettings, "userTypeIdx" | "showSources" | "showChart" | "researchDepth" | "plan">,
  lang: Lang
): string {
  const payload = JSON.stringify({
    q: question.trim(),
    u: settings.userTypeIdx,
    s: settings.showSources,
    c: settings.showChart,
    d: settings.researchDepth,
    p: settings.plan,
    l: lang,
  });
  return CACHE_PREFIX + fnv1a(payload);
}

interface CacheEntry {
  data: PredictResponse;
  ts: number;
}

/** キャッシュから取得。期限切れ or 未存在の場合は null */
export function getCache(key: string): PredictResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as CacheEntry;
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** キャッシュに保存。フォールバックレスポンスは保存しない */
export function setCache(key: string, data: PredictResponse): void {
  if (typeof window === "undefined") return;
  if (data.isFallback) return; // デモデータはキャッシュしない
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry));
  } catch {
    // Quota Exceeded → 古いエントリを全削除してリトライ
    clearSciaCache();
    try {
      localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry));
    } catch { /* サイレント失敗 */ }
  }
}

/** SciaSource のキャッシュエントリを全削除 */
export function clearSciaCache(): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch { /* サイレント失敗 */ }
}

/** キャッシュ件数を返す（UI バッジ表示用） */
export function getCacheCount(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(CACHE_PREFIX)) count++;
    }
  } catch {}
  return count;
}
