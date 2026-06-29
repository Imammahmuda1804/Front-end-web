import { api } from '@/lib/axios';
import { DESTINATION_CATEGORIES } from '@/lib/destination-categories';
import type { CategoryOption, SearchHistoryItem } from '../types/search.types';
import { normalizeCategoryOptions } from '../utils/search.utils';

export async function fetchSearchCities() {
  const res = await api.get('/api/destinations/cities');
  const raw = res.data?.data;
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list as string[];
}

export async function fetchSearchCategories(): Promise<CategoryOption[]> {
  const res = await api.get('/api/destinations/categories');
  const raw = res.data?.data ?? res.data;
  const normalized = normalizeCategoryOptions(raw);
  return normalized.length > 0 ? normalized : [...DESTINATION_CATEGORIES];
}

export async function fetchSearchHistory() {
  const res = await api.get('/api/search/history');
  return (res.data.data || []) as SearchHistoryItem[];
}

export async function deleteSearchHistoryItem(id: number) {
  await api.delete(`/api/search/history/${id}`);
}

export async function clearSearchHistory() {
  await api.delete('/api/search/history');
}

export async function executeSemanticSearch(payload: any) {
  const res = await api.post('/api/search', payload);
  return res.data;
}

export async function executeKeywordSearch(params: any) {
  const res = await api.get('/api/destinations', { params });
  return res.data;
}
