import * as z from "zod";

export const destinationSchema = z.object({
  name: z.string().min(2, "Nama destinasi minimal 2 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  googleMapsUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')),
  googlePlaceId: z.string().optional().or(z.literal('')),
  youtubeUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')),
});

export type DestinationFormValues = z.infer<typeof destinationSchema>;
