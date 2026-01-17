import { z } from "zod";

// Part Category Schema
export const partCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    name_bn: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    is_active: z.boolean().default(true),
});

export type PartCategoryInput = z.infer<typeof partCategorySchema>;

// Part Brand Schema
export const partBrandSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    country_of_origin: z.string().max(100).optional().nullable(),
    is_active: z.boolean().default(true),
});

export type PartBrandInput = z.infer<typeof partBrandSchema>;

// Part Schema
export const partSchema = z.object({
    category_id: z.string().uuid("Please select a category"),
    brand_id: z.string().uuid().optional().nullable(),
    name: z.string().min(1, "Name is required").max(200),
    name_bn: z.string().max(200).optional().nullable(),
    sku: z.string().min(1, "SKU is required").max(50),
    part_number: z.string().max(100).optional().nullable(),
    quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
    cost_price: z.number().min(0, "Cost price must be 0 or greater"),
    selling_price: z.number().min(0, "Selling price must be 0 or greater"),
    min_stock_level: z.number().int().min(0).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    compatible_vehicles: z.array(z.string()).optional().nullable(),
    is_active: z.boolean(),
});

export type PartInput = z.infer<typeof partSchema>;

// Stock Adjustment Schema for Parts
export const partStockAdjustmentSchema = z.object({
    part_id: z.string().uuid(),
    action: z.enum(["add", "remove", "adjust"]),
    quantity: z.number().int().min(0, "Quantity must be positive"),
    reason: z.string().max(500).optional().nullable(),
});

export type PartStockAdjustmentInput = z.infer<typeof partStockAdjustmentSchema>;
