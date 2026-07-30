import { z } from "zod";

export const supplierSchema = z.object({

    name: z
        .string()
        .min(3, "Supplier name is required"),

    phone: z
        .string()
        .min(10, "Phone number is required"),

    email: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),

    address: z
        .string()
        .optional(),

    opening_balance: z.coerce
        .number()
        .min(0),

    credit_limit: z.coerce
        .number()
        .min(0),

    notes: z
        .string()
        .optional(),

    status: z.boolean()

});