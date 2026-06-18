export interface DestinationImage {
  id: number;
  imageUrl: string;
}

export interface SentimentTrend {
  id: number;
  date: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positiveRatio: number;
}

export interface DestinationTopic {
  id: number;
  totalReviews?: number;
  topic: {
    id: number;
    topicName: string;
    keywords: string[] | null;
  };
}

export interface UserReview {
  id: number;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
}

export interface TopicGroupData {
  groupId: number;
  groupName: string;
  totalReviews: number;
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
  topics: Array<{
    id: number;
    topicName: string;
    totalReviews: number;
  }>;
}

export interface DestinationDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId?: string | null;
  googleMapsUrl: string;
  youtubeUrl?: string | null;
  thumbnailUrl: string;
  thumbnail_url?: string;
  googleRating: number | null;
  googleReviewCount: number | null;
  userRating: number | null;
  positiveRatio: number | null;
  recommendationScore: number | null;
  images: DestinationImage[];
  sentimentTrends: SentimentTrend[];
  destinationTopics: DestinationTopic[];
  userReviews: UserReview[];
  averageUserRating: number | null;
  totalUserReviews: number;
  scrapedAverageRating: number | null;
  scrapedReviewCount: number | null;
  topicSentimentBreakdown?: Record<number, { positive: number; negative: number; neutral: number }>;
  topicGroups?: TopicGroupData[];
}

export interface NearbyDestination {
  id: number;
  name: string;
  slug: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export type ChartRow = {
  name: string;
  Positif: number;
  Netral: number;
  Negatif: number;
  total: number;
};
