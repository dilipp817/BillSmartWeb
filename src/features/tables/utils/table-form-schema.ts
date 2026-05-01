import { z } from "zod";

import { TableStatus } from "@/constants";

/**
 * Zod schema for the Add/Edit Table form (T-04).
 *
 * Mirrors CreateTableRequest / UpdateTableRequest from ../types.
 * z.coerce.number() is used for capacity and floor because HTML number
 * inputs always deliver strings; coercion converts them before validation.
 */
export const tableFormSchema = z.object({
  table_number: z
    .string()
    .min(1, "Table number is required")
    .max(20, "Table number must be at most 20 characters"),

  capacity: z.coerce
    .number({ error: "Capacity must be a number" })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(50, "Capacity must be at most 50"),

  floor: z.coerce
    .number({ error: "Floor must be a number" })
    .int("Floor must be a whole number")
    .min(0, "Floor must be 0 or greater")
    .max(99, "Floor must be at most 99"),

  status: z.nativeEnum(TableStatus),
});

export type TableFormValues = z.infer<typeof tableFormSchema>;
