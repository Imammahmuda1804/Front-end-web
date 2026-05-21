import * as z from "zod";
import { DESTINATION_CATEGORIES } from "@/lib/destination-categories";

const categoryValues = DESTINATION_CATEGORIES.map((category) => category.value) as [string, ...string[]];

export const destinationSchema = z.object({
  name: z.string().min(2, "Nama destinasi minimal 2 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
  category: z.enum(categoryValues, {
    message: "Pilih kategori destinasi",
  }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  googleMapsUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')),
  youtubeUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')),
  googleRating: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number()
      .min(1, "Rating minimal 1.0")
      .max(5, "Rating maksimal 5.0")
      .optional()
  ),
  googleReviewCount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number()
      .int("Jumlah ulasan harus bilangan bulat")
      .min(0, "Jumlah ulasan tidak boleh negatif")
      .optional()
  ),
});

export type DestinationFormValues = z.infer<typeof destinationSchema>;
