import { z } from "zod";

/**
 * Zod schema for the Restaurant Settings form (S-03).
 *
 * Mirrors UpdateRestaurantRequest from ../types.
 * Validates all fields the backend requires — all are mandatory.
 */
export const restaurantFormSchema = z.object({
  outlet_name: z
    .string()
    .min(2, "Outlet name must be at least 2 characters")
    .max(255, "Outlet name must be at most 255 characters"),

  displayname: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(255, "Display name must be at most 255 characters"),

  outlet_manager: z
    .string()
    .min(2, "Manager name must be at least 2 characters")
    .max(255, "Manager name must be at most 255 characters"),

  building: z.string().min(1, "Building is required"),

  street: z.string().min(1, "Street is required"),

  location: z.string().min(1, "City / area is required"),

  zip_code: z
    .string()
    .min(4, "Zip code must be at least 4 characters")
    .max(10, "Zip code must be at most 10 characters"),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
