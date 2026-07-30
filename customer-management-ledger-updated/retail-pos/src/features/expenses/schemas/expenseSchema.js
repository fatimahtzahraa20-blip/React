import { z } from "zod";
export const expenseSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  expense_date: z.string().min(1),
  amount: z.coerce.number().positive(),
  payment_method: z.enum(["cash", "bank"]),
  description: z.string().trim().min(3).max(500),
});
