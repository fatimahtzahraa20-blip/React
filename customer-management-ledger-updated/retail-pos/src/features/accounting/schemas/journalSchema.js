import { z } from "zod";

export const journalSchema = z.object({
  transaction_date: z.string().min(1),
  description: z.string().trim().min(3),
  reference: z.string().optional(),
  items: z.array(z.object({
    account_id: z.string().min(1),
    debit: z.coerce.number().min(0),
    credit: z.coerce.number().min(0),
  })).min(2),
}).superRefine((value, context) => {
  const debit = value.items.reduce((sum, item) => sum + item.debit, 0);
  const credit = value.items.reduce((sum, item) => sum + item.credit, 0);
  if (debit <= 0 || Math.abs(debit - credit) > 0.005) context.addIssue({ code: "custom", path: ["items"], message: "Total debit and credit must be equal" });
});
