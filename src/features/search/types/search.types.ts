import type { SearchDestination } from '../components/SearchResultCard';

export type Destination = SearchDestination;

export interface SearchHistoryItem {
  id?: number;
  keyword: string;
  createdAt?: string;
}

export type SearchMode = 'keyword' | 'semantic';
export type SemanticSort = 'relevance' | 'hybrid';
export type CategoryOption = { value: string; label: string };
export type RawCategoryOption = { value?: unknown; label?: unknown };
export type DestinationSearchParams = {
  limit: number;
  search?: string;
  city?: string;
  category?: string;
};
