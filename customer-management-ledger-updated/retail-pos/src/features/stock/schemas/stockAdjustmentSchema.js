import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  warehouse_id: z.string().min(1, "Warehouse is required"),
  movement_type: z.enum(["adjustment", "damage"]),
  quantity: z.coerce.number().refine((value) => value !== 0, "Quantity cannot be zero"),
  notes: z.string().trim().min(3, "Reason is required").max(500),
}).superRefine((values, context) => {
  if (values.movement_type === "damage" && values.quantity > 0) {
    context.addIssue({ code: "custom", path: ["quantity"], message: "Damage quantity must be negative" });
  }
});
