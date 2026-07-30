import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(150),
  sku: z.string().trim().min(2, "SKU is required").max(50),
  barcode: z.string().trim().max(100).optional().or(z.literal("")),
  category_id: z.string().min(1, "Category is required"),
  brand_id: z.string().optional().or(z.literal("")),
  unit_id: z.string().min(1, "Unit is required"),
  cost_price: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  wholesale_price: z.coerce.number().min(0),
  minimum_stock: z.coerce.number().min(0),
  opening_stock: z.coerce.number().min(0),
  status: z.boolean(),
}).refine((values) => values.sale_price >= values.cost_price, {
  message: "Sale price must be greater than or equal to cost price",
  path: ["sale_price"],
});
