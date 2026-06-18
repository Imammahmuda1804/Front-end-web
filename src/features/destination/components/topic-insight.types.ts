export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
}

export interface TopicData {
  id: number;
  totalReviews: number;
  topic: {
    id: number;
    topicName: string;
    keywords: string[] | null;
  };
  isGroup?: boolean;
  fineTopics?: Array<{ id: number; topicName: string; totalReviews: number }>;
  groupSentimentBreakdown?: SentimentBreakdown;
}

export interface TopicGroupData {
  groupId: number;
  groupName: string;
  totalReviews: number;
  sentimentBreakdown: SentimentBreakdown;
  topics: Array<{ id: number; topicName: string; totalReviews: number }>;
}

export type FineTopicDetail = {
  id: number;
  topicName: string;
  totalReviews: number;
  groupName?: string;
};

export interface TopicReview {
  id: number;
  reviewerName: string;
  reviewText: string | null;
  rating: number | null;
  reviewDate: string | null;
  sentiment: string | null;
  likesCount: number | null;
  topicAssignments?: TopicReviewAssignment[];
}

export interface TopicReviewAssignment {
  topicId: number;
  score: number;
  isPrimary: boolean;
  assignmentMethod: string;
}
