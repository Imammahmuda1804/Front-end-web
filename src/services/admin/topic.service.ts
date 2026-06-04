import { api } from '@/lib/axios';

export interface TopicItem {
  id: number;
  topic_name: string;
  keywords: string[];
  total_destinations: number;
  group_id?: number | null;
  group_name?: string | null;
  label_type?: string;
  is_search_visible?: boolean;
  is_detail_visible?: boolean;
}

export interface TopicGroupItem {
  id: number;
  group_name: string;
  description?: string | null;
  keywords?: string[];
  display_order?: number;
  topics?: TopicItem[];
}

export interface TopicGroupPayload {
  groupName: string;
  description?: string;
  keywords?: string[];
  displayOrder?: number;
}

export interface AiRenameResult {
  renamed: number;
  failed: number;
  total: number;
}

export interface MergeTopicsResult {
  merged: boolean;
  target_topic_id: number;
  target_topic_name: string;
  source_topic_ids: number[];
  deleted_topics: number;
}

export interface TopicDestinationItem {
  id: number;
  name: string;
  slug?: string;
  city?: string;
  province?: string;
  thumbnailUrl?: string | null;
  positiveRatio?: number | null;
  recommendationScore?: number | null;
  total_reviews_in_topic?: number;
}

export interface TopicDestinationsResponse {
  data: TopicDestinationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type TopicReviewSentiment = 'positive' | 'neutral' | 'negative';

export interface TopicReviewItem {
  id: number;
  reviewer_name: string;
  review_text?: string | null;
  rating?: number | null;
  review_date?: string | null;
  sentiment?: string | null;
  sentiment_confidence?: number | null;
  destination: {
    id: number;
    name: string;
    slug?: string;
    city?: string;
    province?: string;
    thumbnailUrl?: string | null;
  };
}

export interface TopicReviewsResponse {
  topic: {
    id: number;
    topic_name: string;
    group?: { id: number; group_name: string } | null;
  };
  sentiment_summary: {
    positive: number;
    neutral: number;
    negative: number;
    unknown: number;
  };
  data: TopicReviewItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Service API untuk manajemen topik dan topic group.
class AdminTopicService {
  async getTopics(): Promise<TopicItem[]> {
    const response = await api.get('/api/topics');
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData : [];
  }

  async getTopicGroups(): Promise<TopicGroupItem[]> {
    const response = await api.get('/api/topics/groups');
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData : [];
  }

  async renameTopic(id: number, topicName: string): Promise<{ id: number; topicName: string }> {
    const response = await api.put(`/api/topics/${id}/rename`, { topicName });
    return response.data?.data || response.data;
  }

  async mergeTopics(targetTopicId: number, sourceTopicIds: number[]): Promise<MergeTopicsResult> {
    const response = await api.post('/api/topics/merge', { targetTopicId, sourceTopicIds });
    return response.data?.data || response.data;
  }

  async deleteTopic(id: number): Promise<{ deleted: boolean; id: number }> {
    const response = await api.delete(`/api/topics/${id}`);
    return response.data?.data || response.data;
  }

  async updateTopicSettings(
    id: number,
    data: {
      groupId?: number | null;
      isSearchVisible?: boolean;
      isDetailVisible?: boolean;
    },
  ): Promise<TopicItem> {
    const response = await api.put(`/api/topics/${id}/settings`, data);
    return response.data?.data || response.data;
  }

  async renameGroup(id: number, groupName: string): Promise<TopicGroupItem> {
    const response = await api.put(`/api/topics/groups/${id}/rename`, { groupName });
    return response.data?.data || response.data;
  }

  async createGroup(data: TopicGroupPayload): Promise<TopicGroupItem> {
    const response = await api.post('/api/topics/groups', data);
    return response.data?.data || response.data;
  }

  async updateGroup(id: number, data: TopicGroupPayload): Promise<TopicGroupItem> {
    const response = await api.put(`/api/topics/groups/${id}`, data);
    return response.data?.data || response.data;
  }

  async deleteGroup(id: number): Promise<{ deleted: boolean; id: number; group_name: string }> {
    const response = await api.delete(`/api/topics/groups/${id}`);
    return response.data?.data || response.data;
  }

  async triggerAiRename(): Promise<AiRenameResult> {
    const response = await api.post('/api/topics/rename-ai');
    return response.data?.data || response.data;
  }

  async getTopicDestinations(id: number, page = 1, limit = 10): Promise<TopicDestinationsResponse> {
    const response = await api.get(`/api/topics/${id}/destinations`, {
      params: { page, limit },
    });
    return response.data?.data && response.data?.meta
      ? response.data
      : response.data?.data || response.data;
  }

  async getTopicReviews(
    id: number,
    params?: {
      page?: number;
      limit?: number;
      sentiment?: TopicReviewSentiment;
      destinationId?: number;
    },
  ): Promise<TopicReviewsResponse> {
    const response = await api.get(`/api/admin/topics/${id}/reviews`, {
      params,
    });
    return response.data?.data && response.data?.meta
      ? response.data
      : response.data?.data || response.data;
  }
}

export const adminTopicService = new AdminTopicService();
