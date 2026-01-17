import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email().optional().nullable().or(z.literal("")),
    phone: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    is_active: z.boolean(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
