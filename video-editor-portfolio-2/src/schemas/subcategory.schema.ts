import { z } from "zod";

export const subCategorySchema = z.object({
  category_id: z
    .string()
    .min(1, "Please select a category."),

  name: z
    .string()
    .trim()
    .min(2, "Subcategory name must contain at least 2 characters.")
    .max(100, "Subcategory name must not exceed 100 characters."),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must contain at least 2 characters.")
    .max(100, "Slug must not exceed 100 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),
});

export type SubCategoryFormValues = z.infer<
  typeof subCategorySchema
>;