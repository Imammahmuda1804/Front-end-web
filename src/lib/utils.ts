import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve a relative image path from the backend into an absolute URL.
 * Used by Next/Image across the app (profile pictures, destination galleries, etc.).
 *
 * - Returns empty string for nullish / empty input so <Image src=""> short-circuits.
 * - Pass-through when the value already starts with http:// or https://.
 * - Falls back to NEXT_PUBLIC_API_URL (or http://localhost:3000) for relative paths,
 *   matching the convention used in lib/axios.ts and the various page-level fetchers.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Unwrap backend response that may be wrapped in `{ status: "success", data: T }`.
 * Handles both flattened and nested shapes from the TransformInterceptor.
 */
export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** Bersihkan nama topik dari prefix teknis model seperti "Topic 1: ..." */
export function cleanTopicName(name?: string) {
  return name?.replace(/^Topic \d+:\s*/, '').trim() || 'Topik perjalanan';
}
