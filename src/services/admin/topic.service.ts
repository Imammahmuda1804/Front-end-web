import { api } from '@/lib/axios';

export interface TopicItem {
  id: number;
  topic_name: string;
  keywords: string[];
  total_destinations: number;
}

export interface AiRenameResult {
  renamed: number;
  failed: number;
  total: number;
}

class AdminTopicService {
  async getTopics(): Promise<TopicItem[]> {
    const response = await api.get('/api/topics');
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

  async triggerAiRename(): Promise<AiRenameResult> {
    const response = await api.post('/api/topics/rename-ai');
    return response.data?.data || response.data;
  }
}

export const adminTopicService = new AdminTopicService();
