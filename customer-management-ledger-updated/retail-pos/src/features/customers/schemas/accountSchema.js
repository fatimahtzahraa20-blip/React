import { z } from "zod";

export const accountSchema = z.object({

    account_name: z.string().min(3),

    account_type: z.string(),

    opening_balance: z.coerce.number(),

    status: z.boolean()

});