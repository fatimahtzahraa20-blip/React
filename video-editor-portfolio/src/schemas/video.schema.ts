import { z } from "zod";

export const videoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must contain at least 2 characters.")
    .max(150, "Title must not exceed 150 characters."),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must contain at least 2 characters.")
    .max(150, "Slug must not exceed 150 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters.")
    .max(3000, "Description must not exceed 3000 characters."),

  video_url: z
    .string()
    .trim()
    .url("Please enter a valid video URL."),

  thumbnail_url: z
    .string()
    .trim()
    .url("Please enter a valid thumbnail URL."),

  video_source: z.enum([
    "youtube",
    "vimeo",
    "google_drive",
    "direct",
  ]),

  category_id: z
    .string()
    .min(1, "Please select a category."),

  subcategory_id: z
    .string()
    .optional()
    .nullable(),

  featured: z.boolean(),

  views: z
    .number()
    .int("Views must be a whole number.")
    .min(0, "Views cannot be negative."),

  display_order: z
    .number()
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative."),

  tags: z.array(
    z
      .string()
      .trim()
      .min(1, "Tag cannot be empty.")
      .max(50, "Each tag must not exceed 50 characters.")
  ),
});

export type VideoFormValues = z.infer<typeof videoSchema>;