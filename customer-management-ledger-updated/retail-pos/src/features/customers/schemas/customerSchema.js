import { z } from "zod";

export const customerSchema = z.object({

    name: z
        .string()
        .min(3, "Customer name is required"),

    phone: z
        .string()
        .min(11, "Phone number is required"),

    email: z
        .string()
        .email("Invalid Email")
        .optional()
        .or(z.literal("")),

    address: z
        .string()
        .optional(),

    opening_balance: z
        .coerce
        .number(),

    credit_limit: z
        .coerce
        .number(),

    status: z.boolean()

});