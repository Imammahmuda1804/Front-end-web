import { api } from "@/lib/axios";

export interface DestinationImage {
  id: number;
  imageUrl: string;
}

export interface DestinationData {
  name: string;
  description: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  googleRating?: number;
  googleReviewCount?: number;
}

export interface AdminDestination extends DestinationData {
  id: number;
  slug?: string;
  userRating?: number | null;
  positiveRatio?: number | null;
  recommendationScore?: number | null;
  images?: DestinationImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DestinationListResponse {
  data: AdminDestination[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type DestinationQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type FileTooLargeError = Error & {
  isFileTooLarge: true;
  failedFiles: string[];
  successCount: number;
};

function getHttpStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const maybeError = error as { response?: { status?: number }; status?: number };
  return maybeError.response?.status || maybeError.status;
}

export const adminDestinationService = {
  getDestinations: async (params?: DestinationQueryParams): Promise<DestinationListResponse> => {
    const { data } = await api.get("/api/admin/destinations", { params });
    return data;
  },

  createDestination: async (destinationData: DestinationData): Promise<AdminDestination | { data: AdminDestination }> => {
    const { data } = await api.post("/api/admin/destinations", destinationData);
    return data;
  },

  updateDestination: async (id: number | string, destinationData: Partial<DestinationData>): Promise<AdminDestination> => {
    const { data } = await api.put(`/api/admin/destinations/${id}`, destinationData);
    return data;
  },

  deleteDestination: async (id: number | string) => {
    const { data } = await api.delete(`/api/admin/destinations/${id}`);
    return data;
  },

  // Upload thumbnail (cover) — single file → updates destination.thumbnailUrl
  uploadThumbnail: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/api/admin/destinations/${id}/thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Upload gallery image — single file → creates DestinationImage record
  uploadGalleryImage: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/api/admin/destinations/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Upload multiple gallery images
  uploadGalleryImages: async (id: number | string, files: File[]) => {
    const results = [];
    const failedFiles: string[] = [];
    for (const file of files) {
      try {
        const result = await adminDestinationService.uploadGalleryImage(id, file);
        results.push(result);
      } catch (err: unknown) {
        const status = getHttpStatus(err);
        if (status === 413) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          failedFiles.push(`${file.name} (${sizeMB} MB)`);
        } else {
          throw err; // rethrow non-413 errors
        }
      }
    }
    if (failedFiles.length > 0) {
      const error = new Error(
        `${failedFiles.length} gambar terlalu besar dan gagal diunggah: ${failedFiles.join(', ')}. Maksimal ukuran file adalah 5 MB.`
      ) as FileTooLargeError;
      error.isFileTooLarge = true;
      error.failedFiles = failedFiles;
      error.successCount = results.length;
      throw error;
    }
    return results;
  },

  deleteDestinationImage: async (imageId: number | string) => {
    const { data } = await api.delete(`/api/admin/destinations/images/${imageId}`);
    return data;
  },

  scrapeDestination: async (id: number | string, payload?: { max_reviews?: number; maps_url?: string }) => {
    const { data } = await api.post(`/api/admin/destinations/${id}/scrape`, {
      max_reviews: payload?.max_reviews ?? 100,
      maps_url: payload?.maps_url,
    });
    return data;
  },
};
