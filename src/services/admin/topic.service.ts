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

export interface AiRenameResult {
  renamed: number;
  failed: number;
  total: number;
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

  async triggerAiRename(): Promise<AiRenameResult> {
    const response = await api.post('/api/topics/rename-ai');
    return response.data?.data || response.data;
  }
}

export const adminTopicService = new AdminTopicService();
