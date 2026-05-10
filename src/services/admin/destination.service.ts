import { api } from "@/lib/axios";

export interface DestinationData {
  name: string;
  description: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
}

export const adminDestinationService = {
  getDestinations: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get("/api/admin/destinations", { params });
    return data;
  },

  createDestination: async (destinationData: DestinationData) => {
    const { data } = await api.post("/api/admin/destinations", destinationData);
    return data;
  },

  updateDestination: async (id: number | string, destinationData: Partial<DestinationData>) => {
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
    for (const file of files) {
      const result = await adminDestinationService.uploadGalleryImage(id, file);
      results.push(result);
    }
    return results;
  },

  deleteDestinationImage: async (imageId: number | string) => {
    const { data } = await api.delete(`/api/admin/destinations/images/${imageId}`);
    return data;
  },
};
