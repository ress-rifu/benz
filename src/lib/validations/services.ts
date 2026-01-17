import { z } from "zod";

// Service Category Schema
export const serviceCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    name_bn: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    is_active: z.boolean(),
});

export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;

// Service Schema
export const serviceSchema = z.object({
    category_id: z.string().uuid("Please select a category"),
    name: z.string().min(1, "Name is required").max(100),
    name_bn: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    price: z.number().min(0, "Price must be 0 or greater"),
    duration_minutes: z.number().int().min(0).optional().nullable(),
    is_active: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
