import { z } from "zod";

/**
 * Zod schema for the Add/Edit Food form (M-05).
 *
 * Mirrors CreateFoodRequest / UpdateFoodRequest from ../types.
 * z.coerce.number() is used for price and category_id because HTML inputs
 * always deliver strings; coercion converts them before validation runs.
 */
export const foodFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),

  price: z.coerce
    .number({ error: "Price must be a number" })
    .positive("Price must be positive")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v.toString()), "Max 2 decimal places"),

  category_id: z.coerce
    .number({ error: "Please select a category" })
    .int()
    .min(1, "Please select a category"),

  is_vegetarian: z.boolean(),
  is_spicy: z.boolean(),

  description: z.string().optional(),

  // Allow empty string (cleared input) as well as a valid URL or null
  image_url: z
    .string()
    .url("Must be a valid URL (e.g. https://…)")
    .or(z.literal(""))
    .optional()
    .nullable(),
});

export type FoodFormValues = z.infer<typeof foodFormSchema>;
