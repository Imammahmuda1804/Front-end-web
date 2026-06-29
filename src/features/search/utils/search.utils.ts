import type { CategoryOption, SearchMode, SemanticSort } from '../types/search.types';

export const isSearchMode = (value: string | null): value is SearchMode =>
  value === 'keyword' || value === 'semantic';

export const isSemanticSort = (value: string | null): value is SemanticSort =>
  value === 'relevance' || value === 'hybrid';

export function normalizeCategoryOptions(list: unknown): CategoryOption[] {
  const rawList = Array.isArray(list)
    ? list
    : typeof list === 'object' && list !== null && Array.isArray((list as { data?: unknown }).data)
      ? (list as { data: unknown[] }).data
      : [];

  return rawList
    .map((item) => {
      const raw = item as { value?: unknown; label?: unknown };
      return {
        value: String(raw?.value ?? ''),
        label: String(raw?.label ?? raw?.value ?? ''),
      };
    })
    .filter((item) => item.value && item.label);
}
