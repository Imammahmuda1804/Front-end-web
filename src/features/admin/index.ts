export { UsersClient } from './components/users/UsersClient';
export { AdminReviewsClient } from './components/reviews/AdminReviewsClient';
export { DestinationsTable } from './components/destinations/destinations-table';

// Service & tipe admin destination dipakai lintas-fitur (scraper, topics, nlp, analytics, reviews)
export {
  adminDestinationService,
  type AdminDestination,
  type DestinationListResponse,
  type DestinationData,
  type DestinationQueryParams,
} from './services/destination.service';

export type { DestinationImage } from '@/features/destination/components/detail.types';

// Service & tipe admin user
export {
  adminUserService,
  type AdminUser,
  type AdminUpdateUserData,
  type AdminUserDetail,
} from './services/user.service';

// Service & tipe admin reviews
export {
  adminReviewsService,
  type Review,
  type GetAdminReviewsResponse,
  type GetAdminReviewsParams,
} from './services/reviews.service';
