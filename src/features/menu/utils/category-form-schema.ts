import { z } from "zod";

/**
 * Zod schema for the Add/Edit Category form (M-06).
 *
 * Mirrors CreateCategoryRequest / UpdateCategoryRequest from ../types.
 * z.coerce.number() is used for display_order because HTML number inputs
 * always deliver strings; coercion converts them before validation runs.
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  description: z.string().optional(),

  // Allow empty string (cleared input) as well as a valid URL or null
  image_url: z
    .string()
    .url("Must be a valid URL (e.g. https://…)")
    .or(z.literal(""))
    .optional()
    .nullable(),

  display_order: z.coerce
    .number({ error: "Display order must be a number" })
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
