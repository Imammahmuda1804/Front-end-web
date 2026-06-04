import type { CategoryOption, SearchMode, SemanticSort } from './search.types';

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const panelMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const railMotion = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
};

export const subscribeToHydration = () => () => {};
export const getHydratedSnapshot = () => true;
export const getServerHydratedSnapshot = () => false;

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
